import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { PlaybillData, PlayStructureData } from '@/types'
import { robustParseJSON } from '@/lib/parseJSON'
import { sameStop } from '@/lib/stopNames'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { playbill, playStructure, vetoes = [] }: { playbill: PlaybillData; playStructure: PlayStructureData; vetoes?: string[] } =
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
      // Step 1: zero-cost prefilter — does this note contain date/event language?
      // Replaces a per-request LLM detection call so plans WITHOUT date language stay fast.
      const noteText = playStructure.sessionNotes.toLowerCase()
      // NOTE: "today"/"tonight" deliberately excluded — today is the DEFAULT assumption,
      // so it shouldn't trigger a web search. Only an explicitly different day/date does.
      const needsSearch =
        // date words, seasons, relative timing, event types, named holidays
        /\b(tomorrow|weekend|this week|next week|this month|next month|season|seasonal|january|february|april|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|festival|market|fair|fete|parade|fireworks|carnival|celebration|holiday|bloomsday|halloween|christmas|easter|hanukkah|diwali|new year|patrick)\b/.test(noteText)
        // ambiguous months ("may", "march") only when a number is nearby, to avoid the modal/verb senses
        || /\b(may|march)\b.{0,8}\d/.test(noteText)
        || /\b\d{1,2}(st|nd|rd|th)\b/.test(noteText)   // "16th", "21st"
        || /\b\d{1,2}\/\d{1,2}\b/.test(noteText)        // "6/16"

      // Step 2: web search only when the note has a time/event signal and we know the city.
      // Wrapped in its own try/catch — a search failure must NEVER block card generation;
      // it just degrades to no searchContext.
      if (needsSearch && playStructure.city) {
        try {
          const searchMsg = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 600,
            tools: [{ type: 'web_search_20260209' as any, name: 'web_search' }],
            messages: [{
              role: 'user',
              content: `Search for free or low-cost public events happening ${radiusLabel[playStructure.radius] || 'near'} of ${playStructure.city} related to: "${playStructure.sessionNotes}". Today is ${todayStr}. Keep events within that travel radius UNLESS the request itself says the user will travel further. Only include events that are free or very low cost, publicly accessible without advance tickets, recurring or community-run, and family-friendly. Never include ticketed concerts, sports events, or events requiring advance purchase. CRITICAL — FRESHNESS: only include events you can confirm are STILL RUNNING this year. Verify each has a current/recent edition; EXCLUDE anything discontinued, cancelled, on hiatus, or with no edition found in the last year or two (e.g. a festival that ended years ago). When in doubt, leave it out. For each event, note whether it is recurring (e.g. "every Saturday", "last weekend of June") or a one-time/fixed-date event with the actual date. Return a brief summary of relevant events found, or say "No relevant events found" if nothing matches.`
            }]
          })
          const textBlocks = searchMsg.content.filter((b: any) => b.type === 'text')
          if (textBlocks.length > 0) {
            const rawSearch = textBlocks.map((b: any) => b.text).join('\n').trim()
            if (rawSearch && !rawSearch.toLowerCase().includes('no relevant events found')) {
              searchContext = rawSearch
            }
          }
        } catch (searchErr) {
          console.warn('generate-options web search failed, continuing without it:', searchErr)
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
${vetoes.length > 0 ? `- NEVER suggest these — the family flagged them as permanently closed or a bad fit (hard exclusions): ${vetoes.join(', ')}` : ''}
${searchContext ? `- Real-time local events found (use these to generate 1-2 of the 4 suggestions — the remaining 2-3 must be evergreen options drawn from the family profile and all other filters including indoors, radius, and budget): ${searchContext}` : ''}

RECONCILING THE INPUTS — two rules:

RULE 1 (hard vs. hard): Session notes are weighted evenly with the session settings above (mood, duration, transport, travel radius) and the family profile — they do NOT automatically override everything. A note only wins where it DIRECTLY CONTRADICTS a specific setting or preference. Where the notes are silent, every chosen setting stands exactly as set.
- Travel radius "30 minutes" + note "willing to drive 1-2 hours for the perfect beach" → the note directly loosens the radius, so honor up to ~2 hours BY CAR. But if the note says nothing about distance, keep the radius as chosen — never use a note as license to roam.
- Family profile "loves hiking" + note "no hikes today" → direct contradiction, respect "no hikes".
- Note "just adults" → ignore kids' preferences. Note "one person scared of heights" → no rock climbing or cliff-edge viewpoints.
- A note about ONE thing (e.g. food) does not override UNRELATED settings (e.g. radius). Only the contradicted setting bends.

RULE 2 (hard vs. soft): A constraint (avoid / nothing / not today / scared of / "nothing too X") is a HARD BOUNDARY. A screenplay theme or mood is SOFT INSPIRATION. When a boundary meets a theme, keep the boundary and find the facet of the theme that fits WITHIN it — do not discard the theme, and never breach the boundary.
- "Beetlejuice" + "nothing too scary" → keep the whimsical/gothic-playful/autumnal facet (surreal sculpture garden, quirky old New England town, stop-motion workshop); never a genuinely spooky or frightening option, even with a reassuring caveat.

Generate exactly 4 specific, equally-good options for today. Requirements:
- Each must be a real, named place or specific activity — never generic ("a park", "a museum")
- All 4 should feel genuinely great — the goal is that any of them would make a good day. No obvious "best" option.
- Each of the 4 MUST be a completely DIFFERENT TYPE of activity. Examples of variety: a nature walk, a cultural venue, a hands-on workshop, a scenic viewpoint. NOT two variations of the same thing (two nature walks, two art galleries, two outdoor attractions in the same area).
- NO DUPLICATES: Never suggest the same place twice, even with different wording. Never suggest two versions of the same activity (e.g., two walks, two bike rides, two museums).
- The pitch should read like a local friend talking — warm, specific, occasionally cheeky. NOT a travel brochure. CRITICAL: Tailor the pitch to TODAY'S ACTUAL CREW, not the family profile. If today is "just adults," write "You said a date night, and..." not "The kids will love...". If it's a smaller crew, reference that reality.
- Stay within the travel radius and respect the transport constraints
- IMPORTANT: Never suggest a restaurant, café, pizza place, or generic meal as one of the four options. Food stops belong in the Half Time section only. Exception: culturally significant food experiences that are destinations in themselves (e.g. a famous food market, cooking class, tea ceremony) may appear as options.
- IMPORTANT: Screenplay/mood are flavour hints only. Maximum 1-2 options should reference them directly. The remaining options must draw from the family's taste profile (activities they enjoy, food preferences, personality) independently, as if Screenplay/mood were not set. Varied suggestions beat thematic uniformity.
- TIMING IN THE PITCH: when a suggestion is tied to timing, describe it by its TRUE NATURE so it still makes sense if the user saves it and revisits later. DEFAULT to the recurrence pattern for recurring events ("every Saturday morning", "summer weekends", "the last weekend of June"). ONLY give a specific calendar date for genuine one-time events or fixed-annual-date events (e.g. "Bloomsday, June 16", "July 4th"). NEVER say "today", "this weekend", or "happening now" — these are meaningless once saved.

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

    let lastError: unknown = null
    while (attempts < maxAttempts) {
      attempts++
      let text = ''
      try {
        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        })
        text = message.content[0].type === 'text' ? message.content[0].text : ''
      } catch (apiErr) {
        // Transient API error (overloaded / rate limit / network) — log and retry the loop
        lastError = apiErr
        console.warn(`generate-options attempt ${attempts} API error, retrying:`, apiErr)
        continue
      }

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
        // Fuzzy uniqueness: catches near-duplicates like "Mt Auburn Cemetery" vs
        // "Mt Auburn Cemetery Watertown Walk" that an exact-string check would miss.
        const hasNearDuplicate = names.some((n: string, i: number) =>
          names.some((m: string, j: number) => i < j && sameStop(n, m))
        )
        const uniqueNames = new Set(names).size === 4 && !hasNearDuplicate
        const uniqueEmojis = new Set(emojis).size === 4
        // Exclude anything the family flagged (permanently closed / bad fit), fuzzy-matched
        const hasVetoed = names.some((n: string) => vetoes.some((v: string) => sameStop(n, v)))

        if (uniqueNames && uniqueEmojis && !hasVetoed) {
          // Valid response — include searchContext so swaps can pull from the same event pool
          return NextResponse.json({ ...data, searchContext })
        }
      }

      // Log retry attempt
      console.warn(`generate-options attempt ${attempts}: got ${data?.options?.length || 0} options, retrying...`)
    }

    // If we got here, every attempt either errored or failed validation.
    if (!data?.options || data.options.length !== 4) {
      console.error(`generate-options failed after ${maxAttempts} attempts`, lastError)
      return NextResponse.json(
        { error: lastError instanceof Error ? `Suggestion service is busy — please try again. (${lastError.message})` : 'Could not generate valid options — please try again.' },
        { status: 503 }
      )
    }

    // Last attempt had 4 options but didn't pass every uniqueness/veto check — return it
    // anyway rather than erroring (a slightly-imperfect set beats a failure screen).
    return NextResponse.json({ ...data, searchContext })
  } catch (error: unknown) {
    console.error('generate-options error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
