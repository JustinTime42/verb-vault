import { z } from 'zod'
import { THEME_TAGS } from '../types'

// ============================================
// PROFILE SCHEMAS
// ============================================

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const createProfileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
})

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  avatar_url: z.string().url().optional().nullable(),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ============================================
// THEME SCHEMAS
// ============================================

export const verbSchema = z
  .string()
  .min(1, 'Verb cannot be empty')
  .max(50, 'Verb must be at most 50 characters')
  .refine(
    (val) => val.trim().length > 0,
    'Verb cannot be only whitespace'
  )

export const verbsArraySchema = z
  .array(verbSchema)
  .min(1, 'Theme must have at least 1 verb')
  .max(200, 'Theme can have at most 200 verbs')

export const themeSlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

export const themeTagSchema = z.enum(THEME_TAGS)

export const createThemeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(1000).optional(),
  verbs: verbsArraySchema,
  tags: z.array(themeTagSchema).max(5, 'Maximum 5 tags allowed').optional(),
  cover_color: z.string().optional(),
})

export const updateThemeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  verbs: verbsArraySchema.optional(),
  tags: z.array(themeTagSchema).max(5).optional(),
  cover_color: z.string().optional(),
  is_published: z.boolean().optional(),
})

export const publishThemeSchema = z.object({
  changelog: z.string().max(500).optional(),
})

export type CreateThemeInput = z.infer<typeof createThemeSchema>
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>
export type PublishThemeInput = z.infer<typeof publishThemeSchema>

// ============================================
// COMMENT SCHEMAS
// ============================================

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
  parent_id: z.string().uuid().optional(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

// ============================================
// COLLECTION SCHEMAS
// ============================================

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
})

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  is_public: z.boolean().optional(),
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>

// ============================================
// AI GENERATION SCHEMAS
// ============================================

export const generateThemeSchema = z.object({
  prompt: z
    .string()
    .min(5, 'Prompt must be at least 5 characters')
    .max(500, 'Prompt must be at most 500 characters'),
  count: z.number().int().min(5).max(50).default(15),
})

export const suggestVerbsSchema = z.object({
  existingVerbs: z.array(z.string()).min(1).max(100),
  count: z.number().int().min(1).max(20).default(5),
  style: z.string().max(100).optional(),
})

export const refineVerbSchema = z.object({
  verb: z.string().min(1).max(50),
  style: z.string().min(1).max(100),
  context: z.string().max(200).optional(),
})

export type GenerateThemeInput = z.infer<typeof generateThemeSchema>
export type SuggestVerbsInput = z.infer<typeof suggestVerbsSchema>
export type RefineVerbInput = z.infer<typeof refineVerbSchema>

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const searchThemesSchema = z.object({
  query: z.string().max(100).optional(),
  tags: z.array(themeTagSchema).optional(),
  sort: z.enum(['recent', 'popular', 'downloads', 'trending']).default('recent'),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(50).default(20),
})

export type SearchThemesInput = z.infer<typeof searchThemesSchema>
