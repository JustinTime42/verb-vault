import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'VerbVault - Where Verbs Come to Play',
  description: 'Create, share, and install themed spinner verb libraries for Claude Code. Unlock your spinner personality!',
  keywords: ['claude', 'claude code', 'spinner', 'verbs', 'themes', 'cli', 'productivity'],
  authors: [{ name: 'VerbVault' }],
  openGraph: {
    title: 'VerbVault - Where Verbs Come to Play',
    description: 'Create, share, and install themed spinner verb libraries for Claude Code.',
    url: 'https://verbvault.io',
    siteName: 'VerbVault',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VerbVault - Where Verbs Come to Play',
    description: 'Create, share, and install themed spinner verb libraries for Claude Code.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
