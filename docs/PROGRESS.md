# softplay — Development Progress Log

## ⏭️ NEXT SESSION — START HERE

> **State:** V1.5 fully shipped. Resend custom SMTP live — ready to onboard 10+ beta testers.
> **Next tasks, in order:**
> 1. **Onboard beta testers** — send mysoftplay.app link + instructions. No rate limit risk now that Resend is set up.
> 2. **Migrate the 2 original testers:** they sign in on softplay-five.vercel.app FIRST (uploads their saves), then sign in on mysoftplay.app (saves follow). Then they live on mysoftplay.app.
> 3. **Mobile-test feedback** from Emily's session (screenshots incoming).
> 4. **Stripe: POST-beta, not concurrent** (decided 2026-06-08). Use beta feedback to choose pricing model first.

## ✅ Session (2026-06-21) — Resend custom SMTP + tester feedback notes

### Beta tester feedback (2 responses so far, waiting for 10 before acting)
- **Local/one-time events** — testers couldn't find them. Stopgap shipped: Play Structure free-form notes field now detects date-specific signals (e.g. "farmers market this Saturday") and triggers a web search in `generate-options`. Placeholder updated to hint at this capability: *"Would like to find a summer farmers market this Saturday."* Not a full events API — covers community/seasonal events but not big ticketed events (concerts, sports).
- **Subscription pricing** — both testers pushed back. Decision: wait for more responses before choosing model (subscription vs. one-time vs. freemium). Casual feedback from others has been positive ("I'd definitely use this").

## ✅ Session (2026-06-21) — Resend custom SMTP

- **Resend account created**, mysoftplay.app verified as sending domain (Ireland eu-west-1, via Cloudflare auto-configure).
- **Supabase SMTP configured:** host `smtp.resend.com`, port 465, sender `noreply@mysoftplay.app`, name `softplay`.
- **Tested:** magic link sent + received from `noreply@mysoftplay.app` ✅
- Rate limit is now gone — safe to invite 10+ testers simultaneously.

## (prior) V1.5 Supabase (persistent memory)

> ▶️ **Next session = build V1.5 persistent memory.** Full plan in **`docs/V1.5-MEMORY.md`**. Two decisions to make first: (1) **auth model** — Claude recommends email magic link; (2) **Free Play personalization** — feed the Playbill in, keep it anonymous, or a toggle.
> ⚡ **Known quick-win bug to fix as part of this:** `lastPlaybill` is read but **never saved** — so "remember your Playbill" does nothing today. Persisting it (localStorage first, then Supabase) is Step 0.
> Emily reviewed Playbook/Playground/Free Play this session — all good. Geography fix + city dedup confirmed working.

## ⏭️ Handoff (pending tests / infra)

> 📁 **Project moved out of OneDrive.** Repo now lives at **`C:\Users\Emily\dev\softplay`** (stopped the sync prompts + build locks). Deploy as always: `npx vercel --prod --yes` from there. Live at `mysoftplay.app`.

**✅ AUTO-DEPLOY RESTORED (2026-06-08):** `git push` → automatic Production deploy is working again. Root causes fixed: (1) GitHub default branch + 86 unpushed local commits brought current; (2) Vercel Production Branch Tracking had reverted to `main` — set back to `master`. CLI deploys (`npx vercel --prod --yes`) still work but are no longer required. **New standard flow: commit + push.**

**✅ Pinned fixes — ALL SHIPPED (2026-06-08, via first auto-deploy):**
- Shared fuzzy matcher `lib/stopNames.ts` (folds accents é→e, +/&, parens) — used by Half Time dedup AND wildcard candidate filter ("Flour Bakery + Cafe (Seaport)" and "Arnold Arboretum of Harvard University" cases both verified by unit test).
- Food geography widened: Half Time may roam ~15-20 min from the main event, varying neighbourhood/direction (bigger pool, fewer repeats); Before/After stay tightly clustered.
- Free Play flag replacement now fetches in the BACKGROUND — deck never disables, no more slowdown from ~3rd card.

