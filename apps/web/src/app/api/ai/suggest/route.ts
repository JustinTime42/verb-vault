import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestVerbsSchema, SUGGEST_VERBS_SYSTEM_PROMPT } from '@verbvault/shared'

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
    const result = suggestVerbsSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.errors },
        { status: 400 }
      )
    }

    const { existingVerbs, count = 50, style } = result.data

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return mock data for development
      return NextResponse.json(mockSuggestVerbs(existingVerbs, count))
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
            content: SUGGEST_VERBS_SYSTEM_PROMPT(count),
          },
          {
            role: 'user',
            content: `Existing verbs: ${existingVerbs.join(', ')}${style ? `\n\nStyle hint: ${style}` : ''}`,
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
        { error: 'Failed to suggest verbs' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    return NextResponse.json({
      suggestions: content.suggestions.slice(0, count),
    })
  } catch (error) {
    console.error('Suggest verbs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock function for development without API key
function mockSuggestVerbs(existingVerbs: string[], count: number) {
  // Analyze existing verbs to determine theme
  const verbsLower = existingVerbs.map(v => v.toLowerCase()).join(' ')

  let suggestions: string[] = []

  if (verbsLower.includes('pirate') || verbsLower.includes('sail') || verbsLower.includes('treasure')) {
    suggestions = [
      'Walking the plank',
      'Burying treasure',
      'Raising the Jolly Roger',
      'Battening the hatches',
      'Shivering timbers',
      'Hoisting the mainsail',
      'Scanning the horizon',
      'Loading the cannons',
      'Weighing anchor',
      'Scrubbing the deck',
      'Rationing the rum',
      'Reading the stars',
      'Dodging the navy',
      'Recruiting crew',
      'Repairing the hull',
      'Trading cargo',
      'Exploring islands',
      'Decoding maps',
      'Evading storms',
      'Claiming bounty',
      'Striking colors',
      'Running the blockade',
      'Signaling ships',
      'Dividing the loot',
      'Celebrating victory',
    ]
  } else if (verbsLower.includes('space') || verbsLower.includes('orbit') || verbsLower.includes('launch')) {
    suggestions = [
      'Charting nebulae',
      'Establishing orbit',
      'Deploying satellites',
      'Running diagnostics',
      'Analyzing samples',
      'Initiating countdown',
      'Charging shields',
      'Aligning solar panels',
      'Processing data',
      'Contacting base',
      'Mapping coordinates',
      'Calibrating sensors',
      'Monitoring systems',
      'Adjusting trajectory',
      'Collecting specimens',
      'Synthesizing fuel',
      'Repairing modules',
      'Testing thrusters',
      'Broadcasting signals',
      'Documenting findings',
      'Preparing EVA',
      'Checking life support',
      'Computing vectors',
      'Stabilizing rotation',
      'Awaiting clearance',
    ]
  } else if (verbsLower.includes('zen') || verbsLower.includes('meditat') || verbsLower.includes('breath')) {
    suggestions = [
      'Finding stillness',
      'Cultivating awareness',
      'Practicing presence',
      'Observing thoughts',
      'Deepening breath',
      'Opening the heart',
      'Releasing tension',
      'Expanding consciousness',
      'Honoring the moment',
      'Softening resistance',
      'Inviting peace',
      'Acknowledging feelings',
      'Resting in being',
      'Trusting the process',
      'Welcoming change',
      'Letting go',
      'Returning home',
      'Dissolving boundaries',
      'Sensing energy',
      'Connecting deeply',
      'Simplifying',
      'Appreciating silence',
      'Settling the mind',
      'Attuning to nature',
      'Embracing impermanence',
    ]
  } else if (verbsLower.includes('coffee') || verbsLower.includes('brew') || verbsLower.includes('espresso')) {
    suggestions = [
      'Selecting beans',
      'Heating water',
      'Timing the pour',
      'Adjusting grind',
      'Practicing latte art',
      'Cleaning equipment',
      'Tasting notes',
      'Storing properly',
      'Comparing roasts',
      'Perfecting ratios',
      'Preheating cups',
      'Blooming grounds',
      'Swirling the cup',
      'Appreciating aroma',
      'Savoring slowly',
      'Measuring precisely',
      'Experimenting boldly',
      'Sharing the ritual',
      'Refining technique',
      'Discovering origins',
      'Mastering temperature',
      'Balancing flavors',
      'Embracing the process',
      'Honoring tradition',
      'Creating moments',
    ]
  } else {
    // Default creative suggestions
    suggestions = [
      'Brainstorming',
      'Prototyping',
      'Iterating',
      'Collaborating',
      'Researching',
      'Experimenting',
      'Analyzing',
      'Optimizing',
      'Documenting',
      'Reviewing',
      'Testing',
      'Deploying',
      'Monitoring',
      'Scaling',
      'Refactoring',
      'Debugging',
      'Integrating',
      'Automating',
      'Validating',
      'Shipping',
      'Celebrating',
      'Planning',
      'Strategizing',
      'Executing',
      'Delivering',
      'Measuring',
      'Learning',
      'Adapting',
      'Growing',
      'Succeeding',
      'Persevering',
      'Focusing',
      'Prioritizing',
      'Simplifying',
      'Streamlining',
      'Polishing',
      'Launching',
      'Releasing',
      'Announcing',
      'Sharing',
      'Connecting',
      'Networking',
      'Presenting',
      'Demonstrating',
      'Showcasing',
      'Inspiring',
      'Motivating',
      'Empowering',
      'Enabling',
      'Transforming',
    ]
  }

  // Filter out any that already exist
  const existingLower = new Set(existingVerbs.map(v => v.toLowerCase()))
  const filtered = suggestions.filter(s => !existingLower.has(s.toLowerCase()))

  return {
    suggestions: filtered.slice(0, count),
  }
}
