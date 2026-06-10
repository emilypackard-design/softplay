'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlaygroundSave } from '@/types'

// ── Cloud sync (V1.5) ─────────────────────────────────────────────
// Strategy: localStorage remains the app's live working store (existing
// page code untouched). When a user is signed in, this module:
//   1. PULL-MERGE  — cloud rows are unioned into localStorage (so saves
//      made on another device appear here)
//   2. PUSH-MIRROR — localStorage state is mirrored up to Supabase
// Scope for V1.5: the Playbill + Playground saves. (City vetoes and
// itinerary notes stay device-local for now — documented in V1.5-MEMORY.md.)

const PLAYGROUND_KEY = 'softplay_playground'
const PLAYBILL_KEY = 'lastPlaybill'

const readLocalSaves = (): PlaygroundSave[] => {
  try { return JSON.parse(localStorage.getItem(PLAYGROUND_KEY) || '[]') } catch { return [] }
}
const readLocalPlaybill = (): Record<string, unknown> | null => {
  try { const s = localStorage.getItem(PLAYBILL_KEY); return s ? JSON.parse(s) : null } catch { return null }
}

// Snapshot used to detect "did anything change since last push?"
export const localSnapshot = (): string =>
  (localStorage.getItem(PLAYBILL_KEY) || '') + '|' + (localStorage.getItem(PLAYGROUND_KEY) || '')

// ── 1. PULL-MERGE: union cloud rows into localStorage ─────────────
export async function pullMerge(supabase: SupabaseClient, userId: string): Promise<void> {
  // Saves: union by client_id (fallback: title+city)
  const { data: cloudSaves } = await supabase.from('saves').select('*').eq('user_id', userId)
  if (cloudSaves) {
    const local = readLocalSaves()
    const has = (cs: { client_id: string | null; title: string; city: string }) =>
      local.some(l => (cs.client_id && l.id === cs.client_id) ||
        (l.title.toLowerCase() === cs.title.toLowerCase() && l.city.toLowerCase() === cs.city.toLowerCase()))
    const incoming: PlaygroundSave[] = cloudSaves
      .filter(cs => !has(cs))
      .map(cs => ({
        id: cs.client_id || cs.id,
        type: cs.type as 'heart' | 'pin',
        title: cs.title,
        emoji: cs.emoji || '',
        pitch: cs.pitch || '',
        city: cs.city,
        savedAt: new Date(cs.created_at).getTime(),
      }))
    if (incoming.length > 0) {
      localStorage.setItem(PLAYGROUND_KEY, JSON.stringify([...local, ...incoming]))
    }
  }

  // Playbill: only adopt the cloud copy if this device has none
  // (if both exist, the local one wins and will be pushed up next cycle)
  if (!readLocalPlaybill()) {
    const { data: pb } = await supabase.from('playbills').select('data').eq('user_id', userId).maybeSingle()
    if (pb?.data) localStorage.setItem(PLAYBILL_KEY, JSON.stringify(pb.data))
  }
}

// ── 2. PUSH-MIRROR: make the cloud match localStorage ─────────────
export async function pushMirror(supabase: SupabaseClient, userId: string): Promise<void> {
  // Playbill
  const playbill = readLocalPlaybill()
  if (playbill) {
    await supabase.from('playbills').upsert(
      { user_id: userId, data: playbill, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  }

  // Saves: upsert everything local, then remove cloud rows that no longer exist locally
  const local = readLocalSaves()
  if (local.length > 0) {
    await supabase.from('saves').upsert(
      local.map(s => ({
        user_id: userId,
        client_id: s.id,
        type: s.type,
        title: s.title,
        emoji: s.emoji,
        pitch: s.pitch,
        city: s.city,
        created_at: new Date(s.savedAt || Date.now()).toISOString(),
      })),
      { onConflict: 'user_id,client_id' },
    )
  }
  const localIds = new Set(local.map(s => s.id))
  const { data: cloudSaves } = await supabase.from('saves').select('id, client_id').eq('user_id', userId)
  const stale = (cloudSaves || []).filter(cs => cs.client_id && !localIds.has(cs.client_id)).map(cs => cs.id)
  if (stale.length > 0) {
    await supabase.from('saves').delete().in('id', stale)
  }
}

// Ensure a profile row exists (first login)
export async function ensureProfile(supabase: SupabaseClient, userId: string, email: string | undefined): Promise<void> {
  await supabase.from('profiles').upsert({ id: userId, email: email || null }, { onConflict: 'id' })
}
