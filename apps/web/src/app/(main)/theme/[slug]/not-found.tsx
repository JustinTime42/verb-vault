import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

export default function ThemeNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold gradient-text mb-4">Theme Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        This theme doesn&apos;t exist or may have been removed by its creator.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/explore">
          <Button variant="gradient">
            <Search className="h-4 w-4 mr-2" />
            Browse Themes
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
