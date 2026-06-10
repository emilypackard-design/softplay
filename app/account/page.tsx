'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

// Sign in with a 6-digit email code (OTP). While signed in, your Playbill and
// Playground saves sync to the cloud and follow you across devices.
export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
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

  const sendCode = async () => {
    const supabase = getSupabase()
    if (!supabase || !email.trim()) return
    setSending(true)
    setError(null)
    // No emailRedirectTo → Supabase sends a 6-digit OTP code instead of a magic link
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    })
    setSending(false)
    if (err) {
      // Soften the rate-limit message — the raw Supabase text is alarming
      if (err.message.toLowerCase().includes('security purposes') || err.message.toLowerCase().includes('after')) {
        setError('Please wait a moment before requesting another code.')
      } else {
        setError(err.message)
      }
    } else {
      setCodeSent(true)
    }
  }

  const verifyCode = async () => {
    const supabase = getSupabase()
    if (!supabase || !code.trim()) return
    setVerifying(true)
    setError(null)
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setVerifying(false)
    if (err) {
      setError('That code didn\'t work — check your email and try again.')
    }
    // On success, onAuthStateChange fires and sets userEmail automatically
  }

  const signOut = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setCodeSent(false)
    setCode('')
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
          ) : codeSent ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Check your email</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below to sign in.
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') void verifyCode() }}
                placeholder="000000"
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box', padding: '18px 16px', fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, letterSpacing: '0.3em', textAlign: 'center', border: '1.5px solid #E8DCC8', borderRadius: 14, background: '#FFFFFF', color: '#1C1917', marginBottom: 12 }}
              />
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', margin: '0 0 12px' }}>{error}</p>
              )}
              <button onClick={() => void verifyCode()} disabled={verifying || code.length < 6}
                style={{ width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, border: 'none', cursor: verifying || code.length < 6 ? 'not-allowed' : 'pointer', opacity: verifying || code.length < 6 ? 0.6 : 1, boxShadow: '0 4px 18px rgba(242,201,76,0.4)', marginBottom: 16 }}>
                {verifying ? 'Checking…' : 'Sign in →'}
              </button>
              <button onClick={() => { setCodeSent(false); setCode(''); setError(null) }}
                style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F', cursor: 'pointer', textDecoration: 'underline' }}>
                Use a different email
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Sign in to softplay</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                Your Playbill and Playground saves will be remembered and follow you across devices. No password needed — we&apos;ll email you a code.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void sendCode() }}
                placeholder="you@example.com"
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15, border: '1.5px solid #E8DCC8', borderRadius: 14, background: '#FFFFFF', color: '#1C1917', marginBottom: 12 }}
              />
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', margin: '0 0 12px' }}>{error}</p>
              )}
              <button onClick={() => void sendCode()} disabled={sending || !email.trim()}
                style={{ width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, border: 'none', cursor: sending || !email.trim() ? 'not-allowed' : 'pointer', opacity: sending || !email.trim() ? 0.6 : 1, boxShadow: '0 4px 18px rgba(242,201,76,0.4)' }}>
                {sending ? 'Sending…' : 'Send me a code'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
