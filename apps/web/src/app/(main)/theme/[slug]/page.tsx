import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThemeDetailContent } from './ThemeDetailContent'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: theme } = await supabase
    .from('themes')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!theme) {
    return { title: 'Theme Not Found | VerbVault' }
  }

  return {
    title: `${theme.name} | VerbVault`,
    description: theme.description || `Check out the ${theme.name} spinner theme on VerbVault.`,
  }
}

async function getTheme(slug: string) {
  const supabase = await createClient()

  const { data: theme, error } = await supabase
    .from('themes')
    .select(`
      *,
      author:profiles!author_id(*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !theme) {
    return null
  }

  // Get like count
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('theme_id', theme.id)

  // Get comment count
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('theme_id', theme.id)

  // Get current user's like status
  const { data: { user } } = await supabase.auth.getUser()
  let isLiked = false

  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('user_id')
      .eq('theme_id', theme.id)
      .eq('user_id', user.id)
      .single()

    isLiked = !!like
  }

  return {
    ...theme,
    like_count: likeCount || 0,
    comment_count: commentCount || 0,
    is_liked: isLiked,
  }
}

async function getComments(themeId: string) {
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(*)
    `)
    .eq('theme_id', themeId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return comments || []
}

async function getRelatedThemes(themeId: string, tags: string[]) {
  const supabase = await createClient()

  let query = supabase
    .from('themes')
    .select(`
      *,
      author:profiles!author_id(*)
    `)
    .eq('is_published', true)
    .neq('id', themeId)
    .limit(4)

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data: themes } = await query

  return themes || []
}

export default async function ThemeDetailPage({ params }: Props) {
  const { slug } = await params
  const theme = await getTheme(slug)

  if (!theme) {
    notFound()
  }

  const [comments, relatedThemes] = await Promise.all([
    getComments(theme.id),
    getRelatedThemes(theme.id, theme.tags || []),
  ])

  return (
    <ThemeDetailContent
      theme={theme}
      comments={comments}
      relatedThemes={relatedThemes}
    />
  )
}
