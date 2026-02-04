// ============================================
// DATABASE TYPES
// ============================================

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  github_username: string | null
  created_at: string
  updated_at: string
}

export interface Theme {
  id: string
  author_id: string
  name: string
  slug: string
  description: string | null
  verbs: string[]
  tags: string[]
  cover_color: string
  is_published: boolean
  is_featured: boolean
  forked_from: string | null
  download_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface ThemeVersion {
  id: string
  theme_id: string
  version: number
  verbs: string[]
  changelog: string | null
  created_at: string
}

export interface Like {
  user_id: string
  theme_id: string
  created_at: string
}

export interface Comment {
  id: string
  theme_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CollectionTheme {
  collection_id: string
  theme_id: string
  position: number
  added_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: 'publish' | 'like' | 'follow' | 'comment' | 'fork' | 'download'
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string | null
  icon: string | null
  criteria: Record<string, unknown>
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  earned_at: string
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface ThemeWithAuthor extends Theme {
  author: Profile
  like_count?: number
  comment_count?: number
  is_liked?: boolean
}

export interface CommentWithUser extends Comment {
  user: Profile
  replies?: CommentWithUser[]
}

export interface ProfileWithStats extends Profile {
  theme_count: number
  follower_count: number
  following_count: number
  total_downloads: number
  is_following?: boolean
}

export interface CollectionWithThemes extends Collection {
  themes: ThemeWithAuthor[]
  theme_count: number
}

export interface ActivityWithDetails extends Activity {
  user: Profile
  theme?: Theme
  target_user?: Profile
}

// ============================================
// API TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ============================================
// AI GENERATION TYPES
// ============================================

export interface GenerateThemeRequest {
  prompt: string
  count?: number
}

export interface GenerateThemeResponse {
  verbs: string[]
  name: string
  description: string
  tags: string[]
}

export interface SuggestVerbsRequest {
  existingVerbs: string[]
  count?: number
  style?: string
}

export interface SuggestVerbsResponse {
  suggestions: string[]
}

export interface RefineVerbRequest {
  verb: string
  style: string
  context?: string
}

export interface RefineVerbResponse {
  refined: string
  alternatives: string[]
}

// ============================================
// THEME TAGS
// ============================================

export const THEME_TAGS = [
  'funny',
  'professional',
  'gaming',
  'pop-culture',
  'sci-fi',
  'fantasy',
  'nature',
  'food',
  'sports',
  'music',
  'movies',
  'tech',
  'retro',
  'minimalist',
  'chaotic',
  'zen',
  'pirate',
  'space',
  'medieval',
  'cyberpunk',
] as const

export type ThemeTag = typeof THEME_TAGS[number]

// ============================================
// GRADIENT PRESETS
// ============================================

export const GRADIENT_PRESETS = [
  { name: 'Violet Pink', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
  { name: 'Ocean Blue', value: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)' },
  { name: 'Golden', value: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' },
  { name: 'Cotton Candy', value: 'linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)' },
  { name: 'Cyber', value: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)' },
] as const
