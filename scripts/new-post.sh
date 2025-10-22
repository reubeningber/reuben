#!/bin/bash
# Create a new blog post with interactive prompts
# Generates properly formatted markdown file with frontmatter

POSTS_DIR="src/content/posts"

echo "📝 Creating a new blog post..."
echo ""

# Get post title
read -p "Post title: " POST_TITLE

if [ -z "$POST_TITLE" ]; then
    echo "❌ Title is required"
    exit 1
fi

# Get publication date
read -p "Use today's date? (Y/n): " USE_TODAY
USE_TODAY=${USE_TODAY:-Y}

if [[ "$USE_TODAY" =~ ^[Yy]$ ]]; then
    PUB_DATE=$(date +%Y-%m-%d)
    echo "  Using date: $PUB_DATE"
else
    read -p "Enter date (YYYY-MM-DD): " PUB_DATE
    # Basic validation
    if ! [[ "$PUB_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "❌ Invalid date format. Use YYYY-MM-DD"
        exit 1
    fi
fi

# Get image path
read -p "Image path (e.g., /assets/images/photo.jpg) [optional]: " IMAGE_PATH

# Get category
echo ""
echo "Available categories: Fatherhood, Engineering, Books, Other"
read -p "Category: " CATEGORY

# Create URL-friendly slug from title
SLUG=$(echo "$POST_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Create filename with date and slug
FILENAME="${PUB_DATE}-${SLUG}.md"
FILEPATH="${POSTS_DIR}/${FILENAME}"

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    echo ""
    echo "⚠️  File already exists: $FILEPATH"
    read -p "Overwrite? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

# Create the markdown file with frontmatter
cat > "$FILEPATH" << EOF
---
title: "$POST_TITLE"
pubDate: "$PUB_DATE"
EOF

# Add image if provided
if [ -n "$IMAGE_PATH" ]; then
    echo "image: \"$IMAGE_PATH\"" >> "$FILEPATH"
fi

# Add category if provided
if [ -n "$CATEGORY" ]; then
    echo "category: \"$CATEGORY\"" >> "$FILEPATH"
fi

# Close frontmatter and add starter content
cat >> "$FILEPATH" << 'EOF'
---

Write your post content here...

## First Section

Your content goes here.

## Second Section

More content...

## Final Thoughts

Wrap up your thoughts...

EOF

echo ""
echo "✅ Created new post: $FILEPATH"
echo ""
echo "Next steps:"
echo "1. Open the file and write your content"
echo "2. Remove the draft status when ready to publish"
echo "3. Run 'npm run dev' to preview locally"
echo ""
echo "File location: $FILEPATH"
echo ""
