import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subTitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCredit: z.string().optional(),
    imageCreditUrl: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    canonicalURL: z.string().optional()
  })
});

const fieldNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    type: z.enum(['link', 'image', 'embed']),
    url: z.string().url().optional(),
    image: z.string().optional(),
    embed: z.string().optional(),
    draft: z.boolean().default(false),
  })
});

export const collections = { posts, 'field-notes': fieldNotes };
