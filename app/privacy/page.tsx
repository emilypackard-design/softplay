import Link from 'next/link'

// Public privacy policy page. The reviewable source lives in PRIVACY-POLICY.md;
// this is the live, on-brand rendering of it (internal review notes and
// [LEGAL CHECK] flags deliberately omitted). Keep the two in sync when editing.

export const metadata = {
  title: 'Privacy Policy — softplay',
  description: 'How softplay handles your data.',
}

const s = {
  h2: { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#1C1917', margin: '32px 0 10px' } as const,
  p: { fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', lineHeight: 1.7, margin: '0 0 12px' } as const,
  li: { fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', lineHeight: 1.7, margin: '0 0 8px' } as const,
  th: { fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: '#1C1917', textAlign: 'left' as const, padding: '8px 10px', borderBottom: '1.5px solid #E8DCC8' },
  td: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#5C4E3D', lineHeight: 1.55, padding: '8px 10px', borderBottom: '1px solid #F0E8DA', verticalAlign: 'top' as const },
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Privacy</span>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090', margin: '0 0 8px' }}>Effective date: 20 July 2026</p>

        <h2 style={s.h2}>Who we are</h2>
        <p style={s.p}>softplay (&ldquo;softplay&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a family activity-planning app operated by <strong>Emily Packard</strong>, based in <strong>Ireland</strong>. We are the <em>data controller</em> for the personal data described in this policy.</p>
        <p style={s.p}>For any privacy question or request, contact us at <strong>privacy@mysoftplay.app</strong>.</p>

        <h2 style={s.h2}>The short version</h2>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li style={s.li}>We collect only what softplay needs to plan activities for you and remember them across your devices.</li>
          <li style={s.li}><strong>We do not run ads, we do not show sponsored results, and we never sell your data.</strong> We make money from players, not from data.</li>
          <li style={s.li}>Your data is protected so that only you (when signed in) can see and edit it.</li>
          <li style={s.li}>You can ask us to show you, correct, or delete your data at any time.</li>
        </ul>

        <h2 style={s.h2}>What data we collect</h2>
        <p style={s.p}><strong>When you sign in:</strong> your <strong>email address</strong>. We use passwordless sign-in — you enter your email, we send you a one-time sign-in link, and you never create a password. Your email identifies your account so your saved plans follow you across devices.</p>
        <p style={s.p}><strong>When you use the app:</strong></p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li style={s.li}><strong>Your Playbill</strong> — the profile you build about your crew: how many adults and children, children&apos;s ages and interests, activities you like and dislike, food preferences, your home city, and any free-text notes you add.</li>
          <li style={s.li}><strong>Food preferences</strong> — the kinds of food and eating spots your crew enjoys or would rather skip. These are taste and lifestyle preferences only. <strong>softplay does not ask for, and is not intended to store, medical or health information such as allergies.</strong></li>
          <li style={s.li}><strong>Your Playground saves</strong> — the activities and places you save and the city they belong to.</li>
          <li style={s.li}><strong>The requests you type</strong> that we send to our AI provider to generate suggestions for you.</li>
        </ul>
        <p style={s.p}><strong>Automatically:</strong> softplay keeps a working copy of your Playbill, saves, and notes in your browser&apos;s local storage so the app is fast and works offline (app functionality, <strong>not</strong> advertising or tracking cookies). Like any website, our hosting provider records standard technical information (such as IP address and request times) to keep the service running and secure. We do <strong>not</strong> use third-party advertising or analytics trackers.</p>

        <h2 style={s.h2}>Data about children</h2>
        <p style={s.p}>softplay is designed to be used by a <strong>parent or guardian</strong> planning activities for their family. It is not intended to be used directly by children. Any information about children (such as ages or interests) is entered by the adult using the app, is kept to the minimum needed to personalise suggestions, and is protected exactly like the rest of your Playbill. We do not knowingly let children create their own accounts. If you believe a child has provided us data directly, contact us and we will delete it.</p>

        <h2 style={s.h2}>Why we use your data, and our legal basis</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 12px' }}>
            <thead>
              <tr><th style={s.th}>What we do</th><th style={s.th}>Why</th><th style={s.th}>Legal basis (GDPR Article 6)</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>Create and run your account</td><td style={s.td}>So your plans persist and sync across devices</td><td style={s.td}>Performance of a contract (Art. 6(1)(b))</td></tr>
              <tr><td style={s.td}>Generate personalised suggestions from your Playbill</td><td style={s.td}>The core service you asked for</td><td style={s.td}>Performance of a contract (Art. 6(1)(b))</td></tr>
              <tr><td style={s.td}>Send you sign-in links</td><td style={s.td}>To let you access your account</td><td style={s.td}>Performance of a contract (Art. 6(1)(b))</td></tr>
              <tr><td style={s.td}>Keep the service secure and working</td><td style={s.td}>To protect you and us</td><td style={s.td}>Our legitimate interests (Art. 6(1)(f))</td></tr>
            </tbody>
          </table>
        </div>

        <h2 style={s.h2}>Who we share data with</h2>
        <p style={s.p}>We do not sell your data and we do not share it for advertising. We use a small number of trusted service providers (&ldquo;processors&rdquo;) to run softplay, each only processing your data on our instructions:</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 12px' }}>
            <thead>
              <tr><th style={s.th}>Provider</th><th style={s.th}>What they do for us</th><th style={s.th}>Where</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>Supabase</td><td style={s.td}>Stores your account, Playbill and saves (our database and sign-in)</td><td style={s.td}>United States</td></tr>
              <tr><td style={s.td}>Anthropic (Claude AI)</td><td style={s.td}>Turns your typed requests into activity suggestions</td><td style={s.td}>United States</td></tr>
              <tr><td style={s.td}>Resend</td><td style={s.td}>Delivers your sign-in emails</td><td style={s.td}>United States</td></tr>
              <tr><td style={s.td}>Vercel</td><td style={s.td}>Hosts and serves the app</td><td style={s.td}>United States / global</td></tr>
              <tr><td style={s.td}>Cloudflare</td><td style={s.td}>Manages our domain and routes our contact email</td><td style={s.td}>Global</td></tr>
            </tbody>
          </table>
        </div>
        <p style={s.p}>The requests you send to us are used only to generate your suggestions — we never use them for advertising and we never sell them. Our AI provider processes them as our service provider, under its own commercial terms.</p>

        <h2 style={s.h2}>International data transfers</h2>
        <p style={s.p}>Because the providers above are based in or operate from the <strong>United States</strong>, your data is transferred outside the European Economic Area. Where that happens, the transfer is protected by appropriate safeguards — such as the European Commission&apos;s Standard Contractual Clauses and each provider&apos;s data-processing agreement. You can ask us for more detail at any time.</p>

        <h2 style={s.h2}>How long we keep your data</h2>
        <p style={s.p}>We keep your data for as long as your account is active. If you ask us to delete it, or delete your account, we remove your personal data from our systems (and instruct our processors to do the same) within <strong>30 days</strong>, except where we must keep something to meet a legal obligation.</p>

        <h2 style={s.h2}>Your rights</h2>
        <p style={s.p}>Under the GDPR you have the right to <strong>access</strong> the data we hold about you, <strong>correct</strong> anything inaccurate, <strong>delete</strong> your data, <strong>restrict</strong> or <strong>object</strong> to how we use it, and <strong>port</strong> your data (receive a copy in a usable format).</p>
        <p style={s.p}>To exercise any of these, email <strong>privacy@mysoftplay.app</strong>. We will respond within one month. You also have the right to complain to the Irish supervisory authority: the <strong>Data Protection Commission</strong> (<a href="https://www.dataprotection.ie" style={{ color: '#3D9E8F' }}>www.dataprotection.ie</a>).</p>

        <h2 style={s.h2}>Deleting your data</h2>
        <p style={s.p}>You can delete your account and everything saved to it <strong>at any time, yourself</strong>, from the <strong>Account</strong> page — sign in, then choose &ldquo;Delete my account&rdquo;. This immediately and permanently removes your account, Playbill, and saves. You can also email <strong>privacy@mysoftplay.app</strong> and we will do it for you within 30 days.</p>

        <h2 style={s.h2}>How we protect your data</h2>
        <p style={s.p}>Your saved data is guarded by row-level security, so that only you — while signed in — can read or change it. Data is encrypted in transit. We use passwordless sign-in, so there is no password to be lost or stolen.</p>

        <h2 style={s.h2}>Cookies and local storage</h2>
        <p style={s.p}>softplay uses your browser&apos;s local storage to hold a working copy of your plans so the app runs quickly and offline. We do <strong>not</strong> use third-party advertising or tracking cookies. A minimal sign-in token is stored so you stay signed in between visits.</p>

        <h2 style={s.h2}>Changes to this policy</h2>
        <p style={s.p}>If we change this policy, we&apos;ll update the effective date above and, for significant changes, let you know in the app or by email.</p>

        <h2 style={s.h2}>Contact</h2>
        <p style={s.p}>Questions, requests, or concerns: <strong>privacy@mysoftplay.app</strong>.</p>

        <div style={{ marginTop: 40 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#3D9E8F', textDecoration: 'none' }}>← Back to softplay</Link>
        </div>
      </main>
    </div>
  )
}
