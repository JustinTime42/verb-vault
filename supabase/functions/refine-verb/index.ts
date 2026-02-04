import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { REFINE_VERB_SYSTEM_PROMPT } from '@verbvault/shared'

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

    const { verb, style, context } = await req.json()

    if (!verb || typeof verb !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid verb' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!style || typeof style !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid style' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          refined: getRefinedMock(verb, style),
          alternatives: getAlternativesMock(verb, style),
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
            content: REFINE_VERB_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Original verb: "${verb}"
Requested style: ${style}
${context ? `Theme context: ${context}` : ''}

Refine this verb to match the requested style.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 300,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to refine verb' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const content = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify({
        refined: content.refined,
        alternatives: content.alternatives.slice(0, 3),
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

function getRefinedMock(verb: string, style: string): string {
  const styleLower = style.toLowerCase()

  if (styleLower.includes('playful') || styleLower.includes('fun')) {
    return verb.replace('ing', 'in\'') + ' like crazy'
  }

  if (styleLower.includes('professional')) {
    return 'Actively ' + verb.toLowerCase()
  }

  if (styleLower.includes('pirate')) {
    return verb.replace('ing', 'in\'') + ', arr'
  }

  return verb + ' intensely'
}

function getAlternativesMock(verb: string, style: string): string[] {
  return [
    verb + ' away',
    'Super ' + verb.toLowerCase(),
    verb + ' hard',
  ]
}
