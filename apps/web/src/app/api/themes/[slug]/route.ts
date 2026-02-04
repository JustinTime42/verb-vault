import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: theme, error } = await supabase
      .from('themes')
      .select(`
        id,
        name,
        slug,
        description,
        verbs,
        tags,
        cover_color,
        download_count,
        created_at,
        published_at,
        author:profiles!author_id(
          username,
          display_name
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      )
    }

    // Increment download count (fire and forget)
    supabase.rpc('increment_download_count', { theme_id: theme.id }).catch(() => {})

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
