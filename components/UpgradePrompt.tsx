'use client'

import { useState } from 'react'
import Link from 'next/link'
import { rememberBuyIntent, startCheckout } from '@/lib/checkout'

const S = {
  page: { minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' as const },
  inline: { width: '100%', maxWidth: 400, margin: '0 auto', padding: '8px 20px 0', textAlign: 'center' as const },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(28,25,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 300 },
  card: { width: '100%', maxWidth: 400, background: '#FEFBF3', borderRadius: 24, padding: '32px 28px', boxShadow: '0 12px 40px rgba(28,25,23,0.25)', textAlign: 'center' as const },
  icon: { fontSize: 40, marginBottom: 12 },
  h2: { fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 8px' },
  lede: { fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 20px' },
  list: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, gap: 10 },
  li: { fontFamily: 'var(--font-body)', fontSize: 14, color: '#3D2E1C', lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start' },
  cta: { display: 'block', width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, border: 'none', cursor: 'pointer', boxShadow: '0 4px 18px rgba(242,201,76,0.4)' },
  secondary: { marginTop: 12, background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#8C7B6B', cursor: 'pointer', textDecoration: 'underline' },
  error: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C5C5C', margin: '14px 0 0' },
}

const VALUE_PROPS = [
  { emoji: '📌', text: 'Save up to 100 favorite spots to your Playground' },
  { emoji: '🧠', text: "We remember your crew — skip the questions next time" },
  { emoji: '🗺️', text: "Full itineraries with Play On — hours, directions, the whole day" },
]

interface Props {
  variant?: 'page' | 'modal' | 'inline'
  onClose?: () => void
}

export default function UpgradePrompt({ variant = 'modal', onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upgrade = async () => {
    setLoading(true)
    setError(null)
    const result = await startCheckout()
    if ('url' in result) {
      window.location.href = result.url
      return
    }
    if ('needsSignIn' in result) {
      // Straight to sign-in; after signing in they go on to checkout automatically.
      rememberBuyIntent()
      window.location.href = '/account'
      return
    }
    setError(result.error)
    setLoading(false)
  }

  const content = (
    <>
      <div style={S.icon}>🔓</div>
      <h2 style={S.h2}>Unlock softplay Unlimited</h2>
      <p style={S.lede}>Free play helps you decide today. Unlimited remembers you for next time.</p>
      <ul style={S.list}>
        {VALUE_PROPS.map(v => (
          <li key={v.text} style={S.li}><span>{v.emoji}</span><span>{v.text}</span></li>
        ))}
      </ul>
      <button onClick={() => void upgrade()} disabled={loading} style={{ ...S.cta, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Loading…' : 'Become a Founding Member — $9.99 once'}
      </button>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#B0A090', lineHeight: 1.5, margin: '10px 0 0' }}>
        US customers only for now. One-time payment, 14-day refund. By purchasing you agree to our{' '}
        <Link href="/terms" style={{ color: '#3D9E8F', fontWeight: 600 }}>Terms</Link>.
      </p>
      {error && <p style={S.error}>{error}</p>}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8C7B6B', margin: '12px 0 0' }}>
        Have a code?{' '}
        <Link href="/account" style={{ color: '#3D9E8F', fontWeight: 700 }}>Enter it on your Account page →</Link>
      </p>
      {onClose && <button onClick={onClose} style={S.secondary}>Not now</button>}
    </>
  )

  if (variant === 'page') {
    return <div style={S.page}><div style={{ width: '100%', maxWidth: 400 }}>{content}</div></div>
  }
  if (variant === 'inline') {
    return <div style={S.inline}>{content}</div>
  }
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.card} onClick={e => e.stopPropagation()}>{content}</div>
    </div>
  )
}
