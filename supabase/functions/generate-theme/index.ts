import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GENERATE_THEME_SYSTEM_PROMPT } from '@verbvault/shared'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { prompt, count = 50 } = await req.json()

    if (!prompt || typeof prompt !== 'string' || prompt.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limiting (simple implementation)
    // In production, you'd want to use Redis or a dedicated rate limiting service

    if (!OPENAI_API_KEY) {
      // Return mock data if no API key
      return new Response(
        JSON.stringify(getMockTheme(prompt, count)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to generate theme' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const content = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify({
        name: content.name,
        description: content.description,
        verbs: content.verbs.slice(0, count),
        tags: content.tags,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getMockTheme(prompt: string, count: number) {
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes('pirate')) {
    return {
      name: "Pirate's Treasure",
      description: 'Set sail for adventure with these swashbuckling verbs!',
      verbs: ['Plunderin\'', 'Swashbucklin\'', 'Sailing', 'Hoisting', 'Anchoring', 'Navigating', 'Charting', 'Commandeering', 'Pillaging', 'Boarding', 'Mutinying', 'Treasure Hunting', 'Yo-ho-ing', 'Parleying', 'Keelhauling'].slice(0, count),
      tags: ['pirate', 'fantasy', 'funny'],
    }
  }

  if (promptLower.includes('space')) {
    return {
      name: 'Cosmic Explorer',
      description: 'Explore the final frontier with these stellar verbs!',
      verbs: ['Launching', 'Orbiting', 'Terraforming', 'Warping', 'Docking', 'Scanning', 'Navigating', 'Transmitting', 'Calibrating', 'Engaging', 'Hyperjumping', 'Beaming', 'Probing', 'Analyzing', 'Calculating'].slice(0, count),
      tags: ['space', 'sci-fi', 'tech'],
    }
  }

  return {
    name: 'Creative Flow',
    description: 'A versatile collection of creative action verbs.',
    verbs: ['Creating', 'Building', 'Designing', 'Crafting', 'Imagining', 'Exploring', 'Discovering', 'Learning', 'Growing', 'Transforming', 'Connecting', 'Inspiring', 'Dreaming', 'Manifesting', 'Evolving'].slice(0, count),
    tags: ['professional', 'minimalist'],
  }
}
