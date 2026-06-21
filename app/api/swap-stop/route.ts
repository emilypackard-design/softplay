import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { PlaybillData, PlayStructureData, WheelOption, DayPlan, Stop } from '@/types'
import { robustParseJSON } from '@/lib/parseJSON'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const {
      playbill,
      playStructure,
      chosenOption,
      currentPlan,
      stopToSwap,
      vetoes,
    }: {
      playbill: PlaybillData
      playStructure: PlayStructureData
      chosenOption: WheelOption
      currentPlan: DayPlan
      stopToSwap: Stop
      vetoes: string[]
    } = await req.json()

    const allStopNames = [
      ...currentPlan.stops.map(s => s.name),
      currentPlan.halfTime.name,
    ]

    const prompt = `You are swapping one stop in a family day plan.

Current day plan: "${currentPlan.title}" in ${playStructure.city}
Anchored around: ${chosenOption.name}

Stop to replace: ${stopToSwap.name} (${stopToSwap.address})
${stopToSwap.isHalfTime ? 'This is the food / Half Time stop.' : 'This is an activity stop.'}

Already in the plan (do not repeat): ${allStopNames.join(', ')}
Permanently vetoed (never suggest): ${vetoes.join(', ')}

Family context:
${playbill.skipped ? `Starting from: ${playStructure.city}` : `${playbill.adults} adult(s)${playbill.kids.length > 0 ? `, kids aged ${playbill.kids.map(k => k.age).join(', ')}` : ''}. ${playbill.cityAndPractical || ''}`}
Transport: ${playStructure.transport.length > 0 ? playStructure.transport.join(', ') : 'flexible'}
${playStructure.lowerCarbon ? 'Lower carbon: favour lower-impact activity choices.' : ''}

Suggest ONE alternative stop that fits the same slot in the plan. It must be a different type of place from what was vetoed.
${stopToSwap.isHalfTime ? 'This must be a food stop (café, restaurant, etc.).' : 'This must be an activity or attraction.'}

HOURS: if the place isn't open daily year-round (a market, seasonal farm, recurring event, etc.), state the days and season it runs in the hours field — e.g. "Saturdays 8am–1pm, May–Oct" — not just clock hours. If you don't know exact clock hours, still give the season or general pattern you DO know (e.g. "Open seasonally, spring–autumn") — never leave hours blank or just "Check website". Put closure/change caveats in the tip, not the hours field.

Return ONLY valid JSON with no other text:
{
  "stop": {
    "id": "stop-new-${Date.now()}",
    "name": "Real Venue Name",
    "emoji": "🎪",
    "address": "Full address, City",
    "mapsUrl": "https://maps.google.com/?q=Venue+Name+City",
    "hours": "9am – 5pm",
    "price": "Free",
    "tip": "Specific local tip",
    "props": "",
    "isHalfTime": ${stopToSwap.isHalfTime}
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = robustParseJSON(text)
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('swap-stop error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
