'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, X, GripVertical, Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface VerbEditorProps {
  verbs: string[]
  onChange: (verbs: string[]) => void
  onGenerateClick?: () => void
  onSuggestClick?: () => void
  isSuggesting?: boolean
  maxVerbs?: number
  className?: string
}

export function VerbEditor({
  verbs,
  onChange,
  onGenerateClick,
  onSuggestClick,
  isSuggesting = false,
  maxVerbs = 200,
  className,
}: VerbEditorProps) {
  const [newVerb, setNewVerb] = useState('')

  const addVerb = () => {
    const trimmed = newVerb.trim()
    if (trimmed && !verbs.includes(trimmed) && verbs.length < maxVerbs) {
      onChange([...verbs, trimmed])
      setNewVerb('')
    }
  }

  const removeVerb = (index: number) => {
    onChange(verbs.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addVerb()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with AI buttons */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          Verbs ({verbs.length}/{maxVerbs})
        </h3>
        <div className="flex gap-2">
          {onSuggestClick && verbs.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSuggestClick}
              disabled={isSuggesting}
              className="text-xs"
            >
              {isSuggesting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {isSuggesting ? 'Suggesting...' : 'Suggest More'}
            </Button>
          )}
          {onGenerateClick && (
            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={onGenerateClick}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generate
            </Button>
          )}
        </div>
      </div>

      {/* Add verb input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a verb and press Enter..."
          value={newVerb}
          onChange={(e) => setNewVerb(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={50}
          disabled={verbs.length >= maxVerbs}
        />
        <Button
          type="button"
          onClick={addVerb}
          disabled={!newVerb.trim() || verbs.length >= maxVerbs}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Verb list */}
      {verbs.length > 0 ? (
        <div className="border rounded-lg p-2 max-h-80 overflow-y-auto">
          <Reorder.Group
            axis="y"
            values={verbs}
            onReorder={onChange}
            className="space-y-1"
          >
            <AnimatePresence initial={false}>
              {verbs.map((verb, index) => (
                <Reorder.Item
                  key={verb}
                  value={verb}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group"
                >
                  <motion.div
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity" />
                    <span className="flex-1 font-mono text-sm">{verb}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeVerb(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <p className="mb-2">No verbs yet</p>
          <p className="text-sm">
            Add verbs manually or use AI to generate a themed list
          </p>
        </div>
      )}
    </div>
  )
}
