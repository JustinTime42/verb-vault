import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Collection } from '@verbvault/shared'

export const metadata = {
  title: 'Collections | VerbVault',
  description: 'Organize your favorite themes into collections.',
}

async function getCollections(userId: string) {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *,
      collection_themes(count)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  return collections || []
}

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/collections')
  }

  const collections = await getCollections(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Collections</h1>
          <p className="text-muted-foreground">
            Organize your favorite themes into collections.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{collection.name}</h3>
                      {!collection.is_public && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{collection.collection_themes?.[0]?.count || 0} themes</span>
                      <span>•</span>
                      <span>Updated {formatRelativeTime(collection.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No collections yet</h2>
          <p className="text-muted-foreground mb-4">
            Create collections to organize your favorite themes.
          </p>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create your first collection
          </Button>
        </Card>
      )}
    </div>
  )
}
