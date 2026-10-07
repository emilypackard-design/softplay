'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export interface Entitlement {
  loading: boolean
  signedIn: boolean
  hasPaidAccess: boolean
  email: string | null
}

// Founders (plan === 'founder') are the only paid tier for now — see
// lib/stripe.ts. Extend this check if/when a subscription plan ships.
//
// The single place that calls supabase.auth.getSession()/onAuthStateChange().
// A second concurrent getSession() call on the same client (e.g. a page
// calling it directly alongside this hook) was found to deadlock the
// Supabase client's internal lock queue — components that need session info
// must read it from here rather than calling getSession() themselves.
export function useEntitlement(): Entitlement {
  const [state, setState] = useState<Entitlement>({ loading: true, signedIn: false, hasPaidAccess: false, email: null })

  useEffect(() => {
    let cancelled = false
    // Serializes load() calls — onAuthStateChange fires an INITIAL_SESSION
    // event immediately on subscribing, which raced with a separate
    // getSession() call here and deadlocked the Supabase client. Reading
    // the session only through this one subscription (its standard use)
    // avoids that redundant concurrent call entirely.
    let inFlight: Promise<void> = Promise.resolve()
    const supabase = getSupabase()
    if (!supabase) { setState(s => ({ ...s, loading: false })); return }

    const load = (userId: string | undefined, email: string | null | undefined) => {
      inFlight = inFlight.then(async () => {
        if (cancelled) return
        if (!userId) {
          setState({ loading: false, signedIn: false, hasPaidAccess: false, email: null })
          return
        }
        const { data } = await supabase.from('profiles').select('plan').eq('id', userId).maybeSingle()
        if (!cancelled) setState({ loading: false, signedIn: true, hasPaidAccess: data?.plan === 'founder', email: email ?? null })
      })
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => load(session?.user?.id, session?.user?.email))
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  return state
}
