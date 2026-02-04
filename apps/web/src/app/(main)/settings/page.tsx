'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Loader2, User, Bell, Key, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { updateProfileSchema } from '@verbvault/shared'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Form state
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setWebsite(profile.website || '')
    }
  }, [profile])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?next=/settings')
    }
  }, [authLoading, user, router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = updateProfileSchema.safeParse({
      username,
      display_name: displayName || null,
      bio: bio || null,
      website: website || null,
    })

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ')
      toast.error(errors)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          display_name: displayName || null,
          bio: bio || null,
          website: website || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('This username is already taken.')
        } else {
          throw error
        }
        return
      }

      await refreshProfile()
      toast.success('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ]

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.username || 'User'}
                  fallback={profile?.display_name || profile?.username || 'U'}
                  size="xl"
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Avatar is synced from your OAuth provider
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your unique username. Only letters, numbers, hyphens, and underscores.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/500
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
              <p className="text-muted-foreground">
                Notification preferences coming soon!
              </p>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">API Keys</h2>
              <p className="text-muted-foreground">
                API key management coming soon! You&apos;ll be able to generate keys for CLI authentication.
              </p>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="p-6 border-red-500/50">
              <h2 className="text-xl font-semibold mb-6 text-red-500">Danger Zone</h2>
              <div className="space-y-4">
                <div className="p-4 border border-red-500/30 rounded-lg">
                  <h3 className="font-medium mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      toast.info('Account deletion coming soon. Contact support for now.')
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
