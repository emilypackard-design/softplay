import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { robustParseJSON } from '@/lib/parseJSON'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { title, city, pitch } = await req.json()

    if (!title || !city) {
      return NextResponse.json(
        { error: 'Missing title or city' },
        { status: 400 }
      )
    }

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = `You are a knowledgeable local friend giving practical details about a family day out destination.

The family wants to visit: ${title} in ${city}
Today's date is ${todayStr}. Factor in the current season and typical weather at ${city} (the location's hemisphere determines the season).
${pitch ? `\nWhen this was first saved, the note read: "${pitch}". This may contain STALE, date-specific framing (e.g. "today", "this weekend", "June 21st", "in full bloom right now") from whenever it was saved. IGNORE that framing entirely and write fresh for TODAY's date — give the more general, evergreen reason to go.` : ''}

Give the full practical details for this specific venue. Real address, real hours, honest price, a genuinely useful local tip, and what to bring or wear (Props). HOURS: if the place isn't open daily year-round (a market, seasonal farm, recurring event, etc.), state the days and season it runs — e.g. "Saturdays 8am–1pm, May–Oct" — not just clock hours. If you don't know exact clock hours, still give the season or general pattern you DO know (e.g. "Open seasonally, spring–autumn") — never leave hours blank or just "Check website". Put closure/change caveats in the tip, not the hours field.

SEASONAL CHECK: if this place or activity is seasonal or weather-dependent and today's date does NOT suit it (e.g. an outdoor bloom garden in winter, an orchard out of fruit season, an open-air market in deep winter), open the tip with a clear, friendly heads-up AND point to what still works year-round (e.g. "Heads up — the rose garden won't be in bloom in December, but the glasshouses are lovely and warm any time of year."). If today suits it fine, no warning needed — just the normal useful tip.

IMPORTANT: Return ONLY a single valid JSON object (no markdown, no extra text before or after) with these exact fields:
{
  "stop": {
    "id": "main",
    "name": "${title}",
    "emoji": "📍",
    "address": "Real street address, City, Country",
    "mapsUrl": "https://maps.google.com/?q=${encodeURIComponent(title + ' ' + city)}",
    "hours": "Opening hours, or season/pattern if not open daily year-round",
    "price": "Free or $/$$/$$$ or 'Check website'",
    "tip": "A fresh, date-appropriate tip (with a seasonal heads-up first if today doesn't suit it)",
    "props": "What to bring/wear or empty string",
    "isHalfTime": false
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const data = robustParseJSON(cleaned) as any

    return NextResponse.json({ stop: data.stop })
  } catch (error: unknown) {
    console.error('playground-itinerary error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
