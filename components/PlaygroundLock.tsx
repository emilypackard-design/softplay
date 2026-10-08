'use client'

import { useEntitlement } from '@/lib/entitlement'

// Small lock on the home-page Playground link for free users. Founders (Unlimited) don't see it.
export default function PlaygroundLock() {
  const { loading, hasPaidAccess } = useEntitlement()
  if (loading || hasPaidAccess) return null
  return <span style={{ fontSize: 15, marginLeft: 2 }}>🔒</span>
}
