'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeCard } from '@/components/theme/ThemeCard'
import { THEME_TAGS, type ThemeWithAuthor, type Theme } from '@verbvault/shared'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface ExploreContentProps {
  initialThemes: ThemeWithAuthor[]
  featuredThemes: Theme[]
  total: number
  searchParams: {
    q?: string
    tag?: string
    sort?: string
    page?: string
  }
}

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'popular', label: 'Popular' },
  { value: 'downloads', label: 'Most Downloads' },
]

export function ExploreContent({
  initialThemes,
  featuredThemes,
  total,
  searchParams,
}: ExploreContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '')
  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const currentSort = searchParams.sort || 'recent'
  const currentTag = searchParams.tag

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams()

    const newParams = { ...searchParams, ...updates }
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    router.push(`/explore?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchQuery || undefined, page: undefined })
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/explore')
  }

  const hasActiveFilters = searchParams.q || searchParams.tag || searchParams.sort !== 'recent'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Explore Themes</h1>
        <p className="text-muted-foreground">
          Discover {total.toLocaleString()} community-created verb themes
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border rounded-lg space-y-4"
          >
            {/* Sort */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sort by</h4>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={currentSort === option.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => updateFilters({ sort: option.value, page: undefined })}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium mb-2">Filter by tag</h4>
              <div className="flex flex-wrap gap-2">
                {THEME_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={currentTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      updateFilters({
                        tag: currentTag === tag ? undefined : tag,
                        page: undefined,
                      })
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchParams.q && (
              <Badge variant="secondary">
                Search: {searchParams.q}
                <button
                  className="ml-1"
                  onClick={() => {
                    setSearchQuery('')
                    updateFilters({ q: undefined })
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentTag && (
              <Badge variant="secondary">
                Tag: {currentTag}
                <button
                  className="ml-1"
                  onClick={() => updateFilters({ tag: undefined })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentSort !== 'recent' && (
              <Badge variant="secondary">
                Sort: {sortOptions.find((o) => o.value === currentSort)?.label}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Featured Section (only show on first page without filters) */}
      {featuredThemes.length > 0 && !hasActiveFilters && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Staff Picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredThemes.slice(0, 3).map((theme, i) => (
              <ThemeCard key={theme.id} theme={theme as ThemeWithAuthor} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All Themes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {hasActiveFilters ? `Results (${total})` : 'All Themes'}
        </h2>
        {initialThemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialThemes.map((theme, i) => (
              <ThemeCard key={theme.id} theme={theme} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No themes found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(total / 20) })
              .slice(0, 5)
              .map((_, i) => {
                const page = i + 1
                const currentPage = parseInt(searchParams.page || '1')
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ page: page.toString() })}
                  >
                    {page}
                  </Button>
                )
              })}
          </div>
        )}
      </section>
    </div>
  )
}
