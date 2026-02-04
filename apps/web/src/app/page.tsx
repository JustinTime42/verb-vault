'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Heart, Users, Sparkles, Terminal, Zap, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpinnerDemo } from '@/components/spinner/SpinnerDemo'
import { TerminalBox, TerminalLine, TerminalOutput } from '@/components/ui/terminal-box'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const demoVerbs = [
  'Conjuring',
  'Manifesting',
  'Brewing',
  'Summoning',
  'Crafting',
  'Weaving',
  'Channeling',
  'Invoking',
]

const features = [
  {
    icon: Palette,
    title: 'Themed Collections',
    description: 'Choose from hundreds of community-created verb themes to match your personality.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Let AI create unique verb lists based on your prompts and style preferences.',
  },
  {
    icon: Terminal,
    title: 'Easy Installation',
    description: 'Install themes with a single command or copy-paste into your Claude settings.',
  },
  {
    icon: Zap,
    title: 'Instant Preview',
    description: 'See exactly how your spinner will look before you install it.',
  },
]

const stats = [
  { value: '1,000+', label: 'Themes' },
  { value: '50K+', label: 'Downloads' },
  { value: '5K+', label: 'Creators' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient - warm tones */}
          <div className="absolute inset-0 bg-gradient-to-br from-warm-50 via-background to-warm-100 dark:from-[hsl(20,15%,5%)] dark:via-background dark:to-[hsl(20,15%,8%)]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-warm-100 dark:bg-warm-900/30 text-warm-700 dark:text-warm-300 rounded-full">
                  Customize your Claude Code experience
                </span>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  Where Verbs Come
                  <br />
                  <span className="gradient-text">to Play</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Create, share, and install themed spinner verb libraries for Claude Code.
                  Express yourself with every loading state.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link href="/explore">
                    <Button variant="gradient" size="xl">
                      Explore Themes
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button variant="outline" size="xl">
                      Create Your Own
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Demo spinner */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-md mx-auto"
              >
                <SpinnerDemo verbs={demoVerbs} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need to{' '}
                <span className="gradient-text">personalize</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                VerbVault makes it easy to customize your Claude Code spinner with themed verb collections.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl border bg-card hover:shadow-lg hover:shadow-glow-sm transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Install in <span className="gradient-text">seconds</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose a theme, copy the command, and enjoy your personalized spinner.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <TerminalBox title="Terminal" showScanlines>
                <div className="space-y-2">
                  <TerminalLine command="npx verbvault install pirates-treasure" />
                  <TerminalOutput>
                    <span className="text-terminal-green">✓</span> Theme installed successfully!
                  </TerminalOutput>
                  <TerminalOutput>
                    <span className="text-terminal-green">✓</span> Added 25 verbs to your spinner
                  </TerminalOutput>
                  <div className="mt-4">
                    <TerminalLine command="claude" />
                  </div>
                  <TerminalOutput>
                    <span className="text-terminal-green">◐</span> Plunderin&apos;...
                  </TerminalOutput>
                </div>
              </TerminalBox>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to unlock your{' '}
                  <span className="gradient-text">spinner personality</span>?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of developers who have customized their Claude Code experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button variant="gradient" size="xl">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" size="xl">
                      Browse Themes
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
