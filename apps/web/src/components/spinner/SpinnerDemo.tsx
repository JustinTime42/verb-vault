'use client'

import { motion } from 'framer-motion'
import { SpinnerPreview } from './SpinnerPreview'
import { TerminalBox } from '@/components/ui/terminal-box'
import { cn } from '@/lib/utils'

interface SpinnerDemoProps {
  verbs: string[]
  className?: string
}

export function SpinnerDemo({ verbs, className }: SpinnerDemoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <TerminalBox
        title="claude"
        showScanlines
        className={cn('p-6', className)}
      >
        {/* Terminal content */}
        <div className="space-y-2">
          <div className="flex items-center text-terminal-green/70">
            <span className="text-terminal-green">$</span>
            <span className="ml-2">claude</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-terminal-green"
            >
              ◐
            </motion.div>
            <SpinnerPreview
              verbs={verbs}
              interval={1200}
              size="sm"
              showDots={true}
              variant="terminal"
            />
          </div>
        </div>
      </TerminalBox>
    </motion.div>
  )
}
