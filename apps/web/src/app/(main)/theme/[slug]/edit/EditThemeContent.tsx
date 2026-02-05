'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Sparkles, Loader2, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { VerbEditor } from '@/components/theme/VerbEditor'
import { SpinnerPreview } from '@/components/spinner/SpinnerPreview'
import { GenerateModal } from '@/components/ai/GenerateModal'
import { createClient } from '@/lib/supabase/client'
import { THEME_TAGS, type ThemeWithAuthor, type ThemeTag } from '@verbvault/shared'
import { updateThemeSchema } from '@verbvault/shared'
import { toast } from 'sonner'

interface EditThemeContentProps {
  theme: ThemeWithAuthor
  currentVersion: number
}

export function EditThemeContent({ theme, currentVersion }: EditThemeContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showChangelogInput, setShowChangelogInput] = useState(false)
  const [changelog, setChangelog] = useState('')

  // Form state - pre-populated from existing theme
  const [name, setName] = useState(theme.name)
  const [description, setDescription] = useState(theme.description || '')
  const [verbs, setVerbs] = useState<string[]>(theme.verbs)
  const [tags, setTags] = useState<ThemeTag[]>((theme.tags as ThemeTag[]) || [])
  const wasPublished = theme.is_published

  const toggleTag = (tag: ThemeTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else if (tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  const handleSave = async (publish: boolean) => {
    // If publishing a previously published theme, show changelog input
    if (publish && wasPublished && !showChangelogInput) {
      setShowChangelogInput(true)
      return
    }

    // Validate
    const result = updateThemeSchema.safeParse({
      name,
      description: description || null,
      verbs,
      tags,
      is_published: publish,
    })

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ')
      toast.error(errors)
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

      const updateData: Record<string, unknown> = {
        name,
        description: description || null,
        verbs,
        tags,
        is_published: publish,
        updated_at: new Date().toISOString(),
      }

      // Set published_at if publishing for the first time
      if (publish && !wasPublished) {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('themes')
        .update(updateData)
        .eq('id', theme.id)

      if (error) {
        throw error
      }

      // Create new version if publishing
      if (publish) {
        const newVersion = currentVersion + 1
        await supabase.from('theme_versions').insert({
          theme_id: theme.id,
          version: newVersion,
          verbs,
          changelog: changelog || (wasPublished ? 'Updated theme' : 'Initial release'),
        })

        // Create activity for publish/update
        await supabase.from('activities').insert({
          user_id: user.id,
          type: wasPublished ? 'update' : 'publish',
          target_type: 'theme',
          target_id: theme.id,
          metadata: { theme_name: name, version: newVersion },
        })
      }

      toast.success(publish ? 'Theme published!' : 'Changes saved!')
      router.push(`/theme/${theme.slug}`)
      router.refresh()
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme. Please try again.')
    } finally {
      setIsLoading(false)
      setShowChangelogInput(false)
      setChangelog('')
    }
  }

  const handleUnpublish = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('themes')
        .update({
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', theme.id)

      if (error) {
        throw error
      }

      toast.success('Theme unpublished!')
      router.refresh()
    } catch (error) {
      console.error('Error unpublishing theme:', error)
      toast.error('Failed to unpublish theme.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateComplete = (generatedVerbs: string[], generatedName?: string) => {
    setVerbs(generatedVerbs)
    if (generatedName && !name) {
      setName(generatedName)
    }
    setShowGenerateModal(false)
  }

  const handleSuggestMore = async () => {
    if (verbs.length === 0) {
      toast.error('Add some verbs first to get suggestions')
      return
    }

    setIsSuggesting(true)

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingVerbs: verbs, count: 50 }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to suggest verbs')
      }

      const data = await response.json()

      // Merge and dedupe
      const newVerbs = [...verbs, ...data.suggestions]
      const unique = Array.from(new Set(newVerbs)).slice(0, 200) // respect 200 limit
      setVerbs(unique)

      const added = unique.length - verbs.length
      toast.success(`Added ${added} new verbs`)
    } catch (error) {
      console.error('Error suggesting verbs:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to suggest verbs')
    } finally {
      setIsSuggesting(false)
    }
  }

  const canPublish = name.trim() && verbs.length > 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Theme</h1>
        <p className="text-muted-foreground">
          Update your theme &quot;{theme.name}&quot;
          {!wasPublished && <Badge variant="secondary" className="ml-2">Draft</Badge>}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Theme Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Pirate's Treasure"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your theme..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/1000
              </p>
            </div>
          </Card>

          {/* Verbs */}
          <Card className="p-6">
            <VerbEditor
              verbs={verbs}
              onChange={setVerbs}
              onGenerateClick={() => setShowGenerateModal(true)}
              onSuggestClick={handleSuggestMore}
              isSuggesting={isSuggesting}
            />
          </Card>

          {/* Tags */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Tags</h2>
              <span className="text-sm text-muted-foreground">
                {tags.length}/5 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {THEME_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" />
              <h2 className="font-semibold">Preview</h2>
            </div>

            {/* Preview Card */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <div className="h-24 flex items-center justify-center bg-gradient-warm">
                {verbs.length > 0 ? (
                  <SpinnerPreview
                    verbs={verbs}
                    size="sm"
                    className="text-white"
                    showDots={false}
                  />
                ) : (
                  <span className="text-white/60 font-mono text-sm">Add verbs to preview</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">
                  {name || 'Untitled Theme'}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {description}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="text-sm text-muted-foreground mb-6">
              <p>{verbs.length} verbs</p>
              <p>{tags.length} tags</p>
              {currentVersion > 0 && <p>Version {currentVersion}</p>}
            </div>

            {/* Changelog input for published themes */}
            {showChangelogInput && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="changelog">What changed? (optional)</Label>
                <Textarea
                  id="changelog"
                  placeholder="Describe your changes..."
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  maxLength={500}
                  rows={2}
                />
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => handleSave(true)}
                disabled={isLoading || !canPublish}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {wasPublished ? 'Publish Update' : 'Publish Theme'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSave(false)}
                disabled={isLoading || !name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              {wasPublished && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleUnpublish}
                  disabled={isLoading}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              )}
            </div>

            {!canPublish && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Add a name and at least one verb to publish
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Generate Modal */}
      <GenerateModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onComplete={handleGenerateComplete}
        existingVerbs={verbs}
      />
    </div>
  )
}
