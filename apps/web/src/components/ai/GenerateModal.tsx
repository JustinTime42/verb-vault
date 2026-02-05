'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface GenerateModalProps {
  open: boolean
  onClose: () => void
  onComplete: (verbs: string[], name?: string) => void
  existingVerbs?: string[]
}

const EXAMPLE_PROMPTS = [
  'Pirate themed verbs for treasure hunting',
  'Space exploration and sci-fi',
  'Zen and meditation',
  'Coffee brewing process',
  'Medieval fantasy adventure',
  'Coding and programming',
]

export function GenerateModal({
  open,
  onClose,
  onComplete,
  existingVerbs = [],
}: GenerateModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVerbs, setGeneratedVerbs] = useState<string[]>([])
  const [generatedName, setGeneratedName] = useState('')
  const [selectedVerbs, setSelectedVerbs] = useState<Set<string>>(new Set())

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setGeneratedVerbs([])
    setSelectedVerbs(new Set())

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), count: 50 }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate')
      }

      const data = await response.json()
      setGeneratedVerbs(data.verbs)
      setGeneratedName(data.name)
      setSelectedVerbs(new Set(data.verbs))
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate verbs. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleVerb = (verb: string) => {
    const newSelected = new Set(selectedVerbs)
    if (newSelected.has(verb)) {
      newSelected.delete(verb)
    } else {
      newSelected.add(verb)
    }
    setSelectedVerbs(newSelected)
  }

  const handleApply = () => {
    const verbsToAdd = Array.from(selectedVerbs)
    onComplete(verbsToAdd, generatedName)
    resetState()
  }

  const resetState = () => {
    setPrompt('')
    setGeneratedVerbs([])
    setGeneratedName('')
    setSelectedVerbs(new Set())
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">AI Theme Generator</h2>
                <p className="text-sm text-muted-foreground">
                  Describe the theme you want to create
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {generatedVerbs.length === 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Describe your theme</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., Pirate themed verbs for treasure hunting"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {prompt.length}/500
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setPrompt(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Verbs
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated name suggestion */}
                {generatedName && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Suggested name:</p>
                    <p className="font-semibold">{generatedName}</p>
                  </div>
                )}

                {/* Verbs selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Select verbs to add ({selectedVerbs.size} selected)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedVerbs.size === generatedVerbs.length) {
                          setSelectedVerbs(new Set())
                        } else {
                          setSelectedVerbs(new Set(generatedVerbs))
                        }
                      }}
                    >
                      {selectedVerbs.size === generatedVerbs.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-60 overflow-y-auto">
                    {generatedVerbs.map((verb) => (
                      <Badge
                        key={verb}
                        variant={selectedVerbs.has(verb) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVerb(verb)}
                      >
                        {verb}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setGeneratedVerbs([])
                      setSelectedVerbs(new Set())
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={handleApply}
                    disabled={selectedVerbs.size === 0}
                  >
                    Add {selectedVerbs.size} Verbs
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
