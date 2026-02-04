'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Link as LinkIcon, Github, Download, Users, UserPlus, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeCard } from '@/components/theme/ThemeCard'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { formatNumber, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { ProfileWithStats, ThemeWithAuthor, Achievement } from '@verbvault/shared'

interface ProfileContentProps {
  profile: ProfileWithStats
  themes: ThemeWithAuthor[]
  likedThemes: ThemeWithAuthor[]
  achievements: { earned_at: string; achievement: Achievement }[]
  isOwnProfile: boolean
}

type Tab = 'themes' | 'drafts' | 'liked' | 'achievements'

export function ProfileContent({
  profile,
  themes,
  likedThemes,
  achievements,
  isOwnProfile,
}: ProfileContentProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('themes')
  const [isFollowing, setIsFollowing] = useState(profile.is_following || false)
  const [followerCount, setFollowerCount] = useState(profile.follower_count)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter themes into published and drafts
  const publishedThemes = themes.filter((t) => t.is_published)
  const draftThemes = themes.filter((t) => !t.is_published)

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsUpdating(true)
    const supabase = createClient()

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', profile.id)

        setIsFollowing(false)
        setFollowerCount((prev) => prev - 1)
      } else {
        await supabase.from('follows').insert({
          follower_id: user!.id,
          following_id: profile.id,
        })

        // Create activity
        await supabase.from('activities').insert({
          user_id: user!.id,
          type: 'follow',
          target_type: 'user',
          target_id: profile.id,
          metadata: { username: profile.username },
        })

        setIsFollowing(true)
        setFollowerCount((prev) => prev + 1)
      }
    } catch (error) {
      toast.error('Failed to update follow status')
    } finally {
      setIsUpdating(false)
    }
  }

  const tabs = [
    { id: 'themes' as Tab, label: 'Themes', count: publishedThemes.length },
    ...(isOwnProfile ? [{ id: 'drafts' as Tab, label: 'Drafts', count: draftThemes.length }] : []),
    { id: 'liked' as Tab, label: 'Liked', count: likedThemes.length },
    { id: 'achievements' as Tab, label: 'Achievements', count: achievements.length },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name || profile.username}
          fallback={profile.display_name || profile.username}
          size="xl"
          className="h-24 w-24 md:h-32 md:w-32"
        />

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>

            {!isOwnProfile && (
              <Button
                variant={isFollowing ? 'outline' : 'gradient'}
                onClick={handleFollow}
                disabled={isUpdating}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}

            {isOwnProfile && (
              <Link href="/settings">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <LinkIcon className="h-4 w-4" />
                {new URL(profile.website).hostname}
              </a>
            )}
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                {profile.github_username}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <div className="text-2xl font-bold">{formatNumber(profile.theme_count)}</div>
          <div className="text-sm text-muted-foreground">Themes</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <div className="text-2xl font-bold">{formatNumber(profile.total_downloads)}</div>
          <div className="text-sm text-muted-foreground">Downloads</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <div className="text-2xl font-bold">{formatNumber(followerCount)}</div>
          <div className="text-sm text-muted-foreground">Followers</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <div className="text-2xl font-bold">{formatNumber(profile.following_count)}</div>
          <div className="text-sm text-muted-foreground">Following</div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map(({ achievement }) => (
              <Badge
                key={achievement.id}
                variant="secondary"
                className="text-base py-1.5 px-3"
                title={achievement.description || ''}
              >
                {achievement.icon} {achievement.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'themes' && (
        <div>
          {publishedThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedThemes.map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme} index={i} currentUserId={isOwnProfile ? user?.id : undefined} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No themes published yet.</p>
              {isOwnProfile && (
                <Link href="/create">
                  <Button variant="link">Create your first theme</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && isOwnProfile && (
        <div>
          {draftThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftThemes.map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme} index={i} currentUserId={user?.id} showDraftBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No draft themes.</p>
              <Link href="/create">
                <Button variant="link">Create a new theme</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'liked' && (
        <div>
          {likedThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedThemes.map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme as ThemeWithAuthor} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No liked themes yet.</p>
              <Link href="/explore">
                <Button variant="link">Explore themes</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(({ achievement, earned_at }) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 border rounded-xl"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned {formatDate(earned_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No achievements yet. Keep creating and exploring!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
