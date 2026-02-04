import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileContent } from './ProfileContent'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return { title: 'User Not Found | VerbVault' }
  }

  return {
    title: `${profile.display_name || profile.username} | VerbVault`,
    description: profile.bio || `Check out ${profile.username}'s themes on VerbVault.`,
  }
}

async function getProfile(username: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return null
  }

  // Get stats
  const [
    { count: themeCount },
    { count: followerCount },
    { count: followingCount },
  ] = await Promise.all([
    supabase
      .from('themes')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id)
      .eq('is_published', true),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
  ])

  // Check if current user is following
  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false

  if (user && user.id !== profile.id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()

    isFollowing = !!follow
  }

  // Get total downloads
  const { data: themes } = await supabase
    .from('themes')
    .select('download_count')
    .eq('author_id', profile.id)
    .eq('is_published', true)

  const totalDownloads = themes?.reduce((sum, t) => sum + (t.download_count || 0), 0) || 0

  return {
    ...profile,
    theme_count: themeCount || 0,
    follower_count: followerCount || 0,
    following_count: followingCount || 0,
    total_downloads: totalDownloads,
    is_following: isFollowing,
  }
}

async function getUserThemes(userId: string, isOwnProfile: boolean) {
  const supabase = await createClient()

  let query = supabase
    .from('themes')
    .select(`
      *,
      author:profiles!author_id(*)
    `)
    .eq('author_id', userId)

  // Only filter published themes for other users' profiles
  if (!isOwnProfile) {
    query = query.eq('is_published', true)
  }

  const { data: themes } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  return themes || []
}

async function getUserLikedThemes(userId: string) {
  const supabase = await createClient()

  const { data: likes } = await supabase
    .from('likes')
    .select(`
      theme:themes!theme_id(
        *,
        author:profiles!author_id(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return likes?.map(l => l.theme).filter(Boolean) || []
}

async function getUserAchievements(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  return data || []
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const isOwnProfile = user?.id === profile.id

  const [themes, likedThemes, achievements] = await Promise.all([
    getUserThemes(profile.id, isOwnProfile),
    getUserLikedThemes(profile.id),
    getUserAchievements(profile.id),
  ])

  return (
    <ProfileContent
      profile={profile}
      themes={themes}
      likedThemes={likedThemes}
      achievements={achievements}
      isOwnProfile={isOwnProfile}
    />
  )
}
