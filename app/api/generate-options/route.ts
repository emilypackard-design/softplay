import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { PlaybillData, PlayStructureData } from '@/types'
import { robustParseJSON } from '@/lib/parseJSON'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { playbill, playStructure }: { playbill: PlaybillData; playStructure: PlayStructureData } =
      await req.json()

    const moodLabel: Record<string, string> = {
      'low-key': 'relaxed and easy-going — nothing too demanding',
      'middle-ground': 'balanced — some activity, some ease',
      'high-energy': 'active and adventurous, full energy',
      'surprise-me': 'whatever feels right — no mood preference',
    }
    const durationLabel: Record<string, string> = {
      'few-hours': 'a couple of hours',
      'half-day': 'a half day',
      'full-day': 'a full day',
    }
    const radiusLabel: Record<string, string> = {
      local: 'within 15 minutes of the starting point',
      '30min': 'within 30 minutes travel',
      '1hour': 'within 1 hour travel',
      further: 'further afield if it is genuinely worth it',
    }

    // Detect session crew from notes to override family profile for pitch generation
    const sessionNotes = playStructure.sessionNotes?.toLowerCase() || ''
    const isAdultsOnly = sessionNotes.includes('just adults') || sessionNotes.includes('adults only')
    const isSmallerCrew = sessionNotes.includes('smaller crew') || sessionNotes.includes('no kids')
    const actualSessionCrew = isAdultsOnly ?
      `${playbill.adults} adult(s) only (no kids today)` :
      isSmallerCrew ?
      `Smaller group (fewer kids than usual profile)` :
      `${playbill.adults} adult(s)${playbill.kids.length > 0 ? `, ${playbill.kids.length} kid(s) aged ${playbill.kids.map(k => k.age).join(', ')}` : ', no kids'}`

    const familyContext = playbill.skipped
      ? `Starting location: ${playStructure.city}`
      : `Family profile:
- Crew: ${playbill.adults} adult(s)${playbill.kids.length > 0 ? `, ${playbill.kids.length} kid(s) aged ${playbill.kids.map(k => k.age).join(', ')}` : ', no kids'}
${playbill.funChips.length > 0 ? `- Activities they enjoy: ${playbill.funChips.join(', ')}` : ''}
${playbill.funNote ? `- More about what they enjoy: ${playbill.funNote}` : ''}
${playbill.notFunChips.length > 0 ? `- NEVER suggest these (hard vetoes): ${playbill.notFunChips.join(', ')}` : ''}
${playbill.notFunNote ? `- More to avoid: ${playbill.notFunNote}` : ''}
${(playbill.foodLoveChips?.length > 0 || playbill.foodAvoidChips?.length > 0 || playbill.foodNote) ? `- Food taste profile (use this as a window into the family's broader personality, not just a dietary filter):` : ''}
${playbill.foodLoveChips?.length > 0 ? `  Loves: ${playbill.foodLoveChips.join(', ')}` : ''}
${playbill.foodAvoidChips?.length > 0 ? `  Avoids: ${playbill.foodAvoidChips.join(', ')}` : ''}
${playbill.foodNote ? `  Notes: ${playbill.foodNote}` : ''}
${playbill.foodLoveChips?.length > 0 || playbill.foodAvoidChips?.length > 0 ? `  Note: food preferences reveal taste beyond the meal. "No fine dining" suggests casual and unpretentious. "Yes to street food" suggests spontaneous and adventurous. Factor this into activity suggestions, not just the food stop.` : ''}
${playbill.greatDay ? `- Days that work well: ${playbill.greatDay}` : ''}
${playbill.cityAndPractical.split('|')[0] ? `- Home city: ${playbill.cityAndPractical.split('|')[0]}` : ''}
${playbill.cityAndPractical.split('|')[1] ? `- Frequent destinations: ${playbill.cityAndPractical.split('|')[1]}` : ''}
- Starting from: ${playStructure.city}

TODAY'S ACTUAL CREW (may differ from family profile): ${actualSessionCrew}`

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    // Web search: if sessionNotes contain a time/event signal, search for local free events
    let searchContext = ''
    if (playStructure.sessionNotes) {
      // Step 1: cheap detection — does this note need a real-time web search?
      const detectionMsg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `Does this text contain a time-specific event, named public event, or date-specific request (e.g. "farmers market this Saturday", "this weekend", a specific festival name) that would benefit from a real-time web search for local happenings? Answer only YES or NO.\n\nText: "${playStructure.sessionNotes}"`
        }]
      })
      const needsSearch = detectionMsg.content[0].type === 'text' &&
        detectionMsg.content[0].text.trim().toUpperCase().startsWith('YES')

      // Step 2: web search only when the note has a time/event signal and we know the city
      if (needsSearch && playStructure.city) {
        const searchMsg = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          tools: [{ type: 'web_search_20260209' as any, name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Search for free or low-cost public events happening in ${playStructure.city} related to: "${playStructure.sessionNotes}". Today is ${todayStr}. Only include events that are free or very low cost, publicly accessible without advance tickets, recurring or community-run, and family-friendly. Never include ticketed concerts, sports events, or events requiring advance purchase. Return a brief summary of relevant events found, or say "No relevant events found" if nothing matches.`
          }]
        })
        const textBlocks = searchMsg.content.filter((b: any) => b.type === 'text')
        if (textBlocks.length > 0) {
          const rawSearch = textBlocks.map((b: any) => b.text).join('\n').trim()
          if (rawSearch && !rawSearch.toLowerCase().includes('no relevant events found')) {
            searchContext = rawSearch
          }
        }
      }
    }

    const prompt = `You are a knowledgeable local friend helping plan a family day out. You know the local area well. You are warm, specific, and you never suggest tourist traps or generic options.

Today's date is ${todayStr}. Take the season and typical weather at ${playStructure.city} into account — suggest things that fit this time of year (e.g. no outdoor swimming in winter, no ski trips in summer; lean into seasonal options like markets, festivals, autumn foliage, beaches, or holiday events when they fit). The location's hemisphere determines which season it is.

${familyContext}

Today's session:
- Mood: ${moodLabel[playStructure.mood] || playStructure.mood}
- Duration: ${durationLabel[playStructure.duration] || playStructure.duration}
- Getting around: ${playStructure.transport.length > 0 ? playStructure.transport.join(', ') : 'flexible'}
- Travel radius: ${radiusLabel[playStructure.radius] || playStructure.radius}
${playStructure.screenplay ? `- Screenplay / theme: "${playStructure.screenplay}" — find real-world tie-ins to this` : ''}
${playStructure.lowerCarbon ? '- Lower carbon: favour activities with a lighter environmental footprint — e.g. kayaking over motorboating, a nature walk over a coach tour, a community workshop over a commercial attraction. The filter is about the activity itself, not transport.' : ''}
${playStructure.rainProof ? '- Indoors only: suggest indoor options only — assume the weather is bad today (rain, snow, cold)' : ''}
${playStructure.sessionNotes ? `- Session notes from the user (THESE OVERRIDE THE FAMILY PROFILE — treat as high priority): ${playStructure.sessionNotes}` : ''}
${searchContext ? `- Real-time local events found (use these to generate 1-2 of the 4 suggestions — the remaining 2-3 must be evergreen options drawn from the family profile and all other filters including indoors, radius, and budget): ${searchContext}` : ''}

CRITICAL: Session notes override family profile preferences. Examples:
- If family profile says "loves hiking" but session notes say "no hikes today", respect "no hikes"
- If session notes say "just adults", ignore kids' preferences
- If session notes say "no 7yo today, bringing adult friend instead", adjust crew-based suggestions
- If session notes say "one person scared of heights", don't suggest rock climbing or cliff-edge viewpoints

Generate exactly 4 specific, equally-good options for today. Requirements:
- Each must be a real, named place or specific activity — never generic ("a park", "a museum")
- All 4 should feel genuinely great — the goal is that any of them would make a good day. No obvious "best" option.
- Each of the 4 MUST be a completely DIFFERENT TYPE of activity. Examples of variety: a nature walk, a cultural venue, a hands-on workshop, a scenic viewpoint. NOT two variations of the same thing (two nature walks, two art galleries, two outdoor attractions in the same area).
- NO DUPLICATES: Never suggest the same place twice, even with different wording. Never suggest two versions of the same activity (e.g., two walks, two bike rides, two museums).
- The pitch should read like a local friend talking — warm, specific, occasionally cheeky. NOT a travel brochure. CRITICAL: Tailor the pitch to TODAY'S ACTUAL CREW, not the family profile. If today is "just adults," write "You said a date night, and..." not "The kids will love...". If it's a smaller crew, reference that reality.
- Stay within the travel radius and respect the transport constraints
- IMPORTANT: Never suggest a restaurant, café, pizza place, or generic meal as one of the four options. Food stops belong in the Half Time section only. Exception: culturally significant food experiences that are destinations in themselves (e.g. a famous food market, cooking class, tea ceremony) may appear as options.
- IMPORTANT: Screenplay/mood are flavour hints only. Maximum 1-2 options should reference them directly. The remaining options must draw from the family's taste profile (activities they enjoy, food preferences, personality) independently, as if Screenplay/mood were not set. Varied suggestions beat thematic uniformity.

Return ONLY valid JSON with no other text, markdown, or explanation:
{
  "options": [
    {
      "id": "option-1",
      "name": "Specific Venue or Activity Name",
      "emoji": "🌿",
      "pitch": "One sentence a local friend would say — specific, warm, honest"
    },
    {
      "id": "option-2",
      "name": "Specific Venue or Activity Name",
      "emoji": "🎨",
      "pitch": "One sentence a local friend would say"
    },
    {
      "id": "option-3",
      "name": "Specific Venue or Activity Name",
      "emoji": "🏞️",
      "pitch": "One sentence a local friend would say"
    },
    {
      "id": "option-4",
      "name": "Specific Venue or Activity Name",
      "emoji": "🎭",
      "pitch": "One sentence a local friend would say"
    }
  ]
}`

    // Retry logic: ensure we get exactly 4 options
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
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      data = robustParseJSON(cleaned)

      // Validate: must have exactly 4 options, each unique type
      if (data?.options && Array.isArray(data.options) && data.options.length === 4) {
        // Check if all options are different types (different names AND different emojis)
        const names = data.options.map((o: any) => o.name)
        const emojis = data.options.map((o: any) => o.emoji)
        const uniqueNames = new Set(names).size === 4
        const uniqueEmojis = new Set(emojis).size === 4

        if (uniqueNames && uniqueEmojis) {
          // Valid response
          return NextResponse.json(data)
        }
      }

      // Log retry attempt
      console.warn(`generate-options attempt ${attempts}: got ${data?.options?.length || 0} options, retrying...`)
    }

    // If we got here, validation failed after retries
    if (!data?.options || data.options.length !== 4) {
      console.error(`generate-options failed after ${maxAttempts} attempts`)
      return NextResponse.json(
        { error: 'Could not generate valid options after retries' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('generate-options error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
