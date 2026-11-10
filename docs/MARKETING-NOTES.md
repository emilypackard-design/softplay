# softplay marketing notes

*Saved 2026-11-07 from a working session, so the plan can be picked up in another chat. Nothing here has been posted yet. Decisions marked OPEN still need Emily's call.*

## Status update, 2026-11-10 (newer than the notes below)

- **Founders landing page is live:** mysoftplay.app/founders (also /beta). Hook headline, intro, a tap-to-play 15-second demo clip (Sleepy Hollow wheel spin), live seat count, offer box (US only, 14-day refund, Terms link), turning pinwheel. Use `/founders` as the link in posts so the preview shows the hook and offer.
- **Shorter buy path is live:** buttons on the founders page go to `/upgrade?buy=1`. Signed-in people go straight to Stripe; new people sign in once and are taken to Stripe automatically. Live checkout was verified end to end to a real live-mode Stripe payment page (nothing charged).
- **Real payments not yet made by a customer.** One tester (Damon) has redeemed a code; Victor and Kate have not yet.
- **Share-preview picture:** the first version cropped badly in Facebook comments (square crop from the center). A centered redesign is built locally and awaits a push; after it deploys, re-scrape both mysoftplay.app and mysoftplay.app/founders in Facebook's Sharing Debugger.

## Where things stand (as of 2026-11-07)

- Live at mysoftplay.app. Payments work end to end (confirmed with a real $9.99 purchase). Bank account verified in Stripe.
- Offer: **Founding Membership, $9.99 once, lifetime access (meaning the life of the softplay service), first 200 members.** 14-day refund. Paid features **US only for now** (VAT unresolved). All of this is in the Terms (/terms).
- Free: Free Play, and Playbook through the wheel pick. Paid: Playground saves (up to 100), Playbill memory, Play On full-day plans.
- Seats: 197 of 200 left as of 2026-11-07. The 3 founders so far are Emily's own test accounts. **Real customers: 0.**
- Beta testers: 13 codes (`WELCOME-<FIRSTNAME>`) exist. Only Victor, Kate and Damon have been messaged so far; no feedback yet. Spare codes `WELCOME-TESTER2` to `5` are for reviewers, bloggers or a forgotten tester. TESTER1 was used in a test.
- Email: support@, privacy@, hello@ all forward to Emily's Gmail (Cloudflare).
- Share previews work on Facebook and Messenger (branded pinwheel card).
- Cost to watch: Anthropic AI spend (about 4 to 7 cents per session; $75 monthly cap; auto-reload on). Free users cost money too, so a big free audience is the main risk.

## Recommendation: most efficient order (about 3 to 4 hours for the first week)

1. **Own network (about 1 hour).** Personal Facebook post and Messenger to people who've said they'd use it. Ask testers for one quotable sentence and to tell one friend.
2. **Two to four Facebook groups where Emily is already a member (about 1 hour).** Read each group's Rules tab and message the admin first. Post as a person with a story. Do not paste the same text everywhere.
3. **Five reviewer or blogger codes (about 1 hour).** Offer the spare codes to small family-activity bloggers or local-parent accounts in exchange for an honest review.
4. **One builder post (about 20 minutes).** r/SideProject is built for sharing projects. Low sales, useful feedback.
5. **Skip for now:** Reddit parenting forums (promotion is banned in r/Parenting and r/ScienceBasedParenting) and paid ads until something converts.

## What the research said (patterns, not proof; no family-app ads were found)

