<!--
  ⚠️ REVIEW-BEFORE-PUBLISHING NOTE (delete this whole comment block before you publish):
  - This is a tailored DRAFT, not legal advice. Because softplay processes children's data
    and takes payments, it's worth a quick pass by someone with GDPR/legal eyes before it
    goes live. Parts most worth their attention are flagged with [LEGAL CHECK] inline.
  - The "Deleting your data" section describes self-serve deletion as live. Before publishing,
    make sure the "Delete my account" button is actually deployed — i.e. the account-page change
    is live AND the delete_user() function has been run in Supabase (supabase/schema.sql).
-->

# Privacy Policy — softplay

**Effective date:** 20 July 2026

## Who we are

softplay ("softplay", "we", "us") is a family activity-planning app operated by **Emily Packard**, based in **Ireland**. We are the *data controller* for the personal data described in this policy.

For any privacy question or request, contact us at **privacy@mysoftplay.app**.

## The short version

- We collect only what softplay needs to plan activities for you and remember them across your devices.
- **We do not run ads, we do not show sponsored results, and we never sell your data.** We make money from players, not from data.
- Your data is protected so that only you (when signed in) can see and edit it.
- You can ask us to show you, correct, or delete your data at any time.

The rest of this policy is the detail behind those promises.

## What data we collect

**When you sign in:**
- **Your email address.** We use passwordless sign-in — you enter your email, we send you a one-time sign-in link, and you never create a password. Your email identifies your account so your saved plans follow you across devices.

**When you use the app:**
- **Your Playbill** — the profile you build about your crew: how many adults and children, children's ages and interests, activities you like and dislike, food preferences, your home city, and any free-text notes you add.
- **Food preferences** — the kinds of food and eating spots your crew enjoys or would rather skip (for example bakeries, street food, or "no fine dining"). These are taste and lifestyle preferences only. **softplay does not ask for, and is not intended to store, medical or health information such as allergies.**
- **Your Playground saves** — the activities and places you save (as hearts or pins) and the city they belong to.
- **The requests you type** that we send to our AI provider to generate suggestions for you (see [Who we share data with](#who-we-share-data-with)).

**Automatically:**
- **On-device storage.** softplay keeps a working copy of your Playbill, saves, and notes in your browser's local storage so the app is fast and works offline. This is app functionality, **not** advertising or tracking cookies.
- **Basic technical logs.** Like any website, our hosting provider records standard technical information (such as IP address and request times) to keep the service running and secure.

We do **not** use third-party advertising or analytics trackers.

## Data about children

softplay is designed to be used by a **parent or guardian** planning activities for their family. It is not intended to be used directly by children.

Any information about children (such as ages or interests) is entered by the adult using the app, is kept to the minimum needed to personalise suggestions, and is protected exactly like the rest of your Playbill. We do not knowingly let children create their own accounts. If you believe a child has provided us data directly, contact us and we will delete it. *[LEGAL CHECK: confirm approach to children's data is appropriate for your launch markets.]*

## Why we use your data, and our legal basis

| What we do | Why | Legal basis (GDPR Article 6) |
|---|---|---|
| Create and run your account | So your plans persist and sync across devices | Performance of a contract (Art. 6(1)(b)) |
| Generate personalised suggestions from your Playbill | The core service you asked for | Performance of a contract (Art. 6(1)(b)) |
| Send you sign-in links | To let you access your account | Performance of a contract (Art. 6(1)(b)) |
| Keep the service secure and working | To protect you and us | Our legitimate interests (Art. 6(1)(f)) |

## Who we share data with

We do not sell your data and we do not share it for advertising. We do use a small number of trusted service providers ("processors") to run softplay. Each only processes your data on our instructions:

| Provider | What they do for us | Where |
|---|---|---|
| **Supabase** | Stores your account, Playbill and saves (our database and sign-in) | United States |
| **Anthropic** (Claude AI) | Turns your typed requests into activity suggestions | United States |
| **Resend** | Delivers your sign-in emails | United States |
| **Vercel** | Hosts and serves the app | United States / global |
| **Cloudflare** | Manages our domain and routes our contact email | Global |

The requests you send to us are used only to generate your suggestions — **we never use them for advertising and we never sell them**. Our AI provider (Anthropic) processes them as our service provider, under its own commercial terms.

## International data transfers

Because the providers above are based in or operate from the **United States**, your data is transferred outside the European Economic Area. Where that happens, the transfer is protected by appropriate safeguards — such as the European Commission's **Standard Contractual Clauses** and each provider's data-processing agreement. You can ask us for more detail at any time.

## How long we keep your data

We keep your data for as long as your account is active. If you ask us to delete it, or delete your account, we remove your personal data from our systems (and instruct our processors to do the same) within **30 days**, except where we must keep something to meet a legal obligation.

## Your rights

Under the GDPR you have the right to:

- **Access** the data we hold about you
- **Correct** anything inaccurate
- **Delete** your data ("right to be forgotten")
- **Restrict** or **object** to how we use it
- **Port** your data (receive a copy in a usable format)

To exercise any of these, email **privacy@mysoftplay.app**. We will respond within one month.

You also have the right to complain to the Irish supervisory authority:
**Data Protection Commission** — [www.dataprotection.ie](https://www.dataprotection.ie).

## Deleting your data

You can delete your account and everything saved to it **at any time, yourself**, from the **Account** page — sign in, then choose **"Delete my account"**. This immediately and permanently removes your account, Playbill, and saves. You can also email **privacy@mysoftplay.app** and we will do it for you within 30 days.

## How we protect your data

Your saved data is guarded by row-level security, so that only you — while signed in — can read or change it. Data is encrypted in transit. We use passwordless sign-in, so there is no password to be lost or stolen.

## Cookies and local storage

softplay uses your browser's **local storage** to hold a working copy of your plans so the app runs quickly and offline. We do **not** use third-party advertising or tracking cookies. A minimal sign-in token is stored so you stay signed in between visits.

## Changes to this policy

If we change this policy, we'll update the effective date above and, for significant changes, let you know in the app or by email.

## Contact

Questions, requests, or concerns: **privacy@mysoftplay.app**.
