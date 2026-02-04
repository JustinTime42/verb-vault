import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateThemeContent } from './CreateThemeContent'
import type { Theme } from '@verbvault/shared'

export const metadata = {
  title: 'Create Theme | VerbVault',
  description: 'Create your own custom spinner verb theme for Claude Code.',
}

async function getForkTheme(forkId?: string): Promise<Theme | null> {
  if (!forkId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('themes')
    .select('*')
    .eq('id', forkId)
    .single()

  return data
}

export default async function CreateThemePage({
  searchParams,
}: {
  searchParams: Promise<{ fork?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/create')
  }

  // Check if user has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const params = await searchParams
  const forkTheme = await getForkTheme(params.fork)

  return <CreateThemeContent forkTheme={forkTheme} />
}