- Open with a **direct-address hook** that names the viewer's situation. [Ad hooks guide](https://www.trendtrack.io/blog-post/best-performing-ad-hooks)
- **Specific beats vague**; use real numbers where true. [Meta ads roundup](https://blog.adnabu.com/facebook-ads/meta-ads-examples/)
- **Founding offers** work with a clear cap and the founder price kept for good; [some founders regret underpricing](https://www.indiehackers.com/post/lifetime-deals-ltds-yes-or-no-210e5a7b1a). [Founding-member pricing](https://blog.membership.io/founding-member-pricing)
- Sell **moving the stressful decision** out of the moment, as [Plan to Eat does for dinner](https://www.plantoeat.com/?p=9444).
- Free tool for competitor ads: the [Meta Ad Library](https://www.facebook.com/ads/library) (search family-activity and meal-planning apps).
- Group rules vary; read the Rules tab and ask the admin first. [Guidance](https://www.indiehackers.com/post/how-to-share-my-product-on-a-facebook-group-without-being-salesy-ee591ec5b7). [r/SideProject](https://thehiveindex.com/communities/r-sideproject). [r/Parenting rules (third-party mirror)](https://r-weld.vercel.app/r/Parenting).

## Emily's rules for the ad copy

- Short: **3 text blocks maximum, about 6 to 8 sentences total.**
- Catchy first line, e.g. **"But what do you want to DO today?"**
- **No "I"** in the copy. No asking for feedback; this is a product for sale, not a test. Assume the audience is friends of friends or strangers.
- Don't invent testimonials or false urgency. The 200-seat cap and the live seat count are real.

## Ad drafts to review (written to those rules; not yet approved)

**Version 1**
> But what do you want to DO today?
>
> Four real ideas for your crew, then one wheel to decide. No more standoffs.
>
> $9.99 once, for life, for the first 200 members. 14-day refund. US only for now.
> mysoftplay.app

**Version 2**
> But what do you want to DO today?
>
> Everyone says "whatever works." Nobody picks.
>
> softplay gives four real ideas for your family and a wheel that settles it. Lifetime access is $9.99 for the first 200 members, with a 14-day refund. US only for now.

**Version 3**
> But what do you want to DO today?
>
> Four ideas. One wheel. No debate.
>
> Spin up your weekend free at mysoftplay.app. Love it? Founding Members get lifetime access for $9.99 (first 200 only).

**Alternative first lines (no "I"):** "Saturday, 9:14 a.m. Nobody knows what we're doing." / "Four ideas. One wheel. Zero arguments." / "The weekend standoff ends here."

Tip: use a pinned first comment for detail (what's included, refund, US only) so the ad itself stays short.

## Facebook post copy (saved 2026-11-10)

**Emily's own draft, posted in a group of people she knows (first-person is right there):**
> I built an app called softplay to help families, couples or friends plan fun days out! It's designed like a game where you get dealt cards based on your preferences and location and there are multiple pathways to decide what you want to do. Great to use on trips to new locations or to find hidden gems in your own neighborhood. You can set parameters like budget, mode of transportation, and even food preferences and get suggestions that you can save within the app.

Voice rule of thumb: **"I" is fine for personal and group posts to people who know Emily; the no-"I" rule is for ads aimed at strangers.**

**Feedback on that draft:**
- Best line: "designed like a game where you get dealt cards." Keep it.
- No hook, no offer and no next step. Add the hook and a clear call to action.
- **Accuracy fixes:** (1) The app has a "Low cost" choice in Free Play, plus mood, time, travel and distance in Playbook, but **no budget setting**. Say "low cost" or drop "budget." (2) **Saving is a Founding Member (paid) feature.** Promising "suggestions you can save" to free users sets up a paywall surprise. Say it is part of the founding offer.
- "Multiple pathways" is jargon. Use "two ways to play."
- Link to `mysoftplay.app/founders`, in the first comment.

**Ad / stranger version (no "I", 3 blocks):**
> But what do you want to DO today? 🎡
>
> softplay deals you four real ideas for a day out, based on where you are and who's coming. Answer a few questions or flip through cards, then spin the wheel and let fate decide. Great for new places or the hidden gems in your own neighborhood.
>
> Free to try. The first 200 members get lifetime access (saved favorites, full day plans) for $9.99, once. 14-day refund. US only for now. 👇

**Personal / group version (first person):**
> I built an app called softplay for the "so... what do we do today?" standoff. 🎡
>
> You tell it where you are and who's coming (family, friends, a date). It deals you four real ideas, like cards, and a wheel settles it so nobody has to decide. It's great for trips to new places and for finding hidden gems in your own neighborhood.
>
> Free to try. The first 200 members get lifetime access (saved favorites, full day plans) for $9.99, once. 14-day refund, US only for now. Link in the first comment.

## Assets and decisions still needed

- OPEN: the **real origin story** for Emily (earlier drafts wrongly assumed Emily is a parent). A true story outsells a generic one.
- OPEN: **testimonials**. Ask testers for one real sentence. Nothing has been invented.
- Strong asset to make: a **15-second screen recording** of Playbook landing on the wheel and a real card.
- **Built and live:** the landing page at /founders and the 15-second demo clip (see the status update at the top).
- Idea, not built: a **rulebook** at mysoftplay.app/rulebook (see below).

## Rulebook idea (not started)

A playful user guide, reachable from the home screen and at /rulebook, explaining how softplay works, in the app's own language. Outline from the app's real screens:

1. **The three ways to play:** Playbook, Free Play, Playground.
2. **Playbook, step by step:** Cast Members (your crew), "What sounds like a good day?", "What's a hard no?", Food (loves and avoids), "Picture a perfect day out", Home base, "Now, today's plan", then four ideas, optional swaps, and the wheel.
3. **Free Play:** pick a place and crew size, flip cards; pin, heart (Family Fave), skip or flag.
4. **Flags:** Permanently closed (remembered), Not today and Bad suggestion (this session only).
5. **Play On:** the built day, with Half Time (food), and Before, After and Evening add-ons; notes (700 characters); copy the plan; email it on mobile.
6. **Playground:** saves grouped by city; what the Playbill remembers.
7. **Free versus Unlimited:** what each includes, and the Founding Membership.

OPEN: build it as a page, and where to link it.

## Open questions to settle in the marketing chat

- Which Facebook groups to target, and their rules.
- Final ad wording, and whether to run a small paid test later.
- When to check in on Victor, Kate and Damon.
- Reminder already scheduled for 5 January 2027 (lawyer review, VAT, whether to keep Vercel Pro).
