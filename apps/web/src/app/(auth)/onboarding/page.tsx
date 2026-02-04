'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usernameSchema } from '@verbvault/shared'
import { useDebounce } from '@/lib/hooks/use-debounce'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')

  const debouncedUsername = useDebounce(username, 500)

  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameStatus('idle')
      return
    }

    const checkUsername = async () => {
      // Validate format first
      const result = usernameSchema.safeParse(debouncedUsername)
      if (!result.success) {
        setUsernameStatus('invalid')
        return
      }

      setUsernameStatus('checking')

      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', debouncedUsername)
        .single()

      setUsernameStatus(data ? 'taken' : 'available')
    }

    checkUsername()
  }, [debouncedUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (usernameStatus !== 'available') {
      toast.error('Please choose a valid username.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        github_username: user.user_metadata?.user_name || null,
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('This username is already taken.')
          setUsernameStatus('taken')
        } else {
          toast.error('Failed to create profile. Please try again.')
        }
        return
      }

      toast.success('Welcome to VerbVault!')
      router.push('/explore')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-background to-warm-100 dark:from-[hsl(20,15%,5%)] dark:via-background dark:to-[hsl(20,15%,8%)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Welcome!</h1>
            <p className="text-muted-foreground">Let&apos;s set up your profile</p>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="your-awesome-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="pr-10"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === 'available' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && (
                    <p className="text-sm text-red-500">This username is already taken.</p>
                  )}
                  {usernameStatus === 'invalid' && (
                    <p className="text-sm text-red-500">
                      Username must be 3-30 characters, letters, numbers, hyphens, or underscores only.
                    </p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-sm text-green-500">Username is available!</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="gradient"
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={usernameStatus !== 'available'}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name (optional)</Label>
                  <Input
                    id="displayName"
                    placeholder="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/500
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}
