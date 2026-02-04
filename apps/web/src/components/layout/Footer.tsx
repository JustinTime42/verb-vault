import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

const footerLinks = {
  Product: [
    { href: '/explore', label: 'Explore Themes' },
    { href: '/create', label: 'Create Theme' },
    { href: '/collections', label: 'Collections' },
  ],
  Resources: [
    { href: '/docs', label: 'Documentation' },
    { href: '/docs/cli', label: 'CLI Guide' },
    { href: '/docs/api', label: 'API Reference' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="font-bold text-xl">
                <span className="gradient-text">Verb</span>Vault
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Where verbs come to play. Create and share themed spinner libraries for Claude Code.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/verbvault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/verbvault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VerbVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
