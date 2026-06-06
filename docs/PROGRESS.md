# softplay — Development Progress Log

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
