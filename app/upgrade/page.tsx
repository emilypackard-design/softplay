'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UpgradePrompt from '@/components/UpgradePrompt'
import PinwheelIcon from '@/components/PinwheelIcon'
import { useEntitlement } from '@/lib/entitlement'
import { rememberBuyIntent, startCheckout } from '@/lib/checkout'

export default function UpgradePage() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const { loading, signedIn, hasPaidAccess } = useEntitlement()
  const router = useRouter()
  const [heading, setHeading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    fetch('/api/founder-slots')
      .then(res => res.json())
      .then(data => setRemaining(data.remaining))
      .catch(() => setRemaining(null))
  }, [])

  // /upgrade?buy=1 is the fast path used by ads and the founders page: signed-in
  // people go straight to Stripe; everyone else is sent to sign in and then straight
  // on to Stripe (the account page brings them back here with ?buy=1).
  useEffect(() => {
    if (loading || ran.current) return
    if (new URLSearchParams(window.location.search).get('buy') !== '1') return
    ran.current = true
    window.history.replaceState(null, '', '/upgrade')
    if (hasPaidAccess) return
    setHeading(true)
    if (!signedIn) {
      rememberBuyIntent()
      router.replace('/account')
      return
    }
    void startCheckout().then(result => {
      if ('url' in result) { window.location.href = result.url; return }
      setHeading(false)
      setCheckoutError('error' in result ? result.error : 'Please sign in again to continue.')
    })
  }, [loading, signedIn, hasPaidAccess, router])

  const soldOut = remaining === 0

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Upgrade</span>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        {heading ? (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ marginBottom: 16 }}><PinwheelIcon size={48} spinning /></div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>Taking you to checkout…</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', lineHeight: 1.6, margin: 0 }}>One moment.</p>
          </div>
        ) : loading ? null : hasPaidAccess ? (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>You&apos;re a Founding Member</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', lineHeight: 1.6, margin: '0 0 24px' }}>
              You already have softplay Unlimited. Nothing more to buy.
            </p>
            <Link href="/" style={{ display: 'block', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, textDecoration: 'none' }}>
              Back to softplay →
            </Link>
          </div>
        ) : <>
        {remaining !== null && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: soldOut ? '#B0A090' : '#3D9E8F', margin: '0 0 8px' }}>
            {soldOut ? 'Founding Membership is sold out' : `${remaining} of 200 Founding Memberships left`}
          </p>
        )}
        {soldOut ? (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>All 200 founder spots are taken</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', lineHeight: 1.6 }}>
              Standard pricing is coming soon. Check back shortly.
            </p>
          </div>
        ) : (
          <>
            {checkoutError && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C5C5C', margin: '0 0 12px', textAlign: 'center', maxWidth: 360 }}>{checkoutError}</p>
            )}
            <UpgradePrompt variant="inline" />
          </>
        )}
        </>}
      </main>
    </div>
  )
}
