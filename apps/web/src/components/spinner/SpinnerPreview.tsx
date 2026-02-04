'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpinnerPreviewProps {
  verbs: string[]
  interval?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showDots?: boolean
  variant?: 'terminal' | 'gradient'
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export function SpinnerPreview({
  verbs,
  interval = 1500,
  className,
  size = 'md',
  showDots = true,
  variant = 'terminal',
}: SpinnerPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (verbs.length === 0) return

    const verbTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % verbs.length)
    }, interval)

    return () => clearInterval(verbTimer)
  }, [verbs, interval])

  useEffect(() => {
    if (!showDots) return

    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    return () => clearInterval(dotTimer)
  }, [showDots])

  if (verbs.length === 0) {
    return (
      <div className={cn('font-mono text-muted-foreground', sizeClasses[size], className)}>
        No verbs yet...
      </div>
    )
  }

  const textClass = variant === 'terminal'
    ? 'text-terminal-green terminal-glow-sm'
    : 'gradient-text'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn('font-mono font-semibold', textClass, sizeClasses[size])}
        >
          {verbs[currentIndex]}
        </motion.span>
      </AnimatePresence>
      {showDots && (
        <span className={cn('font-mono text-muted-foreground w-8', sizeClasses[size])}>
          {dots}
        </span>
      )}
    </div>
  )
}
