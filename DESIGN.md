# Soft Play Decision Maker — Visual Design Brief
*Updated June 2026*

---

## Brand Name & Wordmark

- **App name:** softplay (one word, all lowercase)
- **Subtitle:** Fun Decision Maker
- **Full lockup:** softplay in large italic light serif, FUN DECISION MAKER in small teal caps below

### Wordmark spec
- Font: Fraunces, weight 300, italic
- Size: 54px on mobile
- Colour: #5A4F48 (warm dark brown — not black)
- Letter-spacing: -1px
- All lowercase, one word: softplay

### Subtitle spec
- Font: Plus Jakarta Sans, weight 700
- Size: 11px
- Letter-spacing: 3.5px
- Text-transform: uppercase
- Colour: #3D9E8F (teal)

### Tagline
- "Because great Saturdays don't plan themselves."
- Fraunces, weight 300, italic, 16px
- Colour: rgba(28,25,23,0.5)

---

## Brand Personality
Sunny, warm, confident. Playful without being childish. Works for a 7-year-old and a 14-year-old and their parents equally. Think golden hour and daisy fields, not a toy shop. Universal appeal — designed to scale beyond one family.

---

## Colour Palette

```
Primary (Honey Yellow):     #F5C842  — wheel highlights, CTAs
Background (Warm White):    #FEFBF3  — main app background, never stark white
Ink (Warm Near-Black):      #1C1917  — all text, headers, icons
Card (Warm Off-White):      #F5EFE0  — card backgrounds, input fields
Teal (Muted):               #3D9E8F  — save/Playground actions, secondary buttons
Coral (Warm):               #E07055  — veto/never actions only, used sparingly
Sand (Warm Grey):           #E8DCC8  — borders, dividers, inactive states
White:                      #FFFFFF  — elevated cards, modals
Brown (Wordmark):           #5A4F48  — app name only
```

### Colour usage rules
- Yellow is the energy — use it for the primary action on every screen
- Ink on warm white for all body text — never pure black on pure white
- Teal for save/positive secondary actions (Playground, Play It Again Sam)
- Coral only for destructive or veto actions (Never, remove)
- Sand for anything structural but non-interactive
- Never use more than 3 colours on a single screen

---

## Typography

```
Wordmark:   Fraunces — Weight 300, italic — app name only
Headings:   Plus Jakarta Sans — Bold (700) and ExtraBold (800)
Body:       Inter — Regular (400) and SemiBold (600)
Numbers:    Plus Jakarta Sans — for wheel segments, counters, scores
```

### Type scale (mobile-first)

```
Wordmark:   54px / Fraunces 300 italic  — home screen only
Display:    32px / Plus Jakarta Sans 800 — hero moments
H1:         26px / Plus Jakarta Sans 700 — screen titles
H2:         20px / Plus Jakarta Sans 700 — section headers
H3:         17px / Plus Jakarta Sans 600 — card titles
Body:       15px / Inter 400            — descriptions, pitches
Small:      13px / Inter 400            — labels, metadata
Micro:      11px / Inter 600            — tags, caps labels (uppercase + letter-spacing: 1.5px)
```

---

## Fonts to import

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,300&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
```

---

## Iconography

### Hero icon — Pinwheel
Four blades in: **amber (#C9963A), teal (#3D9E8F), ink (#1C1917), yellow (#F5C842)**
- Yellow blade has subtle stroke so it reads on yellow backgrounds
- Brown stick (#C9963A)
- Dark centre pin

Use the pinwheel as:
- App icon
- Loading state (spinning animation)
- Empty state illustration

### Supporting icon set
```
🎟️  Ticket stub     — Play It Again Sam screen
🧭  Compass         — Explore / discovery
🏳️  Pennant flag    — Playground saves
🪁  Kite            — Free Play mode
📋  Playbill        — Family profile screen
🎲  Die/dice        — Surprise me
⏱️  Stopwatch       — Play Structure filters
```

---

## Spacing & Layout

```
Base unit:          8px
Screen padding:     20px horizontal
Card padding:       18px
Card border-radius: 20px (cards), 30px (pills/chips), 50% (circles)
Section gap:        24px
Element gap:        12px
```

- Mobile first — one hand
- Generous whitespace — never cramped
- One primary action per screen — full-width at the bottom
- Cards: `0 4px 16px rgba(28, 25, 23, 0.08)`
- No harsh borders — shadow and background change instead

---

## Component Patterns

### Primary Button
```
Background:     #F5C842 (honey yellow)
Text:           #1C1917 (ink)
Font:           Plus Jakarta Sans 700, 16px
Height:         52px
Border-radius:  26px
Shadow:         0 4px 18px rgba(245, 200, 66, 0.4)
Full width on mobile
```

### Secondary Button
```
Background:     transparent
Border:         1.5px solid #E8DCC8
Text:           #1C1917
Font:           Inter 600, 14px
Height:         44px
Border-radius:  22px
```

### Destructive / Veto Button
```
Background:     #FFF0EC
Text:           #E07055 (coral)
Use only for Never / remove actions
```

### Home screen path cards
```
Playbook:  linear-gradient(180deg, #F5C842 0%, #FEF9E8 100%)  — yellow fading to cream
Free Play: linear-gradient(135deg, #FEFBF3 0%, #C8E6E1 100%) — cream fading to soft teal
```

### The Wheel
```
Segment colours (in order):
  #F5C842  honey yellow
  #3D9E8F  teal
  #E07055  coral
  #F5EFE0  warm sand
  #6B8F6E  sage
  #C9963A  amber
  #B8D4C8  mint
  #E8C49A  peach

Centre circle:  #1C1917 ink dot (no text)
Pointer:        #E07055 coral triangle, top centre
Spin duration:  4-4.5 seconds, cubic-bezier(0.22, 1, 0.36, 1)
```

---

## Naming System

| Term | Meaning |
|------|---------|
| Soft Play | The app |
| Playbill | Family profile |
| Free Play | Path 1 — card swipe discovery |
| Playbook | Path 2 — full itinerary planner with wheel |
| Play by Play | Venue details + structured plan |
| Play Ball | The spin / commit moment |
| Play On | Add-ons and tie-ins |
| Play Structure | Session filters (time, transport, duration) |
| Screenplay | Movie/book mood tie-in |
| Playlist | Day soundtrack (V2) |
| Half Time | Food stop |
| Playground | The Stash / saved wishlist |
| Time Out | Save for later / skip |
| Play It Again Sam | Quick post-day rating (❤️ 👍 👎) |
| I Have Notes | Freeform post-day scratchpad (V1.5) |
| Props | What to bring or wear |
| Guest Player | Adding someone to today |
| Sitting Out | Removing a family member today |
| Green It | Lower carbon activity filter |
| No/Low Cost | Free / low cost filter |
| The Play's the Thing | Evening add-on |

---

## What to Avoid
- No pure white backgrounds — always #FEFBF3
- No pure black text — always #1C1917
- No pink or purple
- No overly cute or babyish illustration styles
- No corporate blues or cold greys
- No more than 3 colours on a single screen
- No busy backgrounds or patterns
- No small touch targets — minimum 44px
- No loading spinners without a warm quip or the pinwheel
