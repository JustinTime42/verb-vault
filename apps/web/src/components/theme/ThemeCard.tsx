'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Download, GitFork, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { SpinnerPreview } from '@/components/spinner/SpinnerPreview'
import { formatNumber, getRandomVerbs } from '@/lib/utils'
import type { ThemeWithAuthor } from '@verbvault/shared'

interface ThemeCardProps {
  theme: ThemeWithAuthor
  index?: number
  currentUserId?: string
  showDraftBadge?: boolean
}

export function ThemeCard({ theme, index = 0, currentUserId, showDraftBadge }: ThemeCardProps) {
  const router = useRouter()
  const [previewVerbs, setPreviewVerbs] = useState(() => theme.verbs.slice(0, 5))

  useEffect(() => {
    setPreviewVerbs(getRandomVerbs(theme.verbs, 5))
  }, [theme.verbs])
  const canEdit = currentUserId && theme.author_id === currentUserId

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/theme/${theme.slug}/edit`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/theme/${theme.slug}`}>
        <Card className="group relative overflow-hidden card-hover cursor-pointer h-full">
          {/* Gradient border effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl bg-gradient-warm"
            style={{
              padding: '2px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
            }}
          />

          {/* Cover gradient */}
          <div className="h-24 relative bg-gradient-warm">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SpinnerPreview
                verbs={previewVerbs}
                interval={1000}
                size="sm"
                className="text-white drop-shadow-lg"
                showDots={false}
                variant="gradient"
              />
            </div>
          </div>

          <div className="p-4">
            {/* Title and author */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {theme.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {showDraftBadge && (
                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                )}
                {theme.is_featured && (
                  <Badge variant="gradient">Featured</Badge>
                )}
                {canEdit && (
                  <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="Edit theme"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {theme.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {theme.description}
              </p>
            )}

            {/* Tags */}
            {theme.tags && theme.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {theme.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {theme.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{theme.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar
                src={theme.author.avatar_url}
                alt={theme.author.display_name || theme.author.username}
                fallback={theme.author.display_name || theme.author.username}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">
                {theme.author.display_name || theme.author.username}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(theme.like_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(theme.comment_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{formatNumber(theme.download_count)}</span>
              </div>
              {theme.forked_from && (
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
