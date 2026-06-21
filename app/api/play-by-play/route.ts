import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { PlaybillData, PlayStructureData, WheelOption } from '@/types'
import { robustParseJSON } from '@/lib/parseJSON'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { playbill, playStructure, chosenOption }: {
      playbill: PlaybillData
      playStructure: PlayStructureData
      chosenOption: WheelOption
    } = await req.json()

    const familyContext = playbill.skipped
      ? `Starting from: ${playStructure.city}`
      : `Family: ${playbill.adults} adult(s)${playbill.kids.length > 0 ? `, kids aged ${playbill.kids.map(k => k.age).join(', ')}` : ''}
Starting from: ${playStructure.city}
${playbill.cityAndPractical.split('|')[0] ? `Home city: ${playbill.cityAndPractical.split('|')[0]}` : ''}
${playbill.cityAndPractical.split('|')[1] ? `Frequent destinations: ${playbill.cityAndPractical.split('|')[1]}` : ''}`

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = `You are a knowledgeable local friend giving practical details about a family day out destination.

Today's date is ${todayStr}. Take the season and typical weather at ${playStructure.city} into account when picking the Half Time food stop and any seasonal tips. The location's hemisphere determines which season it is.

The family has chosen: ${chosenOption.emoji} ${chosenOption.name} — "${chosenOption.pitch}"

${familyContext}
Transport: ${playStructure.transport.length > 0 ? playStructure.transport.join(', ') : 'flexible'}
Mood: ${playStructure.mood}
${playStructure.screenplay ? `Screenplay theme: "${playStructure.screenplay}"` : ''}
${playStructure.sessionNotes ? `Session notes (high priority): ${playStructure.sessionNotes}` : ''}

Give the full practical details for this specific venue. Real address, real hours, honest price, a genuinely useful local tip, and what to bring or wear (Props). HOURS: if the place isn't open daily year-round (a market, seasonal farm, recurring event, etc.), state the days and season it runs — e.g. "Saturdays 8am–1pm, May–Oct" — not just clock hours. If you don't know exact clock hours, still give the season or general pattern you DO know (e.g. "Open seasonally, spring–autumn") — never leave hours blank or just "Check website". Put closure/change caveats in the tip, not the hours field.

ALSO suggest a food stop (café, restaurant, food experience) nearby that would be a natural "Half Time" break. Not a chain, not a generic place — something specific and good that fits the day's mood.

IMPORTANT: Return ONLY a single valid JSON object (no markdown, no extra text before or after) with these exact fields:
{
  "stop": {
    "id": "winner",
    "name": "${chosenOption.name}",
    "emoji": "${chosenOption.emoji}",
    "address": "Real street address, City, Country",
    "mapsUrl": "https://maps.google.com/?q=${encodeURIComponent(chosenOption.name + ' ' + playStructure.city)}",
    "hours": "Opening hours or 'Check website'",
    "price": "Free or $/$$/$$$ or 'Check website'",
    "tip": "One specific local tip",
    "props": "What to bring/wear or empty string",
    "isHalfTime": false
  },
  "foodStop": {
    "id": "food-initial",
    "name": "Specific venue name",
    "emoji": "🍽️",
    "address": "Real address, City",
    "mapsUrl": "https://maps.google.com/?q=VenueName+City",
    "hours": "Opening hours",
    "price": "Free or $ or $$ or $$$",
    "tip": "Local tip",
    "props": "",
    "isHalfTime": true
  }
}`

    // Retry a couple of times — an occasional response gets truncated/malformed and won't parse.
    let data: { stop?: unknown } | null = null
    let lastErr = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      try {
        const parsed = robustParseJSON(text) as { stop?: unknown }
        if (parsed && parsed.stop) { data = parsed; break }
      } catch (e) {
        lastErr = e instanceof Error ? e.message : 'parse error'
      }
    }

    if (!data || !data.stop) {
      return NextResponse.json({ error: lastErr || 'Could not parse the plan — please try again.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('play-by-play error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
