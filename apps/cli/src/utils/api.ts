const API_BASE_URL = process.env.VERBVAULT_API_URL || 'https://verbvault.io/api'

export async function fetchTheme(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/themes/${slug}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    // For development/offline, return mock data
    if (process.env.NODE_ENV === 'development' || (error as Error).message.includes('fetch')) {
      return getMockTheme(slug)
    }
    throw error
  }
}

export async function searchThemes(query: string, tag?: string, limit: number = 10) {
  try {
    const params = new URLSearchParams({ q: query, limit: limit.toString() })
    if (tag) params.set('tag', tag)

    const response = await fetch(`${API_BASE_URL}/themes/search?${params}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.themes || data
  } catch (error) {
    // For development/offline, return mock data
    if (process.env.NODE_ENV === 'development' || (error as Error).message.includes('fetch')) {
      return getMockSearchResults(query)
    }
    throw error
  }
}

// Mock data for development/offline use
function getMockTheme(slug: string) {
  const themes: Record<string, any> = {
    'pirates-treasure': {
      slug: 'pirates-treasure',
      name: "Pirate's Treasure",
      description: 'Set sail for adventure with these swashbuckling verbs!',
      verbs: [
        'Plunderin\'',
        'Swashbucklin\'',
        'Sailing',
        'Hoisting',
        'Anchoring',
        'Navigating',
        'Charting',
        'Commandeering',
        'Pillaging',
        'Boarding',
        'Mutinying',
        'Treasure Hunting',
        'Yo-ho-ing',
        'Parleying',
        'Keelhauling',
        'Shanty Singing',
        'Rum Running',
        'Map Reading',
        'Sword Fighting',
        'Gold Counting',
      ],
      tags: ['pirate', 'fantasy', 'funny'],
      download_count: 1234,
    },
    'cosmic-explorer': {
      slug: 'cosmic-explorer',
      name: 'Cosmic Explorer',
      description: 'Explore the final frontier with these stellar verbs!',
      verbs: [
        'Launching',
        'Orbiting',
        'Terraforming',
        'Warping',
        'Docking',
        'Scanning',
        'Navigating',
        'Transmitting',
        'Calibrating',
        'Engaging',
        'Hyperjumping',
        'Beaming',
        'Probing',
        'Analyzing',
        'Calculating',
        'Exploring',
        'Discovering',
        'Mapping',
        'Communicating',
        'Decoding',
      ],
      tags: ['space', 'sci-fi', 'tech'],
      download_count: 856,
    },
    'zen-garden': {
      slug: 'zen-garden',
      name: 'Zen Garden',
      description: 'Find your inner peace with these calming verbs.',
      verbs: [
        'Breathing',
        'Meditating',
        'Centering',
        'Flowing',
        'Balancing',
        'Harmonizing',
        'Grounding',
        'Releasing',
        'Embracing',
        'Reflecting',
        'Contemplating',
        'Awakening',
        'Nurturing',
        'Accepting',
        'Surrendering',
      ],
      tags: ['zen', 'minimalist', 'nature'],
      download_count: 567,
    },
  }

  return themes[slug] || null
}

function getMockSearchResults(query: string) {
  const allThemes = [
    getMockTheme('pirates-treasure'),
    getMockTheme('cosmic-explorer'),
    getMockTheme('zen-garden'),
  ].filter(Boolean)

  const queryLower = query.toLowerCase()

  return allThemes.filter(
    (theme) =>
      theme.name.toLowerCase().includes(queryLower) ||
      theme.description.toLowerCase().includes(queryLower) ||
      theme.tags.some((tag: string) => tag.includes(queryLower))
  )
}
