'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Download,
  Share2,
  GitFork,
  Copy,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { SpinnerPreview } from '@/components/spinner/SpinnerPreview'
import { ThemeCard } from '@/components/theme/ThemeCard'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { formatNumber, formatRelativeTime, copyToClipboard } from '@/lib/utils'
import { toast } from 'sonner'
import type { ThemeWithAuthor, CommentWithUser } from '@verbvault/shared'

interface ThemeDetailContentProps {
  theme: ThemeWithAuthor
  comments: CommentWithUser[]
  relatedThemes: ThemeWithAuthor[]
}

export function ThemeDetailContent({
  theme,
  comments: initialComments,
  relatedThemes,
}: ThemeDetailContentProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(theme.is_liked || false)
  const [likeCount, setLikeCount] = useState(theme.like_count || 0)
  const [showAllVerbs, setShowAllVerbs] = useState(false)
  const [copied, setCopied] = useState<'json' | 'cli' | null>(null)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayedVerbs = showAllVerbs ? theme.verbs : theme.verbs.slice(0, 15)

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const supabase = createClient()

    if (isLiked) {
      await supabase.from('likes').delete().eq('theme_id', theme.id).eq('user_id', user!.id)
      setIsLiked(false)
      setLikeCount((prev) => prev - 1)
    } else {
      await supabase.from('likes').insert({ theme_id: theme.id, user_id: user!.id })
      setIsLiked(true)
      setLikeCount((prev) => prev + 1)
    }
  }

  const handleCopyJSON = async () => {
    const jsonConfig = {
      spinner: {
        verbs: theme.verbs,
      },
    }
    await copyToClipboard(JSON.stringify(jsonConfig, null, 2))
    setCopied('json')
    toast.success('JSON copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)

    // Track download
    const supabase = createClient()
    await supabase.rpc('increment_download_count', { theme_id: theme.id })
  }

  const handleCopyCLI = async () => {
    await copyToClipboard(`npx verbvault install ${theme.slug}`)
    setCopied('cli')
    toast.success('CLI command copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFork = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(`/create?fork=${theme.id}`)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: theme.name,
        text: theme.description || `Check out ${theme.name} on VerbVault`,
        url,
      })
    } else {
      await copyToClipboard(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !newComment.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('comments')
      .insert({
        theme_id: theme.id,
        user_id: user!.id,
        content: newComment.trim(),
      })
      .select(`*, user:profiles!user_id(*)`)
      .single()

    if (error) {
      toast.error('Failed to post comment')
    } else {
      setComments([data, ...comments])
      setNewComment('')
      toast.success('Comment posted!')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{theme.name}</h1>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Link
                    href={`/profile/${theme.author.username}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Avatar
                      src={theme.author.avatar_url}
                      alt={theme.author.username}
                      fallback={theme.author.display_name || theme.author.username}
                      size="sm"
                    />
                    <span>{theme.author.display_name || theme.author.username}</span>
                  </Link>
                  <span>•</span>
                  <span>{formatRelativeTime(theme.published_at || theme.created_at)}</span>
                </div>
              </div>
              {theme.is_featured && <Badge variant="gradient">Featured</Badge>}
            </div>

            {theme.description && (
              <p className="text-muted-foreground mb-4">{theme.description}</p>
            )}

            {theme.tags && theme.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {theme.tags.map((tag) => (
                  <Link key={tag} href={`/explore?tag=${tag}`}>
                    <Badge variant="secondary">{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                className={isLiked ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {formatNumber(likeCount)}
              </Button>
              {user?.id === theme.author_id && (
                <Link href={`/theme/${theme.slug}/edit`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleFork}>
                <GitFork className="h-4 w-4 mr-2" />
                Fork
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Spinner Preview */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Live Preview</h2>
            <div
              className="rounded-xl p-8 flex items-center justify-center"
              style={{ background: theme.cover_color }}
            >
              <SpinnerPreview verbs={theme.verbs} size="lg" className="text-white" />
            </div>
          </Card>

          {/* Verb List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                Verbs ({theme.verbs.length})
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {displayedVerbs.map((verb, i) => (
                <motion.span
                  key={verb}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-3 py-1.5 bg-muted rounded-full font-mono text-sm"
                >
                  {verb}
                </motion.span>
              ))}
            </div>
            {theme.verbs.length > 15 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllVerbs(!showAllVerbs)}
              >
                {showAllVerbs ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show All ({theme.verbs.length - 15} more)
                  </>
                )}
              </Button>
            )}
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">
              Comments ({comments.length})
            </h2>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  placeholder="Leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                  Post Comment
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground mb-6">
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>{' '}
                to leave a comment.
              </p>
            )}

            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar
                      src={comment.user.avatar_url}
                      alt={comment.user.username}
                      fallback={comment.user.display_name || comment.user.username}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${comment.user.username}`}
                          className="font-medium hover:text-primary"
                        >
                          {comment.user.display_name || comment.user.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No comments yet. Be the first!
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Install Card */}
          <Card className="p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Install this theme</h2>

            <div className="space-y-4">
              {/* CLI Method */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span>CLI (recommended)</span>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">
                    npx verbvault install {theme.slug}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleCopyCLI}
                  >
                    {copied === 'cli' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* JSON Method */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Manual (copy JSON)</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyJSON}
                >
                  {copied === 'json' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON Config
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Paste into <code>~/.claude/settings.json</code>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="font-semibold">{formatNumber(theme.download_count)}</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatNumber(likeCount)}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{theme.verbs.length}</div>
                <div className="text-xs text-muted-foreground">Verbs</div>
              </div>
            </div>
          </Card>

          {/* Related Themes */}
          {relatedThemes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Related Themes</h3>
              <div className="space-y-4">
                {relatedThemes.slice(0, 3).map((relatedTheme) => (
                  <ThemeCard key={relatedTheme.id} theme={relatedTheme} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
