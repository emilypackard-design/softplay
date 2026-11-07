'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useEntitlement } from '@/lib/entitlement'

// Quiet home-screen line about the Founding Membership, for people who haven't bought.
export default function FounderOffer() {
  const { loading, hasPaidAccess } = useEntitlement()
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/founder-slots')
      .then(r => r.json())
      .then(d => setRemaining(typeof d.remaining === 'number' ? d.remaining : null))
      .catch(() => setRemaining(null))
  }, [])

  if (loading || hasPaidAccess || remaining === 0) return null

  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#5C4E3D', lineHeight: 1.5, margin: '14px 0 0', textAlign: 'center', maxWidth: 360 }}>
      <strong>Founding Member:</strong> $9.99 once for lifetime access.
      {remaining !== null && <> {remaining} of 200 left.</>}{' '}
      <Link href="/upgrade" style={{ color: '#3D9E8F', fontWeight: 700 }}>See what&apos;s included →</Link>
    </p>
  )
}
