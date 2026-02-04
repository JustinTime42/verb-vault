import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const tag = searchParams.get('tag')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    let dbQuery = supabase
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
      `, { count: 'exact' })
      .eq('is_published', true)

    // Search filter
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Tag filter
    if (tag) {
      dbQuery = dbQuery.contains('tags', [tag])
    }

    // Order by downloads and limit
    dbQuery = dbQuery
      .order('download_count', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: themes, count, error } = await dbQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      themes: themes || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error searching themes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
