'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { useEntitlement } from '@/lib/entitlement'

// Sign in with a passwordless email magic link. While signed in, your Playbill
// and Playground saves sync to the cloud and follow you across devices.
export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const { loading: entitlementLoading, hasPaidAccess, email: userEmail } = useEntitlement()
  const mounted = !entitlementLoading
  const [redeemCode, setRedeemCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemed, setRedeemed] = useState(false)

  const sendCode = async () => {
    const supabase = getSupabase()
    if (!supabase || !email.trim()) return
    setSending(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/account' : undefined },
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

  const signOut = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setCodeSent(false)
    setEmail('')
  }

  const deleteAccount = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    setDeleting(true)
    setError(null)
    // Deletes only the caller's own account — enforced by auth.uid() inside the
    // delete_user() DB function. ON DELETE CASCADE removes their profile,
    // Playbill and saves automatically.
    const { error: err } = await supabase.rpc('delete_user')
    if (err) {
      setDeleting(false)
      setError('Something went wrong deleting your account. Please email privacy@mysoftplay.app and we\'ll take care of it.')
      return
    }
    // Wipe this device's local copy of everything softplay stored
    try {
      Object.keys(localStorage)
        .filter(k => k === 'lastPlaybill' || k.startsWith('softplay'))
        .forEach(k => localStorage.removeItem(k))
    } catch { /* ignore */ }
    await supabase.auth.signOut().catch(() => {})
    setDeleting(false)
    setDeleted(true)
  }

  const redeemCodeAction = async () => {
    if (!redeemCode.trim()) return
    const supabase = getSupabase()
    if (!supabase) return
    setRedeeming(true)
    setRedeemError(null)
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setRedeeming(false)
      setRedeemError('Please sign in again and retry.')
      return
    }
    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ code: redeemCode }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      setRedeemed(true)
    } catch (e) {
      setRedeemError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Account</span>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!mounted ? null : deleted ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Your account has been deleted</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', lineHeight: 1.6, margin: '0 0 28px' }}>
                Your account and everything saved to it have been removed. Thanks for giving softplay a try — you&apos;re always welcome back.
              </p>
              <Link href="/" style={{ display: 'block', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 26, textDecoration: 'none' }}>
                Back to softplay →
              </Link>
            </>
          ) : userEmail ? (
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

              {hasPaidAccess ? (
                <p style={{ marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F' }}>
                  🎉 You have a Founding Membership — enjoy softplay Unlimited.
                </p>
              ) : redeemed ? (
                <p style={{ marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F' }}>
                  🎉 Code redeemed — you now have a Founding Membership.
                </p>
              ) : (
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#8C7B6B', margin: '0 0 8px' }}>
                    Have a code?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={e => setRedeemCode(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') void redeemCodeAction() }}
                      placeholder="Enter code"
                      style={{ flex: 1, boxSizing: 'border-box', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1.5px solid #E8DCC8', borderRadius: 14, background: '#FFFFFF', color: '#1C1917' }}
                    />
                    <button onClick={() => void redeemCodeAction()} disabled={redeeming || !redeemCode.trim()}
                      style={{ background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, padding: '0 18px', borderRadius: 14, border: 'none', cursor: redeeming || !redeemCode.trim() ? 'not-allowed' : 'pointer', opacity: redeeming || !redeemCode.trim() ? 0.6 : 1 }}>
                      {redeeming ? '…' : 'Redeem'}
                    </button>
                  </div>
                  {redeemError && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8C5C5C', margin: '8px 0 0' }}>{redeemError}</p>
                  )}
                </div>
              )}

              {!confirmDelete ? (
                <button onClick={() => { setConfirmDelete(true); setError(null) }}
                  style={{ marginTop: 20, background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090', cursor: 'pointer', textDecoration: 'underline' }}>
                  Delete my account
                </button>
              ) : (
                <div style={{ marginTop: 20, padding: 16, border: '1.5px solid #E8C8C8', borderRadius: 14, background: '#FBF3F3', textAlign: 'left' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C5C5C', lineHeight: 1.6, margin: '0 0 14px' }}>
                    This permanently deletes your account and everything you&apos;ve saved. This can&apos;t be undone.
                  </p>
                  <button onClick={() => void deleteAccount()} disabled={deleting}
                    style={{ width: '100%', background: '#C0453B', color: '#FFF', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '12px 20px', borderRadius: 22, border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, marginBottom: 8 }}>
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                    style={{ width: '100%', background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#8C7B6B', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C5C5C', margin: '14px 0 0' }}>{error}</p>
              )}
            </>
          ) : codeSent ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Check your email</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                We sent a sign-in link to <strong>{email}</strong>. Tap it on this device and you&apos;re in — no password needed.
              </p>
              <button onClick={() => { setCodeSent(false); setError(null) }}
                style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F', cursor: 'pointer', textDecoration: 'underline' }}>
                Use a different email
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>Sign in to softplay</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 24px' }}>
                Your Playbill and Playground saves will be remembered and follow you across devices. No password needed — we&apos;ll email you a sign-in link.
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
                {sending ? 'Sending…' : 'Email me a sign-in link'}
              </button>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B0A090', lineHeight: 1.6, margin: '14px 0 0' }}>
                By signing in, you agree to our{' '}
                <Link href="/privacy" style={{ color: '#3D9E8F', fontWeight: 600 }}>Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
