# softplay — Project Briefing

## What This Project Is
A fun decision maker app for families (or anyone) planning activities and outings. Helps answer the question: "What should we do today?"

**Three pathways:**
- **Playbook** — Answer questions about your crew, mood, and constraints → get 4 personalized suggestions → spin the wheel to decide
- **Free Play** — Pick a location, flip through activity cards, save favorites
- **Playground** — View and organize all saved activities by location

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **API:** Claude (Anthropic SDK) for activity suggestions
- **Storage:** localStorage (V1.0), Supabase planned for V1.5
- **Deployment:** Vercel (auto-deploys on git push to `master`)
- **Hosting:** https://softplay-five.vercel.app/
- **Repository:** https://github.com/emilypackard-design/softplay

## Key Decisions
- **localStorage for now** — No auth/database in V1.0, keeping it simple
- **Claude API for suggestions** — More thoughtful recommendations than random; respects family preferences
- **Three distinct pathways** — Different entry points for different moods (structured vs. spontaneous)
- **Pin vs. Heart distinction** — "Save for Later" (📌) vs. "Save as Favorite" (❤️) for intentional saving
- **Fern gradient design** — Warm, natural color palette (no harsh blues/purples)

## Current Status (V1.0)
✅ **Shipped Features:**
- Playbook full questionnaire + wheel spinner
- Free Play card flipping and suggestion generation
- Playground save organization by location
- Play By Play itinerary (shared by Playbook & Playground paths)
- Notes field (700 char limit) on itineraries
- Flag/veto system with localStorage persistence
- Removal confirmation popups for add-ons
- Copy itinerary to clipboard
- Responsive mobile-first design

## V1.5 Roadmap
- [ ] **Supabase migration** — Move localStorage → cloud database for sync across devices
- [ ] **Location deduplication UI** — Handle typos/duplicates ("Greystones" vs "greystones")
- [ ] **Cross-device sync** — Saves visible on any device with login

## V2 & Beyond
- Email reminders (Sunday digest of the week's plan)
- Randomness generator (for extra spontaneity)
- Playlist feature (curated music for the day)
- Shareable itinerary links
- Family collaboration/voting
- **Confirmation/reflection page** — before card generation (both pathways), the app reflects back its understanding ("You're a family of 4 in Dublin June 26-28, kids love food events, adults love literary festivals…") so the user can correct typos, faulty logic, or misread dates. Doubles as the date-arithmetic safety net (echoes the *resolved* date so "last weekend" errors get caught).
  - **Feel-seen framing:** gathers everything so far into a warm reflection; interesting-but-wrong inferences ("sounds like you love water sports") are a feature — they invite correction ("actually one child can't swim yet") that sharpens the result.
  - **Selective write-back to memory:** durable corrections ("one child can't swim", "the 8yo is scared of pirates") get promoted to the **Playbill** so they shape every future plan (with a gentle "Want me to remember this?" confirm). Ephemeral ones ("no hikes today") stay session-only — don't pollute the permanent profile. This is the natural write-back moment for family memory (ties to `lastPlaybill` persistence + Supabase profile).
  - **GUARDRAIL — stays a decision tool, not a chatbot:** ONE screen, ONE optional correction round, then generate. Reflect → nudge → go. NOT a negotiating dialogue. If it becomes 2-3 back-and-forths it has failed softplay's core promise (ending the "what should we do?" spiral, not recreating it).

## Documentation Files
- **CLAUDE.md** (this file) — Project briefing; read automatically at session start
- **docs/DESIGN.md** — Visual language, colors, typography, component specs
- **docs/PROGRESS.md** — Session-by-session changelog; what was built, bugs found, blockers
- **docs/V1.5-MEMORY.md** — Working notes for the V1.5 effort

## How to Deploy
1. Make code changes locally
2. Commit to git: `git commit -m "description"`
3. Push to master: `git push origin master`
4. Vercel auto-deploys within 1-2 minutes
5. View live at https://softplay-five.vercel.app/

No manual steps needed — GitHub webhook tells Vercel to rebuild automatically.

## How We Work Together
- Emily is not a programmer — always explain what's happening in plain English
- Test changes locally with `npm run dev` before pushing
- Keep documentation current (update CLAUDE.md + docs/PROGRESS.md at session end)
- Prefer simple solutions over clever ones
- Ask before making large changes
