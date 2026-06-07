'use client'

import { useState, useEffect } from 'react'
import type { Stop, WheelOption, PlayStructureData, PlaybillData } from '@/types'
import PinwheelIcon from '@/components/PinwheelIcon'

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
      {/* Action buttons */}
      {(onFlag || onSwap) && (
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
          {onSwap && stopType === 'food' && (
            <button
              onClick={onSwap}
              disabled={swapLoading}
              title="Swap for another option"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF0EC', border: 'none', borderRadius: 14, padding: '4px 10px', cursor: swapLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: '#E07055', opacity: swapLoading ? 0.5 : 1, lineHeight: 1 }}
            >
              ↻ Swap
            </button>
          )}
          {onSwap && stopType !== 'food' && (
            <button
              onClick={onSwap}
              disabled={swapLoading}
              title="Remove from itinerary"
              style={{ background: 'none', border: 'none', cursor: swapLoading ? 'not-allowed' : 'pointer', fontSize: 16, opacity: swapLoading ? 0.5 : 0.6, lineHeight: 1 }}
            >
              ✕
            </button>
          )}
          {onFlag && (
            <button
              onClick={() => setShowFlagMenu(v => !v)}
              title="Flag an issue"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.4, lineHeight: 1 }}
            >
              🚩
            </button>
          )}
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
    </div>
  )
}

// ── Add-on button ─────────────────────────────────────────────────

function AddOnButton({ label, emoji, onClick, loading, done }: {
  label: string; emoji: string; onClick: () => void; loading: boolean; done: boolean
}) {
  if (done) return null
  return (
    <button onClick={onClick} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: loading ? '#F5EFE0' : '#FFFFFF', border: '1.5px solid #E8DCC8', borderRadius: 16, padding: '13px 16px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, textAlign: 'left' }}>
      {loading
        ? <PinwheelIcon size={28} spinning />
        : <span style={{ fontSize: 22 }}>{emoji}</span>}
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: loading ? '#8C7B6B' : '#1C1917' }}>
        {loading ? 'Finding something good…' : label}
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
  const [removalConfirm, setRemovalConfirm] = useState<'before' | 'after' | 'evening' | null>(null)
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

  // Generate 10 food options for browsing (called on mount)
  const generateFoodOptions = async () => {
    setLoading('food')
    try {
      const options: Stop[] = []
      for (let i = 0; i < 10; i++) {
        const res = await fetch('/api/add-on', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playbill, playStructure, winner: chosenOption, type: 'food', existingStops: [winnerStop, ...options], vetoes: [...vetoes, ...flaggedVetoes] }),
        })
        const data = await res.json()
        if (res.ok && data.stop) {
          options.push(data.stop)
        }
      }
      if (options.length > 0) {
        setFoodOptions(options)
        setHalfTime(options[0])
        setFoodIndex(0)
      }
    } catch (e) {
      console.error('Error generating food options:', e)
    } finally {
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
    // Flags trigger immediate free replacement for add-on items
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
    setRemovalConfirm(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>{chosenOption.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
          {winnerStop.name}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', margin: 0 }}>{chosenOption.pitch}</p>
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
      {halfTime && <StopCard stop={halfTime} stopType="food" onFlag={handleFlag} onSwap={swapsRemaining.food > 0 ? () => { setSwapsRemaining(prev => ({ ...prev, food: prev.food - 1 })); setFlaggedVetoes(prev => [...prev, halfTime.name]); generateAddOn('food') } : undefined} swapLoading={swappingFood} accent="#3D9E8F" />}
      {after && <StopCard stop={after} stopType="after" onFlag={handleFlag} onSwap={() => handleRemove('after')} accent="#3D9E8F" />}
      {evening && <StopCard stop={evening} stopType="evening" onFlag={handleFlag} onSwap={() => handleRemove('evening')} accent="#1C1917" />}

      {/* Play On section */}
      {((!before && showBefore) || (!after && showAfter) || !evening) && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>Play On</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginBottom: 14 }}>Build your day — tap to add</p>

          {showBefore && <AddOnButton emoji="🌅" label="Add something before" onClick={() => generateAddOn('before')} loading={loading === 'before'} done={!!before} />}
          {!halfTime && <AddOnButton emoji="🍽️" label="Half Time — find a food stop" onClick={() => generateAddOn('food')} loading={loading === 'food'} done={!!halfTime} />}
          {showAfter && <AddOnButton emoji="🌆" label="Add something after" onClick={() => generateAddOn('after')} loading={loading === 'after'} done={!!after} />}
          <AddOnButton emoji="🌙" label="The play's the thing — add an evening" onClick={() => generateAddOn('evening')} loading={loading === 'evening'} done={!!evening} />

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
              chosenOption.pitch,
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
