import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — softplay',
  description: 'The terms for using softplay and buying a Founding Membership.',
}

const s = {
  h2: { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#1C1917', margin: '32px 0 10px' } as const,
  p: { fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', lineHeight: 1.7, margin: '0 0 12px' } as const,
  li: { fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', lineHeight: 1.7, margin: '0 0 8px' } as const,
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Terms</span>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>Terms of Service</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090', margin: '0 0 8px' }}>Effective date: 14 October 2026</p>

        <h2 style={s.h2}>Who we are</h2>
        <p style={s.p}>softplay (&ldquo;softplay&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a family activity-planning app at mysoftplay.app, operated by <strong>Emily Packard</strong>, based in <strong>Ireland</strong>. By using softplay you agree to these terms. If you don&apos;t agree, please don&apos;t use it. Our <Link href="/privacy" style={{ color: '#3D9E8F' }}>Privacy Policy</Link> explains how we handle your data.</p>

        <h2 style={s.h2}>Who can use softplay, and where</h2>
        <p style={s.p}>softplay is for adults planning activities for themselves and their families. You must be at least 18 to create an account or make a purchase. Paid features are <strong>currently available to customers in the United States only</strong>.</p>

        <h2 style={s.h2}>What&apos;s free and what&apos;s paid</h2>
        <p style={s.p}><strong>Free:</strong> Free Play, and Playbook up to the wheel&apos;s pick. <strong>softplay Unlimited:</strong> saving and viewing your Playground, saving your Playbill across visits and devices, and Play On itineraries. We may change what is free and what is paid in future, but we won&apos;t remove features from a Founding Member&apos;s Unlimited access without good reason (see &ldquo;Founding Membership&rdquo;).</p>

        <h2 style={s.h2}>Founding Membership</h2>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li style={s.li}>A Founding Membership is a <strong>one-time payment of US$9.99</strong>, limited to the first 200 members. It unlocks softplay Unlimited with no further charge.</li>
          <li style={s.li}><strong>&ldquo;Lifetime&rdquo; means the lifetime of the softplay service, not your lifetime.</strong> You keep Unlimited for as long as softplay operates. If we ever shut softplay down, we will give you at least 30 days&apos; notice.</li>
          <li style={s.li}>Founding Memberships are for one person and one account, and can&apos;t be transferred or resold.</li>
          <li style={s.li}>Some early testers received complimentary Founding Memberships by access code. These work the same way, but have no cash value and can&apos;t be exchanged for a refund.</li>
          <li style={s.li}>Future plans (such as a subscription) will be priced separately. They won&apos;t affect what you already own.</li>
        </ul>

        <h2 style={s.h2}>Payments and refunds</h2>
        <p style={s.p}>Payments are processed by <strong>Stripe</strong>. We never see or store your card details. Prices are in US dollars.</p>
        <p style={s.p}><strong>Refunds:</strong> if you&apos;re not happy, email <strong>support@mysoftplay.app</strong> within <strong>14 days</strong> of your purchase and we&apos;ll refund you in full, no questions asked. After 14 days, purchases are non-refundable unless the law says otherwise. Refunds end your Unlimited access.</p>

        <h2 style={s.h2}>Your account</h2>
        <p style={s.p}>You sign in with a one-time link sent to your email. You&apos;re responsible for keeping access to that email secure and for activity on your account. Please give us an accurate email address. You can delete your account at any time from the Account page, which permanently removes your data. Deleting your account ends your Founding Membership, and we can&apos;t restore it afterwards.</p>

        <h2 style={s.h2}>Suggestions come from AI &mdash; please double-check</h2>
        <p style={s.p}>softplay uses AI to suggest activities, places, opening hours and itineraries. AI can be wrong. A place may be closed, moved, booked out, unsuitable for your family, or may not exist. <strong>Always confirm opening hours, prices, addresses, accessibility and safety before you go.</strong> You are responsible for supervising children and for decisions you make about where to go and what to do. softplay is a decision aid, not professional advice.</p>

        <h2 style={s.h2}>Using softplay fairly</h2>
        <p style={s.p}>Please don&apos;t misuse softplay. That includes trying to break or overload it, scraping it, reverse-engineering it, sharing or reselling access, using automated tools to create accounts or redeem codes, or using it for anything unlawful. We may suspend or end accounts that do. If we end a paid account for misuse, we may not refund it.</p>

        <h2 style={s.h2}>Our content and yours</h2>
        <p style={s.p}>softplay, its design, name and software belong to us. We grant you a personal, non-exclusive licence to use it. What you enter (your Playbill, saves and notes) remains yours, and you give us permission to store it and process it to run the service for you, as described in our Privacy Policy.</p>

        <h2 style={s.h2}>Availability and changes</h2>
        <p style={s.p}>We work to keep softplay running, but we can&apos;t promise it will always be available or error-free. We may update or change softplay and these terms. If we make a significant change to these terms we&apos;ll update the date above and let you know in the app or by email. If you keep using softplay after a change, you accept it.</p>

        <h2 style={s.h2}>Our responsibility</h2>
        <p style={s.p}>softplay is provided &ldquo;as is&rdquo;. To the fullest extent the law allows, we are not liable for indirect or consequential losses, for loss of data or enjoyment, or for anything that happens at the places or activities we suggest. Our total liability for any claim relating to softplay is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits any rights you have under consumer protection law, or liability that can&apos;t legally be limited (such as for death or personal injury caused by negligence, or for fraud).</p>

        <h2 style={s.h2}>Governing law</h2>
        <p style={s.p}>These terms are governed by the laws of Ireland, without affecting any mandatory consumer rights you have in the place where you live.</p>

        <h2 style={s.h2}>Contact</h2>
        <p style={s.p}>Questions, refunds or concerns: <strong>support@mysoftplay.app</strong>. Privacy requests: <strong>privacy@mysoftplay.app</strong>.</p>

        <div style={{ marginTop: 40 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#3D9E8F', textDecoration: 'none' }}>← Back to softplay</Link>
        </div>
      </main>
    </div>
  )
}
