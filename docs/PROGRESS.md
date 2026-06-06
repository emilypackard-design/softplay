# softplay — Development Progress Log

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

### Playground Pathway — Real Code Fixes Needed (separate from deployment)
Found in `app/playground/[city]/play-by-play/page.tsx`:
1. **Crew default** — page hardcodes `sessionAdults: 2` (line ~56). Not a bug, just a default. Fix: in Playground pathway, don't render crew chips at all (no Playbill = no crew shown).
2. **"Check website" redundancy** — page hardcodes `'Check website'` into address, hours, AND price (lines ~75-78). Our earlier filter only cleaned the `tip` field, so it missed these. Fix: leave these blank when unknown rather than "Check website".
3. **Back button** — currently "← Back to Playground", small underlined teal (line ~142). Fix per testing notes: clearer label + readable styling.

### Content Quality Note
- **"Legendary" overuse** — food cards (from `/api/add-on`, type=food) repeatedly describe dishes as "legendary." Not forced by prompt; LLM wording habit. Fix: add instruction to vary language and avoid superlatives (legendary/famous/iconic). Noticeable when browsing 10 food options in a row.

---

**Next steps:** Fix deployment blocker first, then these UI refinements in V1.5.
