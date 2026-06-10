'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

const DISMISS_KEY = 'softplay_signin_banner_dismissed'

// Home-page sign-in presence: an outlined pill (always, when signed out) plus a
// one-time dismissible banner. When signed in, both collapse to a quiet
// "Syncing as <email>" line linking to the account page.
export default function SignInNudge() {
  const [email, setEmail] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(true)

  useEffect(() => {
    setBannerDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    const supabase = getSupabase()
    if (!supabase) { setMounted(true); return }
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null)
      setMounted(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setBannerDismissed(true)
  }

  if (!mounted) return <div style={{ height: 42, marginTop: 18 }} />

  if (email) {
    return (
      <Link href="/account" style={{ marginTop: 18, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#8C7B6B', textDecoration: 'none' }}>
        ✓ Syncing as {email} · Account
      </Link>
    )
  }

  return (
    <>
      {/* Outlined pill — always visible when signed out */}
      <Link href="/account" style={{ textDecoration: 'none', marginTop: 18 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1px solid #3D9E8F', borderRadius: 22, padding: '9px 18px', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#2C6B60', cursor: 'pointer' }}>
          🔑 Sign in to sync your saves
        </span>
      </Link>

      {/* One-time banner — until dismissed or signed in */}
      {!bannerDismissed && (
        <div style={{ position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 440, background: '#FFFFFF', borderRadius: 18, boxShadow: '0 8px 28px rgba(28,25,23,0.18)', padding: '14px 16px', zIndex: 200, display: 'flex', alignItems: 'center', gap: 12, animation: 'nudge-up 0.35s ease-out' }}>
          <style>{`@keyframes nudge-up { from { opacity: 0; transform: translate(-50%, 16px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🔑</span>
          <p style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: '#3D2E1C', lineHeight: 1.45, margin: 0, textAlign: 'left' }}>
            Keep your saves safe — sign in once and your Playground follows you across devices.
          </p>
          <Link href="/account" onClick={dismiss}
            style={{ flexShrink: 0, background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, borderRadius: 16, padding: '8px 14px', textDecoration: 'none' }}>
            Sign in
          </Link>
          <button onClick={dismiss} aria-label="Dismiss"
            style={{ flexShrink: 0, background: 'none', border: 'none', fontSize: 14, color: 'rgba(28,25,23,0.4)', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}
    </>
  )
}
