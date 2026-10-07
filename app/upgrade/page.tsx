'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import UpgradePrompt from '@/components/UpgradePrompt'
import { useEntitlement } from '@/lib/entitlement'

export default function UpgradePage() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const { loading, hasPaidAccess } = useEntitlement()

  useEffect(() => {
    fetch('/api/founder-slots')
      .then(res => res.json())
      .then(data => setRemaining(data.remaining))
      .catch(() => setRemaining(null))
  }, [])

  const soldOut = remaining === 0

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Upgrade</span>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        {loading ? null : hasPaidAccess ? (
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
          <UpgradePrompt variant="page" />
        )}
        </>}
      </main>
    </div>
  )
}
