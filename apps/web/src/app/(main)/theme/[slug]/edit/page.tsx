import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditThemeContent } from './EditThemeContent'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: theme } = await supabase
    .from('themes')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!theme) {
    return { title: 'Theme Not Found | VerbVault' }
  }

  return {
    title: `Edit ${theme.name} | VerbVault`,
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

  return theme
}

async function getCurrentVersion(themeId: string) {
  const supabase = await createClient()

  const { data: version } = await supabase
    .from('theme_versions')
    .select('version')
    .eq('theme_id', themeId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  return version?.version || 0
}

export default async function EditThemePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const theme = await getTheme(slug)

  if (!theme) {
    notFound()
  }

  // Verify ownership
  if (theme.author_id !== user.id) {
    redirect(`/theme/${slug}`)
  }

  const currentVersion = await getCurrentVersion(theme.id)

  return (
    <EditThemeContent
      theme={theme}
      currentVersion={currentVersion}
    />
  )
}
