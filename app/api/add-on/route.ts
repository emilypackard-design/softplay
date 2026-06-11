import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { robustParseJSON } from '@/lib/parseJSON'
import type { PlaybillData, PlayStructureData, WheelOption, Stop } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { playbill, playStructure, winner, type, existingStops, vetoes }: {
      playbill: PlaybillData
      playStructure: PlayStructureData
      winner: WheelOption
      type: 'food' | 'before' | 'after' | 'evening'
      existingStops: Stop[]
      vetoes: string[]
    } = await req.json()

    const typeLabel = {
      food: 'a food stop (Half Time) — café, restaurant, or food experience near the main venue',
      before: 'an ACTIVITY to do BEFORE the main event — a warm-up, something nearby, not too long. Generally NOT a meal (Half Time covers food). Only suggest a food spot here if it is a light/snack experience (ice cream stand, cheese shop, bakery, coffee) or the user specifically asked for somewhere to chill — never a full sit-down meal.',
      after: 'an ACTIVITY to do AFTER the main event — a gentle wind-down, nearby, suits the mood. Generally NOT a meal (Half Time covers food). Only suggest a food spot here if it is a light/snack experience (ice cream stand, cheese shop, bakery, coffee) or the user specifically asked for it — never a full sit-down meal.',
      evening: 'an evening activity to cap the day — a concert, film, theatre show (Broadway or local), live music, or night sports event. Something with a start time, something to look forward to. This is the night portion of the day.',
    }[type]

    const foodContext = playbill.foodLoveChips?.length > 0 || playbill.foodAvoidChips?.length > 0
      ? `Food preferences — loves: ${playbill.foodLoveChips?.join(', ') || 'flexible'}. Avoids: ${playbill.foodAvoidChips?.join(', ') || 'nothing specific'}.`
      : ''

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = `You are a knowledgeable local friend adding one stop to a family day out.

Today's date is ${todayStr}. Take the season and typical weather at ${playStructure.city} into account — the add-on should fit this time of year. The location's hemisphere determines which season it is.

Main event: ${winner.emoji} ${winner.name} — "${winner.pitch}"
Filed under: ${playStructure.city}
${foodContext}

GEOGRAPHY (important): "Filed under" is just the folder the user saved this idea in — the main event itself may actually be in a DIFFERENT town. Work out the main event's real location from its name and description, and anchor this add-on to the MAIN EVENT — not the folder town. The day should never bounce between towns an hour apart.${type === 'food' ? ' For food stops, anywhere within a ~15-20 minute hop of the main event is fair game — vary the neighbourhood and direction rather than clustering on the same block, so repeated requests yield genuinely different spots.' : ''}
${playbill.cityAndPractical ? `Context: ${playbill.cityAndPractical}` : ''}
Already in the plan: ${existingStops.map(s => s.name).join(', ') || 'nothing yet'}
Never suggest: ${vetoes.join(', ') || 'nothing vetoed'}

CRITICAL: your suggestion must be a DIFFERENT place from everything already in the plan — before, after, and the main event must each be distinct venues.

Suggest ${typeLabel}.

${type === 'food' ? `The food stop is a highlight — not an afterthought. Specific local favourite, never a chain or museum cafeteria. ${playbill.foodNote ? `Note: ${playbill.foodNote}` : ''}` : ''}

Write the tip in plain, varied language. Describe what's specifically good about this place in concrete terms (a dish, the atmosphere, a detail). Do NOT lean on generic superlatives like "legendary", "famous", "iconic", "renowned", or "must-try" — vary your wording so a list of these never sounds repetitive.

Return ONLY valid JSON:
{
  "id": "addon-${type}",
  "name": "Specific Venue Name",
  "emoji": "🍽️",
  "address": "Full address, City",
  "mapsUrl": "https://maps.google.com/?q=Venue+Name+City",
  "hours": "9am – 5pm",
  "price": "Free",
  "tip": "One specific useful tip",
  "props": "",
  "isHalfTime": ${type === 'food'},
  "addOnType": "${type}"
}`

    let message
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        message = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        })
        break
      } catch (err: unknown) {
        const isRateLimit = err instanceof Error && (err.message.includes('429') || err.message.includes('overloaded'))
        if (isRateLimit && attempt < 2) {
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
        } else {
          throw err
        }
      }
    }
    if (!message) throw new Error('No response from Claude after retries')

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const stop = robustParseJSON(text)
    return NextResponse.json({ stop })
  } catch (error: unknown) {
    console.error('add-on error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
