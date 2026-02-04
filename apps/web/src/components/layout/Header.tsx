'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Plus, Search, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/lib/hooks/use-auth'
import { signOut } from '@/lib/supabase/auth'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/collections', label: 'Collections' },
  { href: '/activity', label: 'Activity' },
]

export function Header() {
  const pathname = usePathname()
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">
              <span className="gradient-text">Verb</span>Vault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>

            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link href="/create">
                      <Button variant="gradient" size="sm" className="hidden sm:flex">
                        <Plus className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                    </Link>

                    {/* Profile dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <Avatar
                          src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                          alt={profile?.display_name || profile?.username || 'User'}
                          fallback={profile?.display_name || profile?.username || 'U'}
                          size="sm"
                        />
                      </button>

                      {profileMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0"
                            onClick={() => setProfileMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 mt-2 w-56 bg-card border rounded-xl shadow-lg p-2"
                          >
                            {profile && (
                              <div className="px-3 py-2 border-b mb-2">
                                <p className="font-medium">{profile.display_name || profile.username}</p>
                                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                              </div>
                            )}
                            <Link
                              href={profile ? `/profile/${profile.username}` : '/onboarding'}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              Settings
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left text-red-500"
                            >
                              Sign out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/signup" className="hidden sm:block">
                      <Button variant="gradient" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Theme
                  </Button>
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  )
}
