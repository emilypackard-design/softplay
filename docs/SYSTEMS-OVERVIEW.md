# softplay: how everything fits together

*Written 2026-11-07. A plain-English guide to what each service does. A formatted copy with a diagram lives at https://claude.ai/artifact/VJ5PmcGcKFrZidsFmUkDcr*

## The big picture

softplay (mysoftplay.app) is one website built from eight services, each with one job: your computer and Claude Code write the app, GitHub stores it, Vercel publishes it, Supabase remembers people, Stripe takes payments, Anthropic supplies the AI, and Cloudflare and Resend handle the domain and email.

You rarely need to open most of them. Three matter week to week: **Stripe** (sales and payouts), **Anthropic** (AI spending) and **Vercel** (is the site up).

## Who does what

Each service has one job. Log in to a service only when you need the thing in the last column.

| Service | Its job, in plain words | What it holds for softplay | Visit it to... |
| --- | --- | --- | --- |
| Your computer + Claude Code | Where the app is edited and tested | The project folder (C:\Users\Emily\dev\softplay) and a private file of test keys | Ask for changes and try them before they go public |
| GitHub | Safe storage for the code, with a history of every change | The softplay code (emilypackard-design/softplay) | See or undo past changes |
| Vercel | Publishes the website and runs the AI behind it | The live site, the live secret keys, the daily keep-alive, the 20-requests-a-minute limit | Check the site is up, roll back a bad update |
| Supabase | The app's memory: accounts, saves, Playbills | Who is signed in, saved cards, who is a Founding Member, tester codes | Look up an account, run database updates |
| Stripe | Takes the $9.99 payment and pays you | Sales, refunds, your bank link, the "someone paid" notification | See sales, issue a refund, check payouts |
| Anthropic | The AI (Claude) that writes suggestions | Your prepaid credit and the $75 monthly spending cap | Check AI spending and the balance |
| Cloudflare | The domain's address book and email forwarding | mysoftplay.app, plus privacy@, support@ and hello@ forwarding to your Gmail | Add or change an email address |
| Resend | Sends the sign-in emails | The link emails sent from noreply@mysoftplay.app | Check whether a sign-in email was sent |

## How the pieces connect

- A visitor only ever talks to **Vercel** (the live website).
- **Vercel** asks **Anthropic** for suggestions, and asks **Supabase** to remember accounts and saves.
- **Stripe** tells **Vercel** who has paid. Customers type their card details on Stripe's own page, never on softplay.
- **Supabase** has **Resend** send sign-in emails.
- **Cloudflare** points mysoftplay.app at Vercel and forwards the support emails.
- To publish a change: Claude Code on your computer saves it to **GitHub**, and Vercel updates the live site automatically within a couple of minutes.

## What costs money, and what protects you

Your fixed cost is Vercel at about $21.40 a month including tax. The AI is the cost that grows with use, and it is capped.

| Service | Cost | Protection in place |
| --- | --- | --- |
| Vercel Pro | $20 a month plus tax (about $21.40 shown at checkout) | Firewall rule: 20 requests a minute per visitor on all /api/ routes |
| Anthropic | Pay as used. Estimate: 4 to 7 cents per session, roughly $30 to $90 a month at 200 weekly users | $75 monthly spending cap, auto-reload on, email alert at about $60 |
| Stripe | A fee on each sale, taken before payout (check Stripe's pricing page for the exact rate) | Support email and policies listed on the account |
| Supabase | Free plan | Daily keep-alive stops it pausing from inactivity |
| Cloudflare, Resend, domain | Not checked | None needed yet |

The Anthropic figures are estimates from the size of the app's requests, not measured bills. Check the real number after the first month.

## Where the secret keys live

Secret keys live in exactly two places: a private file on your computer for testing (`.env.local`), and Vercel's Environment Variables for the live site.

| Key | What it unlocks | Where it lives |
| --- | --- | --- |
| Stripe secret key | Charging cards and issuing refunds | Computer: the test key. Vercel: the live key. |
| Stripe webhook secret | Proves "someone paid" messages really come from Stripe | Vercel (and your computer's file) |
| Supabase service role key | Full access to the database, bypassing the normal rules | Vercel and your computer's file |
| Anthropic API key | Spending your AI credit | Vercel and your computer's file |
| Supabase web address and public key | Safe to expose: the website needs them to load | Vercel and your computer's file |

Four rules: never paste a key into chat, email or a post; never put the live Stripe key on your computer; never upload the private file to GitHub (it is already blocked from uploading); and if a key leaks, replace it in its service the same day.

## If something breaks

Start with the symptom, open the one service named, and bring what you see to Claude Code.

| Symptom | Look first at | Usual cause |
| --- | --- | --- |
| The site is down or blank after an update | Vercel, then Deployments | A bad update. Roll back to the previous deployment. |
| Someone paid but has no access | Stripe's webhook delivery log, then Supabase | The "someone paid" message failed. Check it, and the person's plan in Supabase. |
| Suggestions or plans stop loading | Anthropic spending page | Monthly cap reached or credit balance empty |
| A sign-in email never arrives | The recipient's spam folder, then Resend | Spam filtering. Ask them to try again. |
| A tester code does not work | Supabase, comp_codes table | The code was already used or mistyped |
| Email to support@ bounces | Cloudflare, Email Routing, Routes | The address is missing from the list |
| A Supabase "will be paused" email | Vercel's Cron Jobs page | The daily keep-alive stopped. Open the project in Supabase to restore it. |

To change the app, ask Claude Code. It edits the files on your computer, tests them, uploads them to GitHub, and Vercel publishes them within a couple of minutes.
