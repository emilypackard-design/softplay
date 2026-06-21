import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { robustParseJSON } from '@/lib/parseJSON'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { title, city } = await req.json()

    if (!title || !city) {
      return NextResponse.json(
        { error: 'Missing title or city' },
        { status: 400 }
      )
    }

    const prompt = `You are a knowledgeable local friend giving practical details about a family day out destination.

The family wants to visit: ${title} in ${city}

Give the full practical details for this specific venue. Real address, real hours, honest price, a genuinely useful local tip, and what to bring or wear (Props). HOURS: if the place isn't open daily year-round (a market, seasonal farm, recurring event, etc.), state the days and season it runs — e.g. "Saturdays 8am–1pm, May–Oct" — not just clock hours. If you don't know exact clock hours, still give the season or general pattern you DO know (e.g. "Open seasonally, spring–autumn") — never leave hours blank or just "Check website". Put closure/change caveats in the tip, not the hours field.

ALSO suggest a food stop (café, restaurant, food experience) nearby that would be a natural "Half Time" break. Not a chain, not a generic place — something specific and good.

IMPORTANT: Return ONLY a single valid JSON object (no markdown, no extra text before or after) with these exact fields:
{
  "stop": {
    "id": "main",
    "name": "${title}",
    "emoji": "📍",
    "address": "Real street address, City, Country",
    "mapsUrl": "https://maps.google.com/?q=${encodeURIComponent(title + ' ' + city)}",
    "hours": "Opening hours or 'Check website'",
    "price": "Free or $/$$/$$$ or 'Check website'",
    "tip": "One specific local tip",
    "props": "What to bring/wear or empty string",
    "isHalfTime": false
  },
  "foodStop": {
    "id": "food",
    "name": "Specific venue name",
    "emoji": "🍽️",
    "address": "Real address, City",
    "mapsUrl": "https://maps.google.com/?q=VenueName+${encodeURIComponent(city)}",
    "hours": "Opening hours",
    "price": "Free or $ or $$ or $$$",
    "tip": "Local tip",
    "props": "",
    "isHalfTime": true
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const data = robustParseJSON(cleaned) as any

    return NextResponse.json({
      stops: [data.stop, data.foodStop],
    })
  } catch (error: unknown) {
    console.error('playground-itinerary error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
