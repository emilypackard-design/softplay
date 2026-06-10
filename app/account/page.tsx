'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

// Sign in with an email magic link. While signed in, your Playbill and
// Playground saves sync to the cloud and follow you across devices.
export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) { setMounted(true); return }
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null)
      setMounted(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const sendLink = async () => {
    const supabase = getSupabase()
    if (!supabase || !email.trim()) return
    setSending(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/account' : undefined },
    })
    setSending(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  const signOut = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setSent(false)
    setEmail('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Account</span>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!mounted ? null : userEmail ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🪪</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>You&apos;re signed in</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 6px' }}>{userEmail}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', lineHeight: 1.6, margin: '0 0 28px' }}>
                Your Playbill and Playground saves now sync to your account and follow you across devices.
              </p>
              <Link href="/" style={{ display: 'block', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, textDecoration: 'none', marginBottom: 12, boxShadow: '0 4px 18px rgba(242,201,76,0.4)' }}>
                Back to softplay →
              </Link>
              <button onClick={signOut}
                style={{ width: '100%', background: 'none', border: '1.5px solid #E8DCC8', borderRadius: 22, padding: '12px 20px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#8C7B6B', cursor: 'pointer' }}>
                Sign out
              </button>
            </>
          ) : sent ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Check your email</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                We sent a sign-in link to <strong>{email}</strong>. Tap it on this device and you&apos;re in — no password needed.
              </p>
              <button onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F', cursor: 'pointer', textDecoration: 'underline' }}>
                Use a different email
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Sign in to softplay</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                Your Playbill and Playground saves will be remembered and follow you across devices. No password — we email you a sign-in link.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void sendLink() }}
                placeholder="you@example.com"
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15, border: '1.5px solid #E8DCC8', borderRadius: 14, background: '#FFFFFF', color: '#1C1917', marginBottom: 12 }}
              />
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#C2543A', margin: '0 0 12px' }}>⚠️ {error}</p>
              )}
              <button onClick={() => void sendLink()} disabled={sending || !email.trim()}
                style={{ width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, border: 'none', cursor: sending || !email.trim() ? 'not-allowed' : 'pointer', opacity: sending || !email.trim() ? 0.6 : 1, boxShadow: '0 4px 18px rgba(242,201,76,0.4)' }}>
                {sending ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
