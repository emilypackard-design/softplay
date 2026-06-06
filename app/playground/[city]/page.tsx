'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { PlaygroundSave } from '@/types'

const PLAYGROUND_KEY = 'softplay_playground'

export default function CityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const city = params?.city ? decodeURIComponent(params.city as string) : null

  const [hearts, setHearts] = useState<PlaygroundSave[]>([])
  const [pins, setPins] = useState<PlaygroundSave[]>([])
  const [mounted, setMounted] = useState(false)
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())
  const [flagPopupId, setFlagPopupId] = useState<string | null>(null)

  useEffect(() => {
    if (!city) return

    const data = typeof window !== 'undefined' ? localStorage.getItem(PLAYGROUND_KEY) : null
    const saves: PlaygroundSave[] = data ? JSON.parse(data) : []

    const citySaves = saves.filter(s => s.city.toLowerCase() === city.toLowerCase())
    setHearts(citySaves.filter(s => s.type === 'heart').sort((a, b) => b.savedAt - a.savedAt))
    setPins(citySaves.filter(s => s.type === 'pin').sort((a, b) => b.savedAt - a.savedAt))
    setMounted(true)
  }, [city])

  // Flags are session-local only — clear on unmount
  // (don't delete the cards, just forget the flagged state)

  const handleFlag = (id: string) => {
    setFlagPopupId(flagPopupId === id ? null : id)
  }

  const handleFlagReason = (id: string) => {
    setFlaggedIds(prev => new Set([...prev, id]))
    setFlagPopupId(null)
  }

  const handleUnflag = (id: string) => {
    setFlaggedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setFlagPopupId(null)
  }

  const handleHeartToggle = (save: PlaygroundSave) => {
    const current = JSON.parse(localStorage.getItem(PLAYGROUND_KEY) || '[]') as PlaygroundSave[]
    const updated = current.map(s =>
      s.id === save.id ? { ...s, type: s.type === 'heart' ? 'pin' : 'heart' } : s
    )
    localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(updated))

    // Update local state
    if (save.type === 'heart') {
      setHearts(hearts.filter(s => s.id !== save.id))
      setPins([{ ...save, type: 'pin' }, ...pins])
    } else {
      setPins(pins.filter(s => s.id !== save.id))
      setHearts([{ ...save, type: 'heart' }, ...hearts])
    }
  }

  const handleDelete = (id: string) => {
    const current = JSON.parse(localStorage.getItem(PLAYGROUND_KEY) || '[]') as PlaygroundSave[]
    const updated = current.filter(s => s.id !== id)
    localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(updated))

    setHearts(hearts.filter(s => s.id !== id))
    setPins(pins.filter(s => s.id !== id))
  }

  const handleBuildDay = (save: PlaygroundSave) => {
    if (!city) return
    // Navigate directly to Play by Play with card info
    sessionStorage.setItem('playgroundCard', JSON.stringify(save))
    router.push(`/playground/${encodeURIComponent(city)}/play-by-play`)
  }

  const handlePlanCityDay = () => {
    if (!city) return
    router.push(`/play-plan?city=${encodeURIComponent(city)}`)
  }

  if (!mounted || !city) return null

  const S = {
    screen: { minHeight: '100vh', background: 'linear-gradient(180deg, #2E6A14 0%, #5AAA32 20%, #96D060 42%, #CCE8A0 65%, #EEF8DC 82%, #FEFBF3 100%)', display: 'flex', flexDirection: 'column' as const },
    header: { background: 'linear-gradient(180deg, #2E6A14 0%, #5AAA32 20%, #96D060 42%, #CCE8A0 65%, #EEF8DC 82%, #FEFBF3 100%)', padding: '32px 24px', borderBottom: '1px solid rgba(143,184,138,0.2)' },
    backLink: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(28,25,23,0.6)', textDecoration: 'underline', cursor: 'pointer', marginBottom: 12 },
    title: { fontFamily: 'var(--font-wordmark)', fontSize: 28, fontWeight: 700, color: '#1C1917', margin: '0 0 8px' },
    meta: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(28,25,23,0.75)', margin: 0 },
    main: { flex: 1, padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%', overflowY: 'auto' as const },
    section: { marginBottom: 24 },
    sectionLabel: { fontFamily: 'var(--font-heading)', fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: 'rgba(28,25,23,0.5)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
    line: { flex: 1, height: '1px', background: 'rgba(28,25,23,0.1)' },
    card: { borderRadius: 14, padding: '13px 14px', marginBottom: 12, background: '#FFFFFF' },
    cardContent: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 },
    heartCard: { background: '#FFFAF8', border: '1.5px solid rgba(224,112,85,0.15)' },
    emojiBox: { width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#FFF0EC', flexShrink: 0 },
    content: { flex: 1 },
    cardTitle: { fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#1C1917', margin: 0 },
    cardPitch: { fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(28,25,23,0.6)', margin: '2px 0 0' },
    actions: { display: 'flex', alignItems: 'center', gap: 8 },
    badge: { fontFamily: 'var(--font-body)', fontSize: 12 },
    deleteBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(28,25,23,0.4)', padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    footer: { padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%' },
    planBtn: { display: 'block', width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: 26, textAlign: 'center' as const, textDecoration: 'none', boxShadow: '0 4px 16px rgba(245,200,66,0.35)' },
  }

  const totalSaves = hearts.length + pins.length

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <Link href="/playground" style={S.backLink}>← Playground</Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={S.title}>{city}</h1>
          <p style={S.meta}>Tap 'Play this card' on any save to create your full itinerary.</p>
          <p style={{ ...S.meta, marginTop: 6, fontSize: 11 }}>The ✕ removes a suggestion from your Playground.</p>
        </div>
      </div>

      <main style={S.main}>
        {hearts.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>
              <span>❤️ Saved as Faves</span>
              <div style={S.line} />
            </div>
            {hearts.map(save => !flaggedIds.has(save.id) && (
              <div key={save.id} style={{ borderRadius: 14, padding: 0, marginBottom: 12, background: '#FFFFFF', overflow: 'hidden' }}>
                {/* Accent line */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #E07055, #E8A0A8)' }} />

                {/* Content */}
                <div style={{ padding: '12px 14px' }}>
                  {/* Title with badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{save.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#1C1917', margin: 0 }}>{save.title}</h3>
                    </div>
                    <span style={{ fontSize: 14 }}>❤️</span>
                  </div>

                  {/* Pitch */}
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(28,25,23,0.6)', margin: '4px 0 10px 28px' }}>{save.pitch}</p>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#F5EFE0', margin: '8px 0' }} />

                  {/* Action buttons row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    {/* Heart button */}
                    <button onClick={() => handleHeartToggle(save)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#6E6560', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      title="Downgrade to Save for Later"
                    >
                      ❤️
                    </button>

                    {/* Flag button */}
                    <button onClick={() => handleFlag(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: flagPopupId === save.id ? '#F5C842' : (flaggedIds.has(save.id) ? '#F5C842' : '#FEF3CC'), border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
                      title={flaggedIds.has(save.id) ? "Unflag this card" : "Flag this card"}
                    >
                      🚩
                      {flagPopupId === save.id && (
                        <div style={{ position: 'absolute', bottom: 50, left: 0, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 8px 24px rgba(28,25,23,0.15)', padding: '6px 0', zIndex: 10, minWidth: 160 }}>
                          {flaggedIds.has(save.id) ? (
                            <button onClick={() => handleUnflag(save.id)}
                              style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', color: '#1C1917' }}
                            >
                              ✓ Unflag
                            </button>
                          ) : (
                            [
                              { icon: '🔒', label: 'Permanently closed' },
                              { icon: '📅', label: 'Not today' },
                              { icon: '🚫', label: 'Bad suggestion' },
                            ].map(({ icon, label }) => (
                              <button key={label} onClick={() => handleFlagReason(save.id)}
                                style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', color: '#1C1917' }}
                              >
                                {icon} {label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </button>

                    {/* Remove button */}
                    <button onClick={() => handleDelete(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#E07055' }}
                      title="Remove card"
                    >
                      ✕
                    </button>

                    {/* Play this card button */}
                    <button onClick={() => handleBuildDay(save)}
                      style={{ flex: 1, background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Play this card →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pins.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>
              <span>📌 Saved for Later</span>
              <div style={S.line} />
            </div>
            {pins.map(save => !flaggedIds.has(save.id) && (
              <div key={save.id} style={{ borderRadius: 14, padding: 0, marginBottom: 12, background: '#FFFFFF', overflow: 'hidden' }}>
                {/* Accent line */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #8FB88A, #3D9E8F)' }} />

                {/* Content */}
                <div style={{ padding: '12px 14px' }}>
                  {/* Title with badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{save.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#1C1917', margin: 0 }}>{save.title}</h3>
                    </div>
                    <span style={{ fontSize: 14 }}>📌</span>
                  </div>

                  {/* Pitch */}
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(28,25,23,0.6)', margin: '4px 0 10px 28px' }}>{save.pitch}</p>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#F5EFE0', margin: '8px 0' }} />

                  {/* Action buttons row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    {/* Heart button */}
                    <button onClick={() => handleHeartToggle(save)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      title="Upgrade to Saved as Fave"
                    >
                      ❤️
                    </button>

                    {/* Flag button */}
                    <button onClick={() => handleFlag(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: flagPopupId === save.id ? '#F5C842' : (flaggedIds.has(save.id) ? '#F5C842' : '#FEF3CC'), border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
                      title={flaggedIds.has(save.id) ? "Unflag this card" : "Flag this card"}
                    >
                      🚩
                      {flagPopupId === save.id && (
                        <div style={{ position: 'absolute', bottom: 50, left: 0, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 8px 24px rgba(28,25,23,0.15)', padding: '6px 0', zIndex: 10, minWidth: 160 }}>
                          {flaggedIds.has(save.id) ? (
                            <button onClick={() => handleUnflag(save.id)}
                              style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', color: '#1C1917' }}
                            >
                              ✓ Unflag
                            </button>
                          ) : (
                            [
                              { icon: '🔒', label: 'Permanently closed' },
                              { icon: '📅', label: 'Not today' },
                              { icon: '🚫', label: 'Bad suggestion' },
                            ].map(({ icon, label }) => (
                              <button key={label} onClick={() => handleFlagReason(save.id)}
                                style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', color: '#1C1917' }}
                              >
                                {icon} {label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </button>

                    {/* Remove button */}
                    <button onClick={() => handleDelete(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#E07055' }}
                      title="Remove card"
                    >
                      ✕
                    </button>

                    {/* Play this card button */}
                    <button onClick={() => handleBuildDay(save)}
                      style={{ flex: 1, background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Play this card →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalSaves === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8C7B6B', fontFamily: 'var(--font-body)' }}>
            No saves for {city} yet
          </div>
        )}
      </main>

      {/* Plan a [city] day button at footer */}
      {totalSaves > 0 && (
        <div style={{ padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <button onClick={handlePlanCityDay}
            style={{ display: 'block', width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: 26, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,200,66,0.35)' }}
          >
            ✨ Plan a {city} day →
          </button>
        </div>
      )}

    </div>
  )
}
