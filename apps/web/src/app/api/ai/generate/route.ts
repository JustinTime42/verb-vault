import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateThemeSchema, GENERATE_THEME_SYSTEM_PROMPT } from '@verbvault/shared'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const result = generateThemeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.errors },
        { status: 400 }
      )
    }

    const { prompt, count = 50 } = result.data

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return mock data for development
      return NextResponse.json(mockGenerateTheme(prompt, count))
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: GENERATE_THEME_SYSTEM_PROMPT(count),
          },
          {
            role: 'user',
            content: `Generate a verb theme based on: ${prompt}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return NextResponse.json(
        { error: 'Failed to generate theme' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    return NextResponse.json({
      name: content.name,
      description: content.description,
      verbs: content.verbs.slice(0, count),
      tags: content.tags,
    })
  } catch (error) {
    console.error('Generate theme error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock function for development without API key
function mockGenerateTheme(prompt: string, count: number) {
  const promptLower = prompt.toLowerCase()

  // Generate themed verbs based on keywords
  let verbs: string[] = []
  let name = ''
  let description = ''
  let tags: string[] = []

  if (promptLower.includes('pirate') || promptLower.includes('treasure')) {
    name = "Pirate's Treasure"
    description = 'Set sail for adventure with these swashbuckling verbs!'
    verbs = [
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
    ]
    tags = ['pirate', 'fantasy', 'funny']
  } else if (promptLower.includes('space') || promptLower.includes('sci-fi')) {
    name = 'Cosmic Explorer'
    description = 'Explore the final frontier with these stellar verbs!'
    verbs = [
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
    ]
    tags = ['space', 'sci-fi', 'tech']
  } else if (promptLower.includes('zen') || promptLower.includes('meditation')) {
    name = 'Zen Garden'
    description = 'Find your inner peace with these calming verbs.'
    verbs = [
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
      'Aligning',
      'Listening',
      'Being',
      'Becoming',
      'Transcending',
    ]
    tags = ['zen', 'minimalist', 'nature']
  } else if (promptLower.includes('coffee')) {
    name = 'Coffee Culture'
    description = 'Fuel your code with these caffeinated verbs!'
    verbs = [
      'Brewing',
      'Grinding',
      'Steaming',
      'Pouring',
      'Sipping',
      'Roasting',
      'Extracting',
      'Frothing',
      'Tamping',
      'Pulling',
      'Dripping',
      'Percolating',
      'Espressoing',
      'Latte Art-ing',
      'Caffeinating',
      'Bean Counting',
      'Cupping',
      'Blending',
      'Filtering',
      'Awakening',
    ]
    tags = ['food', 'funny', 'professional']
  } else {
    // Default creative verbs
    name = 'Creative Flow'
    description = 'A versatile collection of creative action verbs.'
    verbs = [
      'Creating',
      'Building',
      'Designing',
      'Crafting',
      'Imagining',
      'Exploring',
      'Discovering',
      'Learning',
      'Growing',
      'Transforming',
      'Connecting',
      'Inspiring',
      'Dreaming',
      'Manifesting',
      'Evolving',
      'Innovating',
      'Orchestrating',
      'Synthesizing',
      'Channeling',
      'Weaving',
    ]
    tags = ['professional', 'minimalist']
  }

  return {
    name,
    description,
    verbs: verbs.slice(0, count),
    tags,
  }
}
