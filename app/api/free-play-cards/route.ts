import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { city, adults, kids, seen, vetoes, playbill, preferences } = await req.json()

    const crewDesc = `${adults} adult${adults !== 1 ? 's' : ''}${kids.length > 0 ? `, ${kids.length} kid${kids.length !== 1 ? 's' : ''} (ages: ${kids.map((k: { age: number }) => k.age).join(', ')})` : ''}`

    const playbillContext = playbill && !playbill.skipped ? `
Family taste profile:
${playbill.funChips?.length > 0 ? `- Enjoys: ${playbill.funChips.join(', ')}` : ''}
${playbill.notFunChips?.length > 0 ? `- Avoids: ${playbill.notFunChips.join(', ')}` : ''}
${playbill.foodLoveChips?.length > 0 ? `- Food loves: ${playbill.foodLoveChips.join(', ')}` : ''}
${playbill.foodAvoidChips?.length > 0 ? `- Food avoids: ${playbill.foodAvoidChips.join(', ')}` : ''}
${playbill.greatDay ? `- Days that work: ${playbill.greatDay}` : ''}
`.trim() : ''

    const preferencesConstraint = preferences ? `User preferences: ${preferences}` : ''

    const prompt = `You are a knowledgeable local friend suggesting things to do in ${city} for ${crewDesc}.

${playbillContext}

Already suggested (do not repeat): ${seen.length > 0 ? seen.join(', ') : 'nothing yet'}
Never suggest again (vetoed or flagged): ${vetoes.length > 0 ? vetoes.join(', ') : 'nothing vetoed'}

${preferencesConstraint}

Generate exactly 6 specific, varied activity suggestions for ${city}. Ground suggestions in the Playbill preferences (food loves/avoids, activities enjoyed). Screenplay and mood are light flavour hints only — use them for max 1-2 cards, let the Playbill drive the rest.

Each pitch should be one punchy sentence that makes you want to go — specific, warm, occasionally cheeky. Mix energy levels, indoor/outdoor, paid/free.

IMPORTANT: Return ONLY this exact JSON structure with no extra text before or after:
{
  "cards": [
    {"id": "card-1", "name": "Specific Venue", "emoji": "🌊", "pitch": "One sentence — specific and warm", "checkItUrl": "https://www.google.com/search?q=specific+venue+name+${city}"},
    {"id": "card-2", "name": "Another Venue", "emoji": "🎭", "pitch": "Another punchy sentence", "checkItUrl": "https://www.google.com/search?q=another+venue+${city}"}
  ]
}`

    // Retry logic: ensure we get exactly 6 unique cards
    let data: any = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''

      // Strip markdown code fences
      let cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      // Extract JSON - look for { ... } pattern
      const jsonMatch = cleaned.match(/\{[\s\S]*\}$/)
      if (!jsonMatch) {
        console.warn(`free-play-cards attempt ${attempts}: no JSON found, retrying...`)
        continue
      }

      try {
        data = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.warn(`free-play-cards attempt ${attempts}: JSON parse error, retrying...`)
        continue
      }

      // Validate: must have exactly 6 cards, each unique
      if (data?.cards && Array.isArray(data.cards) && data.cards.length === 6) {
        // Check if all cards have unique names AND emojis
        const names = data.cards.map((c: any) => c.name)
        const emojis = data.cards.map((c: any) => c.emoji)
        const uniqueNames = new Set(names).size === 6
        const uniqueEmojis = new Set(emojis).size === 6
        if (uniqueNames && uniqueEmojis) {
          // Valid response
          return NextResponse.json(data)
        }
      }

      console.warn(`free-play-cards attempt ${attempts}: got ${data?.cards?.length || 0} cards, retrying...`)
    }

    // If we got here, validation failed after retries
    throw new Error('Could not generate 6 valid unique cards after retries')
  } catch (error: unknown) {
    console.error('free-play-cards error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
