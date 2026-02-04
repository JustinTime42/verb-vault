'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signInWithProvider } from '@/lib/supabase/auth'
import { toast } from 'sonner'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    setIsLoading(true)
    try {
      await signInWithProvider('github')
    } catch (error) {
      toast.error('Failed to sign up. Please try again.')
      setIsLoading(false)
    }
  }

  const benefits = [
    'Create and share custom verb themes',
    'Join a community of Claude Code enthusiasts',
    'Save and organize your favorite themes',
    'Get AI-powered verb suggestions',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-background to-warm-100 dark:from-[hsl(20,15%,5%)] dark:via-background dark:to-[hsl(20,15%,8%)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold gradient-text mb-2">Join VerbVault</h1>
            <p className="text-muted-foreground">Create your free account</p>
          </div>

          <ul className="space-y-2 mb-6">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <Button
            variant="gradient"
            className="w-full h-12 text-base"
            onClick={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Github className="h-5 w-5 mr-2" />
            )}
            Sign up with GitHub
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
