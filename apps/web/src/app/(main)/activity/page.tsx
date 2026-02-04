import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { Heart, MessageCircle, GitFork, UserPlus, Sparkles } from 'lucide-react'
import type { ActivityWithDetails } from '@verbvault/shared'

export const metadata = {
  title: 'Activity Feed | VerbVault',
  description: 'See what creators you follow are up to.',
}

async function getActivityFeed(userId: string) {
  const supabase = await createClient()

  // Get users that the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = follows?.map(f => f.following_id) || []

  if (followingIds.length === 0) {
    return []
  }

  // Get activities from followed users
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      user:profiles!user_id(*)
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch related themes for theme activities
  const themeIds = activities
    ?.filter(a => a.target_type === 'theme')
    .map(a => a.target_id)
    .filter(Boolean) || []

  let themesMap = new Map()
  if (themeIds.length > 0) {
    const { data: themes } = await supabase
      .from('themes')
      .select('id, name, slug')
      .in('id', themeIds)

    themes?.forEach(t => themesMap.set(t.id, t))
  }

  // Fetch related users for follow activities
  const targetUserIds = activities
    ?.filter(a => a.target_type === 'user')
    .map(a => a.target_id)
    .filter(Boolean) || []

  let usersMap = new Map()
  if (targetUserIds.length > 0) {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', targetUserIds)

    users?.forEach(u => usersMap.set(u.id, u))
  }

  return (activities || []).map(activity => ({
    ...activity,
    theme: themesMap.get(activity.target_id),
    target_user: usersMap.get(activity.target_id),
  }))
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'publish':
      return <Sparkles className="h-4 w-4 text-primary" />
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case 'fork':
      return <GitFork className="h-4 w-4 text-green-500" />
    case 'follow':
      return <UserPlus className="h-4 w-4 text-amber-500" />
    default:
      return null
  }
}

function ActivityMessage({ activity }: { activity: ActivityWithDetails }) {
  const username = activity.user.display_name || activity.user.username

  switch (activity.type) {
    case 'publish':
      return (
        <>
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:text-primary">
            {username}
          </Link>{' '}
          published a new theme{' '}
          {activity.theme && (
            <Link href={`/theme/${activity.theme.slug}`} className="font-medium hover:text-primary">
              {activity.theme.name}
            </Link>
          )}
        </>
      )
    case 'like':
      return (
        <>
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:text-primary">
            {username}
          </Link>{' '}
          liked{' '}
          {activity.theme && (
            <Link href={`/theme/${activity.theme.slug}`} className="font-medium hover:text-primary">
              {activity.theme.name}
            </Link>
          )}
        </>
      )
    case 'comment':
      return (
        <>
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:text-primary">
            {username}
          </Link>{' '}
          commented on{' '}
          {activity.theme && (
            <Link href={`/theme/${activity.theme.slug}`} className="font-medium hover:text-primary">
              {activity.theme.name}
            </Link>
          )}
        </>
      )
    case 'fork':
      return (
        <>
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:text-primary">
            {username}
          </Link>{' '}
          forked{' '}
          {activity.theme && (
            <Link href={`/theme/${activity.theme.slug}`} className="font-medium hover:text-primary">
              {activity.theme.name}
            </Link>
          )}
        </>
      )
    case 'follow':
      return (
        <>
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:text-primary">
            {username}
          </Link>{' '}
          followed{' '}
          {activity.target_user && (
            <Link href={`/profile/${activity.target_user.username}`} className="font-medium hover:text-primary">
              {activity.target_user.display_name || activity.target_user.username}
            </Link>
          )}
        </>
      )
    default:
      return null
  }
}

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/activity')
  }

  const activities = await getActivityFeed(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
      <p className="text-muted-foreground mb-8">See what creators you follow are up to.</p>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Avatar
                src={activity.user.avatar_url}
                alt={activity.user.username}
                fallback={activity.user.display_name || activity.user.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ActivityIcon type={activity.type} />
                  <p className="text-sm">
                    <ActivityMessage activity={activity} />
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No activity yet. Follow some creators to see their activity here!
          </p>
          <Link href="/explore">
            <Badge variant="outline" className="cursor-pointer">
              Explore themes
            </Badge>
          </Link>
        </div>
      )}
    </div>
  )
}