**Recently RESOLVED (✅):**
- **Playground card-action alignment** — decided to LEAVE Playground cards as-is (heart toggle moves between Save for Later ↔ Family Faves; no separate Pin button needed). Context differs from Playbook/Free Play, so they shouldn't match. Closed.
- **City-name deduplication** — done via a SAFE **prefix-merge** (`lib/cityGroups.ts`): "Greystones Ireland"→"Greystones", "Brattleboro VT"→"Brattleboro"; different qualifiers stay separate ("Cambridge England" vs "MA", "Manchester NH" vs "VT"). Groups for display only — underlying save data is untouched (full drag-and-drop reconciliation still a V2 nicety). Closed.
- **Before/After dupes** — Before/After now forced distinct (prompt + client-side dedup retry using `sameStop`), and steered toward ACTIVITIES not full meals (light food only as an exception).
- **Land highlight** — locked at **700ms** (300ms felt too subtle); green-ring pulse + slide on card move. Good.
- **Circle/rectangle button borders** — matching-color outlines added across Play On pills, Playbook options, Playground city circles, and Free Play action circles.

**Still to test (full pass):**
- Playbook end-to-end after the back-button cleanup (no missing/duplicate backs; crew + play-structure backs read bold/colored).
- Free Play: confirm Pin·Heart·Flag·Skip order, Skip behaves (advances, won't resurface), flag still adds one replacement, 6-card limit holds.
- Play On: greyed-out removed add-ons; Half Time instant ✕ Swap; flag→replacement.
- All three pages now have the softplay|Playground header — confirm spacing/gradient feel consistent on mobile.
- Playground card styling not yet updated to the newer spec (deferred).

**Infra (carried over):**
- **Restore GitHub→Vercel auto-deploy** (currently deploying via `npx vercel --prod --yes`; auto-deploy webhook still not firing — convenience, not a blocker).
- **Custom domain `mysoftplay.app`** is now added to the Vercel project (DNS on Cloudflare, auto-configured, grey-cloud/DNS-only, propagating ~10-20 min). Domain attaches to the PROJECT → no reconfiguration needed when Supabase is added in V1.5. `softplay-five.vercel.app` still works.
- **V1.5 reminder — migrate testers:** the 2 current testers stay on `softplay-five.vercel.app` (their Playground saves live in that origin's localStorage). Once Supabase (cloud storage) lands, move everyone to `mysoftplay.app`. localStorage is per-origin, so saves do NOT carry across the two URLs until cloud sync exists.

---

## Session 4 (2026-06-08) — Screen-by-screen copy/design review + domain

### Season / date awareness (AI prompts)
- All four suggestion routes (`generate-options`, `free-play-cards`, `play-by-play`, `add-on`) now inject **today's date** (`new Date().toLocaleDateString`) + an instruction to factor the season & typical weather **at the location** (hemisphere-aware). No UI change — server-side prompt only. Auto-adjusts as the calendar moves.

### Pinwheel (PinwheelIcon component)
- Added **`spinDuration`** prop (seconds/rotation) and **`stem`** prop (false = wheel only, square viewBox).
- **Home page** pinwheel: now spins **slowly** (`spinning spinDuration={9}`) — gentle motion, not a "loading" read.
- **Playbook welcome** pinwheel: **static** (no spin), stemmed, centered.
- **Colors:** kept ORIGINAL blade colors (amber `#C9963A`, teal `#3D9E8F`, coral `#E07055`, yellow `#F5C842`) — a proposed amber/yellow/ink update was tried then reverted (specs were outdated). Stem stays amber `#C9963A`.

### Playbook welcome ("second page")
- New copy: H1 "Ready to plan your day?", then two **equal-weight** body lines (both 16px `#5C4E3D`): "Every production starts with a cast and crew." / "Your Playbill will remember who you are and what you like so you never have to start from scratch." → button "Build my Playbill".
- Text **centered** (tried left-aligned, reverted — looked worse). Back button "← Back" (bold ink) anchored top-left.

### Cast Members (crew step)
- 🎭 now sits in a **frosted circle badge**: 64×64, `background: rgba(255,255,255,0.7)`, `border-radius: 50%`, centered, `font-size: 30`, `box-shadow: 0 2px 12px rgba(28,25,23,0.08)`.

### Likes chips (FUN_CHIPS)
- Removed **"Art galleries"** (was duplicated in the dislikes list).
- Added **"Visual arts"** (sentence case to match convention, 🖼️ icon).
- **Alphabetized** the full list (also fixed "Live shows" which was out of order).

### Playground header rollout (carried from Session 3, completed)
- Full-width cream **softplay | Playground** bar on main + city + play-by-play pages.
- City page: more breathing room above the city name (header padding 80→76 with the bar), emerald gradient extended to `100% 420px`; main page matched (420px).
- Removed redundant "← Home" on main Playground page; removed "Plan a [city] day" footer button.

### Free Play actions — standardized
- Now **Pin · Heart · Flag · Skip** (was "No Thanks 👎 · Flag · Pin · Heart"). 👎 replaced with coral **✕ Skip**.

---

## Session 3 (2026-06-06) — Testing Pass: Playground, Free Play, Playbook

### Card Actions — Standard Order
- **Universal action order: Pin · Heart · Flag · Swap** (Playbook reordered to match).
- Playground city cards differ structurally (saved items): Heart/Pin toggle, Flag, delete, "Play this card" — alignment TBD.

### Flag = Free Replacement (universal rule)
- Anytime a card is flagged, the user gets a free replacement: **Playbook** (swap), **Free Play** (flag adds ONE replacement), **Play On** (flag regenerates).
- **Exception:** flagging in **Playground** removes the saved item, NO replacement (e.g., saved a museum, found it closed).

### Play On (PlayByPlayView) behavior
- **Before/After/Evening = one choice, take it or leave it** (reduce decision fatigue). Once removed (✕ + confirm), the "Play On" button is **greyed out / unclickable** ("… — removed"). Exception: flagging gives a replacement.
- **Half Time = the browseable exception.** Opening it loads a batch of food options **in parallel** (quick), then **"✕ Swap"** (bottom-right, matching Playbook's Swap) cycles **instantly** through them (no per-swap API wait) — same feel as Free Play.

### Free Play
- **6-card limit restored** (earlier endless-deck auto-replenish was reverted).
- **Flag adds exactly ONE replacement card** (so flagged cards don't shrink the six); pin/heart/skip work through the set.
- Veto safety filter: flagged/vetoed cards never re-shown for that city.
- **DONE:** Free Play actions standardized to **Pin · Heart · Flag · Skip** (flex `order`). The 👎 "No Thanks" replaced with a coral **✕ Skip** (same veto+advance behavior). Now matches Playbook/Play On.

### Wheel chip empty-text bug — FIXED
- Wildcard swapped into the wheel used `title` (no `name`); wheel chips render `name` → blank chip. Now maps `name: familyFaveHeart.title`. (Was intermittent — only with a wildcard in play.)

### Back-button audit + standardization
- **Header (softplay left, pathway name right) already exists and matches on Playbook AND Free Play** (shared `<header>` on all steps).
- **DONE:** added the **full-width cream softplay|Playground header bar** to ALL Playground pages (main + city detail + play-by-play), matching Playbook/Free Play. Style: `display:flex; justify-content:space-between; padding:16px 20px; width:100%; border-bottom:1px solid #E8DCC8; background:#FEFBF3`. softplay wordmark `#5A4F48` (links home), pathway label `#B0A090`. Sits above the emerald daisy hero; bumped `backgroundSize` to `100% 420px` so the gradient extends down with the content (no cramped feel).
- Removed the redundant **"← Home"** on the main Playground page (the header's softplay wordmark covers home). City + play-by-play keep their back buttons (they go to the list / one-step-back, not home).
- **Removed the "Plan a [city] day →" footer button** from the Playground city page — it dropped users into the Playbook flow and muddied the path. Playground is now single-purpose: browse saves + "Play this card".
- **Playbook:** removed the redundant TOP "← Back" on steps that already have a bottom Back│Next (fun-chips, not-fun-chips, food, great-day, practical).
- **Kept + restyled** the only-back on **crew** and **play-structure** to bold/colored (14px, 700, ink) — Playground style, not the old underlined grey.
- **Back-button style rule:** bold/colored (not underlined grey). Color need not be uniform — white on dark backgrounds where chosen (e.g., Playground on emerald), dark ink on light backgrounds (Playbook).
- Playground back nav: city-detail "← 🌼 Playground" (white daisy), play-by-play "← Back" (centered column), main "← Home". All in centered column, consistent placement.

### Food chips
- Added **🍷 Bistros** and **🍽️ Gourmet meals** to FOOD_LOVE_CHIPS.

---

## Session 2 (2026-06-06) — Deployment Fix + Design Pass

### Deployment — RESOLVED (use CLI)
- **Root cause of "changes not showing":** git push to GitHub stopped triggering production deploys after the disconnect/reconnect; production was frozen at an old commit. Build is fine (passes locally + on Vercel).
- **Working method:** deploy with `npx vercel --prod --yes` from the project folder (authenticated CLI, project already linked via `.vercel/`). Aliases to softplay-five.vercel.app in ~30-60s. Used ~20x this session, all READY.
- **V1.5 task:** restore GitHub→Vercel auto-deploy (convenience, not a blocker). Diagnosis plan already logged below.

### Design System — LOCKED
- **Primary green:** emerald `#1C7E46` (chosen over lime fern, which read too yellow/grey).
- **Playground gradient (both main + city pages):** one continuous gradient, NOT two. Implementation: on the `screen` div use `backgroundImage: linear-gradient(180deg, #1C7E46 0%, #4F9D6C 20%, #84BD93 42%, #B9D9C0 64%, #E4F1E5 84%, #FEFBF3 100%)`, `backgroundRepeat: no-repeat`, `backgroundSize: 100% 240px`, `backgroundColor: #FEFBF3`. Header is transparent. This fades emerald→cream over the top ~240px then stays cream behind cards (no two-tone seam).
- **Nav text on the emerald top:** WHITE (black tested, too low-contrast).
- **Daisy back-nav convention:** small daisy next to the "Playground" word on links that navigate to Playground. WHITE petals on green backgrounds (city detail back button); GREEN petals (`#2E9D5B`, gold center `#F0A820`) on light backgrounds (play-by-play white header). Applied to: city-detail "← 🌼 Playground" and play-by-play "← 🌼 Back to Playground". NOT on home page, NOT on "View in Playground →", NOT on "Send back to Playground".
- **Home page Playground link:** thin divider hairline above + pin `📌` + "Playground" in light italic serif (`var(--font-wordmark)`, italic, weight 300, 19px, `#1C1917`). No button/pill/circle, no arrow. (Long iteration — this is the final.)
- **Back-button placement:** standardized — absolute top-left within the centered 480px header column (city view now matches main page).

### Content + Bug Fixes (this session)
- **Wildcard-swap cards bug:** were white text on white card (unreadable). Now dark text (`#1C1917`/`#8C7B6B`) like the options screen.
- **Crew chips:** Playground play-by-play no longer passes default 2 adults (sessionAdults: 0, sessionKids: []), so no crew chips when no Playbill.
- **"Check website":** removed hardcoded placeholders from address/hours/price on the Playground main stop (left blank → omitted).
- **"Legendary" overuse:** `/api/add-on` food prompt now instructs varied language, no superlatives.

### Features / Nav
- **Food chips added:** 🍷 Bistros, 🍽️ Gourmet meals (FOOD_LOVE_CHIPS, ids `bistro`/`gourmet` feed the prompt).
- **"Plan another day"** (Playground play-by-play) now routes to Home `/` (top "← Back to Playground" covers returning to saves).

### Still Open for V1.5
- **City header spacing (deferred polish):** on the Playground city detail page, the city name (e.g., "DUBLIN") sits too high / too close to the "← Playground" back button. Fix: increase header top padding (e.g. 52px → ~68px) OR add a divider line under the back button like the home page. Quick 1-line tweak.
- Restore GitHub auto-deploy (see diagnosis below)
- City-name deduplication (Greystones variants)
- Playground card styling to new spec
- (Optional) gradient continuity treatment already solved on Playground pages; reuse pattern elsewhere if needed

---

## Session 1 (2026-06-06)

### What Was Built
1. **Three UI fixes for Playbook card display:**
   - Crew size header now only shows if user explicitly set crew during setup (no more "2 adults" default)
   - Half-time card no longer pre-loads on mount; only generates when user clicks "Play On"
   - "Check website" placeholder text filtered out when no actual URL exists

2. **Home page Playground button redesign:**
   - Changed background from sage green (#D4E8D4) to fern green (#5AAA32)
   - Added coral pin icon (📌) before "Playground" text
   - Changed text color to white for contrast

3. **GitHub + Vercel setup:**
   - Created GitHub account for user (emilypackard-design)
   - Pushed initial codebase to https://github.com/emilypackard-design/softplay
   - Connected GitHub to Vercel
   - Configured Production environment to track `master` branch
   - Auto-deployment now active: push to GitHub → Vercel deploys within 1-2 min

4. **Documentation structure:**
   - Created `softplay.md` (project briefing for session starts)
   - Moved `DESIGN.md` to `docs/DESIGN.md` (stable design reference)
   - Created `docs/PROGRESS.md` (this file - session changelog)

### Issues Encountered & Resolved
1. **Deployment not showing changes** 
   - Root cause: Vercel Production environment was tracking `main` branch, but code was pushed to `master`
   - Fix: Changed Environments > Production > Branch Tracking from `main` to `master`
   - Lesson: Verify branch configuration when connecting new repos to Vercel

2. **OneDrive sync conflicts**
   - Issue: OneDrive asking to delete `.next` and `node_modules` folders
   - Solution: De-sync softplay folder from OneDrive (build artifacts don't need backup)

3. **Multiple .md files and naming confusion**
   - Was using generic "CLAUDE.md" instead of project-specific naming
   - Resolved: Using "softplay.md" + docs/ subfolder for clarity

### Code Changes Committed
- `c703b61` — Initial commit (all three UI fixes + home button redesign)
- `c8aa0ef` — Trigger deployment (test commit to force Vercel rebuild)

### Current Status
- ✅ All code changes committed to GitHub master branch
- ✅ GitHub default branch set to master
- ✅ Vercel Production environment configured to track master
- ✅ Repo disconnected/reconnected for fresh sync
- ❌ **BLOCKER:** Vercel builds succeed but deployed code doesn't match GitHub source
  - Hypothesis: Next.js build caching issue or infrastructure-level problem at Vercel
  - Affects: PlayByPlayView crew size fix, Playground gradient background
  - Workaround: Code is safe on GitHub; investigate build process in V1.5

### What DID Deploy Successfully ✅
- Home page Playground button: Coral pin icon visible
- (Other fixes blocked by deployment issue)

### Testing Checklist (Next Session — After Fixing Build)
- [ ] Home page: Playground button has coral pin + fern green background
- [ ] Playbook no crew: No "2 adults" header (crew size fix)
- [ ] Playbook with crew: Header appears correctly
- [ ] Half-time only on "Play On" click (no auto-load)
- [ ] No "Check website" placeholder text
- [ ] Playground page: Fern gradient background applied
- [ ] Mobile responsive
- [ ] All three pathways work: Playbook → Free Play → Playground

### Notes for Next Session
- Once changes are live, do full testing pass across all pathways
- Then pivot to V1.5 planning: Supabase integration
- Location deduplication deferred to V1.5 (needs proper reconciliation UI)
- All documentation now in place; keep softplay.md + PROGRESS.md updated

### Files Modified This Session
- `/app/page.tsx` — Playground button styling
- `/components/PlayByPlayView.tsx` — Crew size, half-time, check website filters
- `/softplay.md` — NEW
- `/docs/DESIGN.md` — Moved from root
- `/docs/PROGRESS.md` — NEW
- `.github/` config — Auto-created by GitHub

### Known Quirks & Future Tweaks
- **Playground button color** — Fern green (#5AAA32) is deployed and working, but user wants to workshop color choice (consider other greens from palette or test alternatives)
- Otherwise stable

### V1.5 Testing Notes — Playground Page Fixes

**Back Button (city detail page):**
- Current: "← back" uses browser back, too small/faint on mobile
- Fix: Navigate to `/playground` (home), label "← Home", 14px bold, light colour for contrast on dark green
- Alternative: Use 🏠 home icon instead of text

**City List Grouping:**
- Issue: Duplicate cities showing (e.g., "Greystones" entered different ways)
- Fix: Normalise city strings in localStorage before grouping (lowercase, trim whitespace)

**Preview Pills:**
- Current: Only showing 1 pill per city
- Fix: Show 1 heart + 1 pin preview pill per city (if both exist)

**Background Gradient (full page, not just header):**
- Current: Too saturated, abrupt stop at header
- Fix: Apply 6-stop gradient covering full page height:
  ```
  linear-gradient(180deg, 
    #2E6A14 0%,      ← dark fern
    #5AAA32 20%,     
    #96D060 42%,     
    #CCE8A0 65%,     ← lightening
    #EEF8DC 82%,     ← almost cream
    #FEFBF3 100%     ← full cream
  )
  ```

**Daisy SVG:**
- Current: Oversized
- Fix: 72px (not larger)

**Card Styling:**
- Playground city cards not yet updated to new design spec

**Gradient banding bug (city detail page) — for V1.5 design pass:**
- `app/playground/[city]/page.tsx` applies the full 6-stop gradient TWICE: once on `screen` (full height) and again on `header` (~100px). The header's compressed gradient ends in cream, then the content area jumps back to green — causing the "green block / no fade" look.
- Proper fix: make header `background: transparent` so the single screen gradient flows continuously. BUT this puts dark title/meta text on the dark-fern top → must also decide light-vs-dark header text for contrast (design decision, do with visual preview). Deferred to V1.5 gradient pass.

### Deployment Diagnosis (Session 2)
- **Confirmed via curl:** Live home page serves old `#5AAA32` button, not latest `#B8E090`. Response headers show `Age: ~20500s (~5.7h)` and `X-Vercel-Cache: HIT`.
- **Local build succeeds** (exit code 0) — code is NOT broken.
- **Conclusion:** Production deployment is stuck on an older commit; git-push deploys are not promoting to production. The original CLI `vercel deploy` worked (that's why the daisy + initial design are live), but subsequent GitHub-push deploys aren't replacing production.
- **Next:** Confirm which commit the "Current" production deployment shows in Vercel dashboard to decide fix.

### Session 2 Outcome — Deployment RESOLVED (via CLI)
- **Confirmed:** Production was frozen at commit `5c2cc3c` (predated the `#B8E090` button). After the GitHub disconnect/reconnect, git pushes stopped creating ANY new deployments (not even failed ones) — points to the auto-deploy webhook not firing, NOT a user setup mistake.
- **Fix used:** `npx vercel --prod --yes` from the linked local project (`.vercel/` already authenticated as emilypackard-7296). This is the SAME CLI method used before GitHub was added — proven to work. Ran it 3x this session; all READY/production.
- **How to deploy now (until git auto-deploy is fixed):** from the project folder run `npx vercel --prod --yes`. Builds on Vercel, aliases to softplay-five.vercel.app in ~30-60s.
- **GitHub still valuable:** code is now backed up + version-controlled + ready for staging workflow. Auto-deploy is a convenience to restore, not a blocker.

### V1.5 TASK — Restore Git Auto-Deploy (convenience, not blocker)
Diagnosis plan:
1. Make one trivial commit + push to master.
2. Watch Vercel Deployments list. If NO new deployment appears → webhook not firing (most likely). If one appears but errors → build issue.
3. If webhook: in Vercel → Settings → Git, disconnect/reconnect once more, OR check GitHub repo → Settings → Webhooks for a Vercel webhook + recent delivery status (look for failed deliveries).
4. Until fixed, CLI deploy is the official method.

### Code Fixes Deployed This Session (commits 384fcca, + saves-counter)
- Playground path no longer shows default "2 adults" crew chips
- Dropped hardcoded "Check website" from address/hours/price
- Food prompt: varied language, no "legendary"/superlatives
- Back buttons readable: main Playground "← Home" (white/bold/14px); city-detail "← Playground" (white/bold)
- Saves counter: readable white on dark header

### Playground Pathway — Real Code Fixes Needed (separate from deployment)
Found in `app/playground/[city]/play-by-play/page.tsx`:
1. **Crew default** — page hardcodes `sessionAdults: 2` (line ~56). Not a bug, just a default. Fix: in Playground pathway, don't render crew chips at all (no Playbill = no crew shown).
2. **"Check website" redundancy** — page hardcodes `'Check website'` into address, hours, AND price (lines ~75-78). Our earlier filter only cleaned the `tip` field, so it missed these. Fix: leave these blank when unknown rather than "Check website".
3. **Back button** — currently "← Back to Playground", small underlined teal (line ~142). Fix per testing notes: clearer label + readable styling.

### Decision Pending — "Plan another day" button destination (Playground play-by-play)
- Bottom CTA currently labeled "Plan another day" → routes to /playground. Previously "Back to Playground".
- Claude's recommendation: KEEP "Plan another day" but route to HOME (/). The screen already has a top "← Back to Playground", so a bottom button to Playground is redundant. Home opens all three paths and is only one extra tap to replay a Playground card.
- Awaiting Emily's final call before changing.

### Content Quality Note
- **"Legendary" overuse** — food cards (from `/api/add-on`, type=food) repeatedly describe dishes as "legendary." Not forced by prompt; LLM wording habit. Fix: add instruction to vary language and avoid superlatives (legendary/famous/iconic). Noticeable when browsing 10 food options in a row.

---

**Next steps:** Fix deployment blocker first, then these UI refinements in V1.5.
