'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TerminalBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  variant?: 'green' | 'amber'
  showScanlines?: boolean
  showWindowChrome?: boolean
}

const TerminalBox = React.forwardRef<HTMLDivElement, TerminalBoxProps>(
  (
    {
      className,
      children,
      title = 'terminal',
      variant = 'green',
      showScanlines = false,
      showWindowChrome = true,
      ...props
    },
    ref
  ) => {
    const textColorClass = variant === 'green' ? 'text-terminal-green' : 'text-terminal-amber'

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl bg-[hsl(var(--terminal-bg))] shadow-2xl',
          showScanlines && 'terminal-scanlines',
          className
        )}
        {...props}
      >
        {/* Window chrome - traffic light dots */}
        {showWindowChrome && (
          <div className="flex items-center gap-2 p-4 pb-0">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className={cn('ml-3 text-sm font-mono opacity-60', textColorClass)}>
              {title}
            </span>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-4 font-mono text-sm', textColorClass)}>
          {children}
        </div>

        {/* Subtle CRT vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>
    )
  }
)
TerminalBox.displayName = 'TerminalBox'

interface TerminalLineProps extends React.HTMLAttributes<HTMLDivElement> {
  prompt?: string
  command?: string
}

const TerminalLine = React.forwardRef<HTMLDivElement, TerminalLineProps>(
  ({ className, prompt = '$', command, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        <span className="text-terminal-green">{prompt}</span>
        {command && <span className="opacity-70">{command}</span>}
        {children}
      </div>
    )
  }
)
TerminalLine.displayName = 'TerminalLine'

interface TerminalOutputProps extends React.HTMLAttributes<HTMLDivElement> {
  indent?: boolean
}

const TerminalOutput = React.forwardRef<HTMLDivElement, TerminalOutputProps>(
  ({ className, indent = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('opacity-70', indent && 'pl-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TerminalOutput.displayName = 'TerminalOutput'

export { TerminalBox, TerminalLine, TerminalOutput }
