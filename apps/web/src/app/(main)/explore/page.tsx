import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ExploreContent } from './ExploreContent'
import { ThemeCardSkeleton } from '@/components/theme/ThemeCardSkeleton'
import type { ThemeWithAuthor } from '@verbvault/shared'

export const metadata = {
  title: 'Explore Themes | VerbVault',
  description: 'Discover and browse community-created spinner verb themes for Claude Code.',
}

async function getThemes(searchParams: {
  q?: string
  tag?: string
  sort?: string
  page?: string
}) {
  const supabase = await createClient()

  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('themes')
    .select(`
      *,
      author:profiles!author_id(*)
    `, { count: 'exact' })
    .eq('is_published', true)

  // Search filter
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  // Tag filter
  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  // Sorting
  switch (searchParams.sort) {
    case 'popular':
      query = query.order('download_count', { ascending: false })
      break
    case 'trending':
      // For trending, we'd normally use a more complex algorithm
      // For now, just order by recent + downloads
      query = query.order('download_count', { ascending: false })
      break
    case 'downloads':
      query = query.order('download_count', { ascending: false })
      break
    case 'recent':
    default:
      query = query.order('published_at', { ascending: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: themes, count, error } = await query

  if (error) {
    console.error('Error fetching themes:', error)
    return { themes: [], total: 0 }
  }

  // Get like counts for all themes
  const themeIds = themes?.map(t => t.id) || []
  const { data: likeCounts } = await supabase
    .from('likes')
    .select('theme_id')
    .in('theme_id', themeIds)

  const likeCountMap = new Map<string, number>()
  likeCounts?.forEach(like => {
    likeCountMap.set(like.theme_id, (likeCountMap.get(like.theme_id) || 0) + 1)
  })

  const themesWithCounts: ThemeWithAuthor[] = (themes || []).map(theme => ({
    ...theme,
    author: theme.author,
    like_count: likeCountMap.get(theme.id) || 0,
    comment_count: 0,
  }))

  return { themes: themesWithCounts, total: count || 0 }
}

async function getFeaturedThemes() {
  const supabase = await createClient()

  const { data: themes } = await supabase
    .from('themes')
    .select(`
      *,
      author:profiles!author_id(*)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(6)

  return themes || []
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const [{ themes, total }, featuredThemes] = await Promise.all([
    getThemes(params),
    getFeaturedThemes(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ExploreLoading />}>
        <ExploreContent
          initialThemes={themes}
          featuredThemes={featuredThemes}
          total={total}
          searchParams={params}
        />
      </Suspense>
    </div>
  )
}

function ExploreLoading() {
  return (
    <div className="space-y-8">
      <div className="h-12 w-full max-w-md bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ThemeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
