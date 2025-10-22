#!/bin/bash
# Prepare photos for Cloudinary upload
# Resizes large JPEGs to web-friendly sizes while maintaining quality
# Creates album JSON manifest

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./cloudinary-ready}"
MAX_WIDTH=4000
QUALITY=85

echo "📸 Preparing photos for Cloudinary..."
echo ""

# Interactive questions for album metadata
read -p "Album title: " ALBUM_TITLE
read -p "Album slug (URL-friendly, e.g., 'my-trip-2025'): " ALBUM_SLUG
read -p "Album description: " ALBUM_DESCRIPTION
read -p "Publication date (YYYY-MM-DD, default: today): " PUB_DATE
read -p "Cloudinary folder path (e.g., 'reuben/queens-farm'): " CLOUDINARY_FOLDER

# Default to today's date if not provided
if [ -z "$PUB_DATE" ]; then
    PUB_DATE=$(date +%Y-%m-%d)
fi

echo ""
echo "Input: $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with: brew install imagemagick"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Process all images and build JSON items array
count=0
json_items=""
shopt -s nullglob

# First, sort files alphabetically
files=("$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg "$INPUT_DIR"/*.JPG "$INPUT_DIR"/*.JPEG "$INPUT_DIR"/*.png "$INPUT_DIR"/*.PNG)
IFS=$'\n' sorted_files=($(sort <<<"${files[*]}"))
unset IFS

for img in "${sorted_files[@]}"; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    # Remove extension for numbering
    name_without_ext="${filename%.*}"
    output="$OUTPUT_DIR/$filename"
    
    # Get original size
    original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
    original_mb=$(echo "scale=2; $original_size / 1048576" | bc)
    
    echo "Processing: $filename (${original_mb}MB)"
    
    # Resize and compress
    convert "$img" \
        -resize ${MAX_WIDTH}x${MAX_WIDTH}\> \
        -quality $QUALITY \
        -strip \
        "$output"
    
    # Get new size
    new_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
    new_mb=$(echo "scale=2; $new_size / 1048576" | bc)
    saved=$(echo "scale=1; ($original_size - $new_size) / $original_size * 100" | bc)
    
    echo "  ✓ Saved ${saved}% → ${new_mb}MB"
    echo ""
    
    # Build JSON item using folder path + filename (no suffix needed)
    public_id="${CLOUDINARY_FOLDER}/${name_without_ext}"
    
    # Add comma before item if not first
    if [ $count -gt 0 ]; then
        json_items="${json_items},"
    fi
    
    json_items="${json_items}
    {
      \"publicId\": \"${public_id}\",
      \"caption\": \"${name_without_ext}\"
    }"
    
    ((count++))
done

echo "✅ Processed $count images"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Create album JSON manifest
if [ $count -gt 0 ]; then
    MANIFEST_FILE="$OUTPUT_DIR/${ALBUM_SLUG}.json"
    
    # Get first file name (without extension) for cover
    first_file=$(basename "${sorted_files[0]}")
    first_name="${first_file%.*}"
    
    cat > "$MANIFEST_FILE" << EOF
{
  "title": "${ALBUM_TITLE}",
  "slug": "${ALBUM_SLUG}",
  "description": "${ALBUM_DESCRIPTION}",
  "pubDate": "${PUB_DATE}",
  "coverPublicId": "${CLOUDINARY_FOLDER}/${first_name}",
  "items": [${json_items}
  ]
}
EOF
    
    echo "📝 Created album manifest: ${MANIFEST_FILE}"
    echo ""
    echo "Next steps:"
    echo "1. Review images in $OUTPUT_DIR"
    echo "2. Upload images to Cloudinary folder: ${CLOUDINARY_FOLDER}/"
    echo "   - Keep the original filenames (the script has already named them correctly)"
    echo "3. Copy ${ALBUM_SLUG}.json to src/content/albums/"
    echo "4. Your album will be live at: /photos/${ALBUM_SLUG}/"
    echo ""
    echo "✨ The JSON is ready to use! Public IDs include the folder path."
else
    echo "⚠️  No images found in $INPUT_DIR"
fi
