import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { robustParseJSON } from '@/lib/parseJSON'
import type { PlaybillData, PlayStructureData, WheelOption } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { playbill, playStructure, currentOptions, vetoedOption, allVetoes }: {
      playbill: PlaybillData
      playStructure: PlayStructureData
      currentOptions: WheelOption[]
      vetoedOption: WheelOption
      allVetoes: string[]
    } = await req.json()

    const otherOptions = currentOptions.filter(o => o.name !== vetoedOption.name)

    const prompt = `You are a knowledgeable local friend helping plan a family day out.

Starting from: ${playStructure.city}
Mood: ${playStructure.mood}, Duration: ${playStructure.duration}
Transport: ${playStructure.transport.join(', ') || 'flexible'}

Other options already in the wheel (must NOT repeat, EVER): ${otherOptions.map(o => o.name).join(', ')}
Vetoed options (never suggest again): ${allVetoes.join(', ')}

The user rejected: "${vetoedOption.name}" — suggest ONE fresh alternative that is COMPLETELY DIFFERENT from ALL the other options already on the wheel.

Return ONLY valid JSON:
{
  "id": "option-new",
  "name": "Specific Venue or Activity Name",
  "emoji": "🎨",
  "pitch": "One sentence a local friend would say — specific and warm"
}`

    // Retry logic: ensure replacement is not a duplicate of other options
    let data: any = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      data = robustParseJSON(text)

      // Check that replacement is not a duplicate of other wheel options (by name OR emoji)
      if (data?.name && data?.emoji) {
        const nameMatch = otherOptions.some(o => o.name.toLowerCase().trim() === data.name.toLowerCase().trim())
        const emojiMatch = otherOptions.some(o => o.emoji === data.emoji)
        if (!nameMatch && !emojiMatch) {
          return NextResponse.json({ option: data })
        }
      }

      console.warn(`swap-option attempt ${attempts}: got duplicate or invalid option, retrying...`)
    }

    // If we got here, validation failed
    if (!data?.name) {
      console.error(`swap-option failed after ${maxAttempts} attempts`)
      return NextResponse.json(
        { error: 'Could not generate valid replacement option' },
        { status: 500 }
      )
    }

    return NextResponse.json({ option: data })
  } catch (error: unknown) {
    console.error('swap-option error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
