'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Sparkles, Loader2 } from 'lucide-react'
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
import { generateSlug } from '@/lib/utils'
import { THEME_TAGS, type Theme, type ThemeTag } from '@verbvault/shared'
import { createThemeSchema } from '@verbvault/shared'
import { toast } from 'sonner'

interface CreateThemeContentProps {
  forkTheme?: Theme | null
}

export function CreateThemeContent({ forkTheme }: CreateThemeContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Form state
  const [name, setName] = useState(forkTheme ? `${forkTheme.name} (Fork)` : '')
  const [description, setDescription] = useState(forkTheme?.description || '')
  const [verbs, setVerbs] = useState<string[]>(forkTheme?.verbs || [])
  const [tags, setTags] = useState<ThemeTag[]>((forkTheme?.tags as ThemeTag[]) || [])

  const toggleTag = (tag: ThemeTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else if (tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  const handleSaveDraft = async () => {
    await saveTheme(false)
  }

  const handlePublish = async () => {
    await saveTheme(true)
  }

  const saveTheme = async (publish: boolean) => {
    // Validate
    const result = createThemeSchema.safeParse({
      name,
      description: description || undefined,
      verbs,
      tags,
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

      const slug = generateSlug(name) + '-' + Date.now().toString(36)

      const themeData = {
        author_id: user.id,
        name,
        slug,
        description: description || null,
        verbs,
        tags,
        cover_color: 'linear-gradient(135deg, #D97757 0%, #FFB000 100%)',
        is_published: publish,
        forked_from: forkTheme?.id || null,
        published_at: publish ? new Date().toISOString() : null,
      }

      const { data: theme, error } = await supabase
        .from('themes')
        .insert(themeData)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Create initial version if publishing
      if (publish && theme) {
        await supabase.from('theme_versions').insert({
          theme_id: theme.id,
          version: 1,
          verbs,
          changelog: 'Initial release',
        })

        // Create activity
        await supabase.from('activities').insert({
          user_id: user.id,
          type: forkTheme ? 'fork' : 'publish',
          target_type: 'theme',
          target_id: theme.id,
          metadata: { theme_name: name },
        })
      }

      toast.success(publish ? 'Theme published!' : 'Draft saved!')
      router.push(`/theme/${theme.slug}`)
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme. Please try again.')
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

  const canPublish = name.trim() && verbs.length > 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {forkTheme ? 'Fork Theme' : 'Create New Theme'}
        </h1>
        <p className="text-muted-foreground">
          {forkTheme
            ? `Forking from "${forkTheme.name}". Make it your own!`
            : 'Design a custom verb theme for your Claude Code spinner.'}
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
              onSuggestClick={() => {
                // TODO: Implement suggest more
                toast.info('Coming soon!')
              }}
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
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="gradient"
                className="w-full"
                onClick={handlePublish}
                disabled={isLoading || !canPublish}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Publish Theme
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveDraft}
                disabled={isLoading || !name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
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
