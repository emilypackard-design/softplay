'use client'

import { getSupabase } from '@/lib/supabase'

// Remember that this person was heading to checkout, so signing in takes them
// straight back to it. Only /upgrade is ever honoured (see the account page),
// and the note expires after an hour.
export function rememberBuyIntent() {
  try {
    localStorage.setItem('sp_next', JSON.stringify({ to: '/upgrade', buy: true, t: Date.now() }))
  } catch { /* ignore */ }
}

export type CheckoutResult = { url: string } | { needsSignIn: true } | { error: string }

// Asks the server for a Stripe Checkout page for the signed-in user.
// Call this only after useEntitlement has finished loading (it reads the session).
export async function startCheckout(): Promise<CheckoutResult> {
  const supabase = getSupabase()
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
  if (!data.session) return { needsSignIn: true }
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    })
    const json = await res.json()
    if (!res.ok || !json.url) return { error: json.error || 'Something went wrong. Please try again.' }
    return { url: json.url }
  } catch {
    return { error: 'We could not reach checkout. Check your connection and try again.' }
  }
}
