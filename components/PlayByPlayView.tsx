'use client'

import { useState, useEffect } from 'react'
import type { Stop, WheelOption, PlayStructureData, PlaybillData } from '@/types'
import PinwheelIcon from '@/components/PinwheelIcon'

// Treat two stops as the SAME place even when the name differs slightly
// (e.g. "Curtis's BBQ" vs "Curtis's BBQ Stand"). Normalise + prefix/equality check.
const normName = (s: string) => s.toLowerCase().replace(/['’.,&()-]/g, '').replace(/\s+/g, ' ').trim()
const sameStop = (a: string, b: string) => {
  const na = normName(a), nb = normName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na]
  // one name is the other plus a trailing word ("... bbq" vs "... bbq stand")
  return longer.startsWith(shorter + ' ')
}

// ── Single stop card (winner or add-on) ───────────────────────────

function StopCard({ stop, onFlag, onSwap, accent, swapLoading, stopType, carouselIndex, carouselTotal, onPrevCarousel, onNextCarousel }: {
  stop: Stop
  onFlag?: (stop: Stop, type?: 'food' | 'before' | 'after' | 'evening') => void
  onSwap?: () => void
  accent?: string
  swapLoading?: boolean
  stopType?: 'food' | 'before' | 'after' | 'evening'
  carouselIndex?: number
  carouselTotal?: number
  onPrevCarousel?: () => void
  onNextCarousel?: () => void
}) {
  const [showFlagMenu, setShowFlagMenu] = useState(false)

  const handleFlag = (reason: string) => {
    setShowFlagMenu(false)
    onFlag?.({ ...stop, tip: reason }, stopType)
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 18, boxShadow: '0 4px 16px rgba(28,25,23,0.08)', marginBottom: 12, position: 'relative', borderTop: accent ? `3px solid ${accent}` : undefined }}>
      {/* Top-right: flag only (the Swap/Remove action lives at the bottom-right) */}
      {onFlag && (
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowFlagMenu(v => !v)}
            title="Flag an issue"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.4, lineHeight: 1 }}
          >
            🚩
          </button>
          {showFlagMenu && (
            <div style={{ position: 'absolute', right: 0, top: 28, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 24px rgba(28,25,23,0.15)', padding: '8px 0', zIndex: 10, minWidth: 200 }}>
              {[
                { icon: '🔒', label: 'Permanently closed' },
                { icon: '📅', label: 'Not today' },
                { icon: '🚫', label: 'Bad suggestion' },
              ].map(({ icon, label }) => (
                <button key={label} onClick={() => handleFlag(label)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#1C1917' }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, paddingRight: onFlag ? 36 : 0 }}>
        <span style={{ fontSize: 30, flexShrink: 0 }}>{stop.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {stop.isHalfTime && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: '#3D9E8F', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>
              Half Time
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: '#1C1917' }}>{stop.name}</div>
          {stop.address && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginTop: 3 }}>{stop.address}</div>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {stop.hours && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, background: '#F5EFE0', color: '#5C4E3D', borderRadius: 20, padding: '4px 12px' }}>{stop.hours}</span>}
            {stop.price && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, background: '#F5EFE0', color: '#5C4E3D', borderRadius: 20, padding: '4px 12px' }}>{stop.price}</span>}
          </div>

          {stop.tip && !stop.tip.toLowerCase().includes('check website') && <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#3D2E1C', marginTop: 10, lineHeight: 1.55 }}>💡 {stop.tip}</p>}
          {stop.props && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#3D9E8F', marginTop: 6, fontWeight: 600 }}>🎒 {stop.props}</p>}

          {stop.mapsUrl && (
            <a href={stop.mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F', textDecoration: 'none' }}>
              📍 Get directions →
            </a>
          )}

          {/* Carousel navigation for food */}
          {stopType === 'food' && carouselTotal && carouselTotal > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F5EFE0' }}>
              <button onClick={onPrevCarousel} disabled={carouselIndex === 0}
                style={{ background: 'none', border: 'none', fontSize: 14, cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer', opacity: carouselIndex === 0 ? 0.3 : 0.6, fontWeight: 600 }}>
                ← prev
              </button>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8C7B6B', fontWeight: 600 }}>
                {(carouselIndex || 0) + 1} of {carouselTotal}
              </span>
              <button onClick={onNextCarousel} disabled={carouselIndex === carouselTotal - 1}
                style={{ background: 'none', border: 'none', fontSize: 14, cursor: carouselIndex === carouselTotal - 1 ? 'not-allowed' : 'pointer', opacity: carouselIndex === carouselTotal - 1 ? 0.3 : 0.6, fontWeight: 600 }}>
                next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom-right action pill — Swap for Half Time, Remove for other add-ons.
          Kept off the title row so long names never collide with it. */}
      {onSwap && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onSwap} disabled={swapLoading}
            title={stopType === 'food' ? 'Swap for another option' : 'Remove from itinerary'}
            style={{ background: '#FFF0EC', border: 'none', borderRadius: 12, padding: '7px 14px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#E07055', cursor: swapLoading ? 'not-allowed' : 'pointer', opacity: swapLoading ? 0.5 : 1 }}>
            {swapLoading ? '…' : (stopType === 'food' ? '✕ Swap' : '✕ Remove')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Add-on button ─────────────────────────────────────────────────

function AddOnButton({ label, emoji, onClick, loading, done, disabled }: {
  label: string; emoji: string; onClick: () => void; loading: boolean; done: boolean; disabled?: boolean
}) {
  if (done) return null
  const inactive = loading || disabled
  return (
    <button onClick={disabled ? undefined : onClick} disabled={inactive}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: disabled ? '#FEFBF3' : (loading ? '#F5EFE0' : '#FFFFFF'), border: disabled ? '1.5px dashed #E8DCC8' : '1.5px solid #E8DCC8', borderRadius: 16, padding: '13px 16px', cursor: inactive ? 'not-allowed' : 'pointer', marginBottom: 10, textAlign: 'left', opacity: disabled ? 0.55 : 1 }}>
      {loading
        ? <PinwheelIcon size={28} spinning />
        : <span style={{ fontSize: 22 }}>{emoji}</span>}
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: inactive ? '#8C7B6B' : '#1C1917' }}>
        {loading ? 'Finding something good…' : disabled ? `${label} — removed` : label}
      </span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────

interface Props {
  winnerStop: Stop
  chosenOption: WheelOption
  playbill: PlaybillData
  playStructure: PlayStructureData
  vetoes: string[]
  initialHalfTime?: Stop
  onReplay: () => void
  onCopyPlan?: () => void
  showCopyFeedback?: boolean
  onPlanAnotherDay?: () => void
}

// Force rebuild - crew size fix
export default function PlayByPlayView({ winnerStop, chosenOption, playbill, playStructure, vetoes, initialHalfTime, onReplay, onCopyPlan, showCopyFeedback, onPlanAnotherDay }: Props) {
  const [halfTime, setHalfTime] = useState<Stop | null>(initialHalfTime || null)
  const [before, setBefore] = useState<Stop | null>(null)
  const [after, setAfter] = useState<Stop | null>(null)
  const [evening, setEvening] = useState<Stop | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [swappingFood, setSwappingFood] = useState(false)
  const [flaggedVetoes, setFlaggedVetoes] = useState<string[]>([])
  const [foodOptions, setFoodOptions] = useState<Stop[]>([])
  const [foodIndex, setFoodIndex] = useState(0)
  const [foodExhausted, setFoodExhausted] = useState(false) // true when no more distinct food options can be found
  const [removalConfirm, setRemovalConfirm] = useState<'before' | 'after' | 'evening' | null>(null)
  // Once an add-on is removed, its "Play On" button is greyed out — one choice, take it or leave it.
  const [dismissed, setDismissed] = useState<Set<'before' | 'after' | 'evening'>>(new Set())
  const [notes, setNotes] = useState<string>('')
  // Swaps per stop type (food gets 10, others get 3) — flags don't count
  const [swapsRemaining, setSwapsRemaining] = useState({
    food: 10,
    before: 3,
    after: 3,
    evening: 3,
  })

  const isFullDay = playStructure.duration === 'full-day'
  const showBefore = !isFullDay  // full day already starts at the beginning
  const showAfter = !isFullDay   // full day already fills the day

  // Calculate actual session crew based on playbill and session notes
  const sessionNotes = (playStructure.sessionNotes || '').toLowerCase()
  const isAdultsOnly = sessionNotes.includes('just adults') || sessionNotes.includes('adults only')
  const isBiggerCrew = sessionNotes.includes('bigger crew') || sessionNotes.includes('grandma') || sessionNotes.includes('adding') || sessionNotes.includes('guest') || sessionNotes.includes('friend')
  const isSmallerCrew = sessionNotes.includes('smaller crew') || sessionNotes.includes('no kids')

  const sessionAdults = isBiggerCrew ? playbill.adults + 1 : isAdultsOnly ? playbill.adults : playbill.adults
  const sessionKids = isAdultsOnly || isSmallerCrew ? 0 : playbill.kids.length

  const allStops = [winnerStop, ...(before ? [before] : []), ...(halfTime ? [halfTime] : []), ...(after ? [after] : []), ...(evening ? [evening] : [])]

  // Load persisted flags from localStorage on mount (universal flags across sessions)
  useEffect(() => {
    if (typeof window !== 'undefined' && playStructure.city) {
      const savedVetoes = localStorage.getItem(`softplay_vetoes_${playStructure.city.toLowerCase()}`)
      if (savedVetoes) {
        try {
          setFlaggedVetoes(JSON.parse(savedVetoes))
        } catch (e) {
          console.error('Error loading vetoes:', e)
        }
      }
    }
  }, [playStructure.city])

  // Save flagged vetoes to localStorage whenever they change (universal flags across sessions)
  useEffect(() => {
    if (typeof window !== 'undefined' && playStructure.city && flaggedVetoes.length > 0) {
      localStorage.setItem(`softplay_vetoes_${playStructure.city.toLowerCase()}`, JSON.stringify(flaggedVetoes))
    }
  }, [flaggedVetoes, playStructure.city])

  // Save notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && winnerStop && notes) {
      localStorage.setItem(`softplay_notes_${winnerStop.id}`, notes)
    }
  }, [notes, winnerStop.id])

  // Fetch a single food option, excluding the given stops (and any vetoes/flags).
  const fetchOneFood = async (existing: Stop[]): Promise<Stop | null> => {
    try {
      const res = await fetch('/api/add-on', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure, winner: chosenOption, type: 'food', existingStops: existing, vetoes: [...vetoes, ...flaggedVetoes] }),
      })
      const data = await res.json()
      return res.ok && data.stop ? data.stop : null
    } catch { return null }
  }

  // Top the list up to 10 DISTINCT options in the background. Sequential so each call
  // knows the prior ones and never repeats. Updates state as each new one arrives.
  const topUpFood = async (startList: Stop[]) => {
    let current = startList
    let staleWaves = 0
    // Fetch in PARALLEL WAVES (each wave knows the current list) so the buffer fills
    // in a few seconds instead of one-at-a-time. Stop when full or a wave adds nothing.
    while (current.length < 10 && staleWaves < 3) {
      const need = 10 - current.length
      const wave = await Promise.all(
        Array.from({ length: Math.max(need, 4) }).map(() => fetchOneFood([winnerStop, ...current]))
      )
      const before = current.length
      for (const stop of wave) {
        if (stop && !current.some(s => sameStop(s.name, stop.name))) {
          current = [...current, stop]
        }
      }
      setFoodOptions(current)
      staleWaves = current.length === before ? staleWaves + 1 : 0
    }
    if (current.length < 10) setFoodExhausted(true) // location can't yield a full 10
  }

  // Initial Half Time load: quick parallel batch (instant cycling), then fill to 10 distinct in the background.
  const generateFoodOptions = async () => {
    setLoading('food')
    setFoodExhausted(false)
    try {
      const results = await Promise.all(Array.from({ length: 6 }).map(() => fetchOneFood([winnerStop])))
      const options: Stop[] = []
      for (const stop of results) {
        if (stop && !options.some(o => sameStop(o.name, stop.name))) {
          options.push(stop)
        }
      }
      if (options.length > 0) {
        setFoodOptions(options)
        setHalfTime(options[0])
        setFoodIndex(0)
      }
      setLoading(null)
      void topUpFood(options) // background fill to 10 distinct
    } catch (e) {
      console.error('Error generating food options:', e)
      setLoading(null)
    }
  }

  // Handle food carousel navigation
  const goToNextFood = () => {
    if (foodIndex < foodOptions.length - 1) {
      const nextIndex = foodIndex + 1
      setFoodIndex(nextIndex)
      setHalfTime(foodOptions[nextIndex])
    }
  }

  const goToPrevFood = () => {
    if (foodIndex > 0) {
      const prevIndex = foodIndex - 1
      setFoodIndex(prevIndex)
      setHalfTime(foodOptions[prevIndex])
    }
  }

  // Half-time is now completely optional — no auto-generation on mount
  // User must click "Play On" to generate options

  const generateAddOn = async (type: 'food' | 'before' | 'after' | 'evening') => {
    setLoading(type)
    try {
      const res = await fetch('/api/add-on', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure, winner: chosenOption, type, existingStops: allStops, vetoes: [...vetoes, ...flaggedVetoes] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (type === 'food') setHalfTime(data.stop)
      if (type === 'before') setBefore(data.stop)
      if (type === 'after') setAfter(data.stop)
      if (type === 'evening') setEvening(data.stop)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const swapHalfTime = async () => {
    if (!halfTime || foodOptions.length === 0) return
    goToNextFood()
    setSwapsRemaining(prev => ({ ...prev, food: prev.food - 1 }))
    try {
      const newVetoes = [...flaggedVetoes, halfTime.name]
      setFlaggedVetoes(newVetoes)
      await generateAddOn('food')
    } finally {
      setSwappingFood(false)
    }
  }

  const handleFlag = (stop: Stop, type?: 'food' | 'before' | 'after' | 'evening') => {
    setFlaggedVetoes(v => [...v, stop.name])
    // Half Time: flag advances instantly to the next pre-loaded option (same speed as Swap).
    if (type === 'food') {
      swapFood()
      return
    }
    // Before/After/Evening: flag triggers a fresh replacement.
    if (type) {
      generateAddOn(type)
    }
  }

  const handleRemove = (type: 'before' | 'after' | 'evening') => {
    // Show confirmation popup
    setRemovalConfirm(type)
  }

  const confirmRemoval = (type: 'before' | 'after' | 'evening') => {
    if (type === 'before') setBefore(null)
    if (type === 'after') setAfter(null)
    if (type === 'evening') setEvening(null)
    setDismissed(prev => new Set([...prev, type]))
    setRemovalConfirm(null)
  }

  // Half Time swap — advance to the next DISTINCT option (no wrap, so a card never
  // comes back this session). Instant when buffered; if you're ahead of the buffer it
  // fetches one on demand (button shows "…" rather than disappearing).
  const swapFood = async () => {
    if (foodOptions.length === 0) return
    const next = foodIndex + 1
    if (next < foodOptions.length) {
      setFoodIndex(next)
      setHalfTime(foodOptions[next])
      if (foodOptions.length < 10 && !foodExhausted && next >= foodOptions.length - 2) void topUpFood(foodOptions)
      return
    }
    // At the edge of the buffer — fetch a fresh distinct one now
    if (foodOptions.length >= 10 || foodExhausted || swappingFood) return
    setSwappingFood(true)
    const stop = await fetchOneFood([winnerStop, ...foodOptions])
    setSwappingFood(false)
    if (stop && !foodOptions.some(s => sameStop(s.name, stop.name))) {
      const updated = [...foodOptions, stop]
      setFoodOptions(updated)
      setFoodIndex(updated.length - 1)
      setHalfTime(stop)
    } else {
      setFoodExhausted(true)
    }
  }

  return (
    <div>
      {/* Header — title + icon only (the description lives on the card below, no repeat) */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>{chosenOption.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: '#1C1917', margin: 0 }}>
          {winnerStop.name}
        </h2>
      </div>

      {/* Crew summary — only show if user explicitly set crew or session notes */}
      {(playStructure.sessionAdults > 0 || playStructure.sessionKids.length > 0 || playStructure.sessionNotes) && (sessionAdults || sessionKids) ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {sessionAdults ? (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, background: '#F5EFE0', color: '#5C4E3D', borderRadius: 20, padding: '4px 12px' }}>
              👤 {sessionAdults} adult{sessionAdults !== 1 ? 's' : ''}
            </span>
          ) : null}
          {sessionKids > 0 ? (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, background: '#F5EFE0', color: '#5C4E3D', borderRadius: 20, padding: '4px 12px' }}>
              🧒 {sessionKids} kid{sessionKids !== 1 ? 's' : ''}{sessionKids <= 3 && !isAdultsOnly ? ` (${playbill.kids.map((k: { age: number }) => k.age).join(', ')})` : ''}
            </span>
          ) : null}
          {playStructure.city ? (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, background: '#F5EFE0', color: '#5C4E3D', borderRadius: 20, padding: '4px 12px' }}>
              📍 {playStructure.city}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Check reminder */}
      <div style={{ background: '#F5EFE0', borderRadius: 14, padding: '10px 14px', marginBottom: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: '#5C4E3D' }}>
        📞 Worth a quick check before you go — hours and closures can change.
      </div>

      {/* Winner stop — locked, no flag, no swap */}
      <StopCard stop={winnerStop} accent="#F2C94C" />

      {/* Generated add-ons */}
      {before && <StopCard stop={before} stopType="before" onFlag={handleFlag} onSwap={() => handleRemove('before')} accent="#3D9E8F" />}
      {halfTime && <StopCard stop={halfTime} stopType="food" onFlag={handleFlag} onSwap={((foodIndex < foodOptions.length - 1) || (foodOptions.length < 10 && !foodExhausted)) ? swapFood : undefined} swapLoading={swappingFood} accent="#3D9E8F" />}
      {after && <StopCard stop={after} stopType="after" onFlag={handleFlag} onSwap={() => handleRemove('after')} accent="#3D9E8F" />}
      {evening && <StopCard stop={evening} stopType="evening" onFlag={handleFlag} onSwap={() => handleRemove('evening')} accent="#1C1917" />}

      {/* Play On section */}
      {((!before && showBefore) || (!after && showAfter) || !evening) && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>Play On</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginBottom: 14 }}>Build your day — tap to add</p>

          {showBefore && <AddOnButton emoji="🌅" label="Add something before" onClick={() => generateAddOn('before')} loading={loading === 'before'} done={!!before} disabled={dismissed.has('before')} />}
          {!halfTime && <AddOnButton emoji="🍽️" label="Half Time — find a food stop" onClick={generateFoodOptions} loading={loading === 'food'} done={!!halfTime} />}
          {showAfter && <AddOnButton emoji="🌆" label="Add something after" onClick={() => generateAddOn('after')} loading={loading === 'after'} done={!!after} disabled={dismissed.has('after')} />}
          <AddOnButton emoji="🌙" label="The play's the thing — add an evening" onClick={() => generateAddOn('evening')} loading={loading === 'evening'} done={!!evening} disabled={dismissed.has('evening')} />

          {/* Playlist — V2 placeholder */}
          <button disabled style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: '#FEFBF3', border: '1.5px dashed #E8DCC8', borderRadius: 16, padding: '13px 16px', cursor: 'not-allowed', marginBottom: 10, opacity: 0.5 }}>
            <span style={{ fontSize: 22 }}>🎵</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: '#8C7B6B' }}>Playlist — coming soon</span>
            </div>
          </button>
        </div>
      )}

      {/* Action buttons after plan */}
      {onCopyPlan && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #E8DCC8' }}>
          {/* Notes field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
              📋 I Have Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 700))}
              placeholder="Notes to self and feedback: What worked? What would you change?"
              style={{ width: '100%', minHeight: 100, padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1.5px solid #E8DCC8', borderRadius: 12, color: '#1C1917', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: '#8C7B6B' }}>
              {notes.length} / 700
            </div>
          </div>

          {/* Share button — copy full itinerary to clipboard */}
          <button onClick={() => {
            const itinerary = [
              `${chosenOption.emoji} ${chosenOption.name}`,
              '',
              '📍 Main Event',
              `${winnerStop.name}`,
              winnerStop.address || 'See directions in Maps',
              ...(winnerStop.hours ? [`⏰ ${winnerStop.hours}`] : []),
              ...(winnerStop.tip ? ['' , `💡 ${winnerStop.tip}`] : []),
              '',
              ...(before ? [
                '🌅 Before',
                `${before.name}`,
                before.address || '',
                ...(before.hours ? [`⏰ ${before.hours}`] : []),
              ] : []),
              '',
              ...(halfTime ? [
                '🍽️ Half Time',
                `${halfTime.name}`,
                halfTime.address || '',
                ...(halfTime.hours ? [`⏰ ${halfTime.hours}`] : []),
              ] : []),
              '',
              ...(after ? [
                '🌆 After',
                `${after.name}`,
                after.address || '',
                ...(after.hours ? [`⏰ ${after.hours}`] : []),
              ] : []),
              '',
              ...(evening ? [
                '🌙 Evening',
                `${evening.name}`,
                evening.address || '',
                ...(evening.hours ? [`⏰ ${evening.hours}`] : []),
              ] : []),
              '',
              ...(notes ? ['📋 Notes', notes] : []),
              '',
              'softplay.app',
            ].filter(line => line !== undefined).join('\n')

            navigator.clipboard.writeText(itinerary)
            onCopyPlan()
          }}
            style={{ width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, padding: '15px 20px', borderRadius: 26, border: 'none', cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 18px rgba(242,201,76,0.4)' }}>
            {showCopyFeedback ? '✓ Copied to clipboard' : 'Copy plan →'}
          </button>

          {/* Plan another day button */}
          <button onClick={onPlanAnotherDay}
            style={{ width: '100%', background: '#F5EFE0', color: '#5C4E3D', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, padding: '12px 20px', borderRadius: 22, border: 'none', cursor: 'pointer', textAlign: 'center' }}>
            Plan another day
          </button>
        </div>
      )}

      {/* Removal confirmation modal */}
      {removalConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 24, maxWidth: 320, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917', margin: '0 0 12px' }}>
              Remove from itinerary?
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', margin: '0 0 24px', lineHeight: 1.5 }}>
              This {removalConfirm} activity will be removed from your day.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setRemovalConfirm(null)}
                style={{ flex: 1, background: '#F5EFE0', color: '#5C4E3D', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
                Keep it
              </button>
              <button onClick={() => confirmRemoval(removalConfirm)}
                style={{ flex: 1, background: '#E07055', color: '#FFFFFF', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
