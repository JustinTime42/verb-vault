import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUGGEST_VERBS_SYSTEM_PROMPT } from '@verbvault/shared'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { existingVerbs, count = 5, style } = await req.json()

    if (!existingVerbs || !Array.isArray(existingVerbs) || existingVerbs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid existing verbs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!OPENAI_API_KEY) {
      // Return mock suggestions
      return new Response(
        JSON.stringify({
          suggestions: getMockSuggestions(existingVerbs, count),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
            content: SUGGEST_VERBS_SYSTEM_PROMPT(count),
          },
          {
            role: 'user',
            content: `Existing verbs: ${existingVerbs.join(', ')}
${style ? `Requested style: ${style}` : ''}

Suggest ${count} more verbs that would fit well with these.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 500,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to suggest verbs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const content = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify({ suggestions: content.suggestions.slice(0, count) }),
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

function getMockSuggestions(existingVerbs: string[], count: number): string[] {
  const allSuggestions = [
    'Conjuring', 'Manifesting', 'Brewing', 'Summoning', 'Crafting',
    'Weaving', 'Channeling', 'Invoking', 'Orchestrating', 'Synthesizing',
    'Calibrating', 'Optimizing', 'Processing', 'Analyzing', 'Computing',
    'Transforming', 'Evolving', 'Expanding', 'Connecting', 'Harmonizing',
  ]

  return allSuggestions
    .filter(s => !existingVerbs.includes(s))
    .slice(0, count)
}
