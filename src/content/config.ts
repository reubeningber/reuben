import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional()
  })
});

// Albums store Cloudinary public IDs and captions
const albums = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    coverPublicId: z.string().optional(),
    items: z.array(z.object({
      publicId: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      caption: z.string().optional()
    }))
  })
});

export const collections = { posts, albums };
