'use client'

import { useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { pullMerge, pushMirror, ensureProfile, localSnapshot } from '@/lib/cloudSync'

// Mounts once in the root layout. Renders nothing. When a user is signed in:
//  - on load:  pull-merge cloud → local, then push-mirror local → cloud
//  - every 8s: if localStorage changed, push-mirror
//  - on tab refocus: pull-merge (pick up changes made on another device)
export default function SyncProvider() {
  const lastPushed = useRef<string>('')
  const userIdRef = useRef<string | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    let interval: ReturnType<typeof setInterval> | null = null

    const fullSync = async (userId: string, email?: string) => {
      if (busy.current) return
      busy.current = true
      try {
        await ensureProfile(supabase, userId, email)
        await pullMerge(supabase, userId)
        await pushMirror(supabase, userId)
        lastPushed.current = localSnapshot()
      } catch (e) {
        console.warn('cloud sync failed (will retry):', e)
      } finally {
        busy.current = false
      }
    }

    const pushIfChanged = async () => {
      const userId = userIdRef.current
      if (!userId || busy.current) return
      const snap = localSnapshot()
      if (snap === lastPushed.current) return
      busy.current = true
      try {
        await pushMirror(supabase, userId)
        lastPushed.current = snap
      } catch (e) {
        console.warn('cloud push failed (will retry):', e)
      } finally {
        busy.current = false
      }
    }

    const onFocus = () => {
      const userId = userIdRef.current
      if (userId) void pullMerge(supabase, userId).catch(() => {})
    }

    // Watch auth state; start/stop syncing as the user signs in/out
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      userIdRef.current = user?.id ?? null
      if (user) {
        void fullSync(user.id, user.email)
        if (!interval) interval = setInterval(pushIfChanged, 8000)
        window.addEventListener('focus', onFocus)
      } else {
        if (interval) { clearInterval(interval); interval = null }
        window.removeEventListener('focus', onFocus)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
      if (interval) clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return null
}
