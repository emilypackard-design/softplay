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
  const [toast, setToast] = useState<string | null>(null)
  const [justMovedId, setJustMovedId] = useState<string | null>(null)

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

    // Update local state — moved card lands at the TOP of its new section
    const movingToHeart = save.type === 'pin'
    if (save.type === 'heart') {
      setHearts(hearts.filter(s => s.id !== save.id))
      setPins([{ ...save, type: 'pin' }, ...pins])
    } else {
      setPins(pins.filter(s => s.id !== save.id))
      setHearts([{ ...save, type: 'heart' }, ...hearts])
    }

    // Feedback toast + brief "land" highlight on the moved card in its new section
    setToast(movingToHeart ? '❤️ Saved to Family Faves' : '📌 Moved to Save for Later')
    setJustMovedId(save.id)
    window.setTimeout(() => setToast(null), 1800)
    window.setTimeout(() => setJustMovedId(prev => (prev === save.id ? null : prev)), 900)
  }

  const handleDelete = (id: string) => {
    const current = JSON.parse(localStorage.getItem(PLAYGROUND_KEY) || '[]') as PlaygroundSave[]
    const updated = current.filter(s => s.id !== id)
    localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(updated))

    setHearts(hearts.filter(s => s.id !== id))
    setPins(pins.filter(s => s.id !== id))

    // Feedback so the delete isn't silent (important on mobile, where tooltips don't show)
    setToast('🗑️ Removed from Playground')
    window.setTimeout(() => setToast(null), 1800)
  }

  const handleBuildDay = (save: PlaygroundSave) => {
    if (!city) return
    // Navigate directly to Play by Play with card info
    sessionStorage.setItem('playgroundCard', JSON.stringify(save))
    router.push(`/playground/${encodeURIComponent(city)}/play-by-play`)
  }


  if (!mounted || !city) return null

  const S = {
    // One continuous gradient anchored on emerald #1C7E46: rich green at top → cream by ~240px, then stays cream.
    screen: { minHeight: '100vh', backgroundImage: 'linear-gradient(180deg, #1C7E46 0%, #4F9D6C 22%, #84BD93 45%, #B9D9C0 66%, #E4F1E5 85%, #FEFBF3 100%)', backgroundRepeat: 'no-repeat', backgroundSize: '100% 420px', backgroundColor: '#FEFBF3', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const },
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', width: '100%', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' },
    wordmark: { fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic' as const, color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' },
    pathwayLabel: { fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' },
    header: { background: 'transparent', padding: '76px 24px 44px', textAlign: 'center' as const, position: 'relative' as const, width: '100%', maxWidth: 480 },
    backLink: { position: 'absolute' as const, left: 16, top: 16, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', textDecoration: 'none', cursor: 'pointer' },
    title: { fontFamily: 'var(--font-wordmark)', fontSize: 28, fontWeight: 700, color: '#1C1917', margin: '0 0 2px' },
    divider: { width: 48, height: 1, background: 'rgba(255,255,255,0.7)', border: 'none', margin: '12px auto 14px' },
    meta: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(28,25,23,0.75)', margin: 0 },
    main: { flex: 1, padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%', overflowY: 'auto' as const },
    section: { marginBottom: 24 },
    sectionLabel: { fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: 'rgba(28,25,23,0.75)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
    line: { flex: 1, height: '1.5px', background: 'rgba(28,25,23,0.22)' },
    card: { borderRadius: 14, padding: '13px 14px', marginBottom: 12, background: '#FFFFFF' },
    cardContent: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 },
    heartCard: { background: '#FFFAF8', border: '1.5px solid rgba(224,112,85,0.15)' },
    emojiBox: { width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#FFF0EC', flexShrink: 0 },
    content: { flex: 1 },
    cardTitle: { fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#1C1917', margin: 0 },
    cardPitch: { fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(28,25,23,0.82)', margin: '2px 0 0' },
    actions: { display: 'flex', alignItems: 'center', gap: 8 },
    badge: { fontFamily: 'var(--font-body)', fontSize: 12 },
    deleteBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(28,25,23,0.4)', padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    footer: { padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%' },
    planBtn: { display: 'block', width: '100%', background: '#F5C842', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: 26, textAlign: 'center' as const, textDecoration: 'none', boxShadow: '0 4px 16px rgba(245,200,66,0.35)' },
  }

  const totalSaves = hearts.length + pins.length

  return (
    <div style={S.screen}>
      <style>{`
        @keyframes pg-toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes pg-card-land { 0% { transform: translateY(-12px); opacity: 0.3; box-shadow: 0 0 0 3px rgba(61,107,65,0.55); } 100% { transform: translateY(0); opacity: 1; box-shadow: 0 0 0 0 rgba(61,107,65,0); } }
      `}</style>
      <header style={S.topBar}>
        <Link href="/" style={S.wordmark}>softplay</Link>
        <span style={S.pathwayLabel}>Playground</span>
      </header>
      <div style={S.header}>
        <Link href="/playground" style={S.backLink}>
          <span>←</span>
          <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(12,12)">
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(0) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(45) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(90) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(135) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(180) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(225) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(270) translate(0,-6)"/>
              <ellipse rx="2" ry="4.6" fill="white" transform="rotate(315) translate(0,-6)"/>
              <circle r="3.2" fill="#F0A820"/>
            </g>
          </svg>
          <span>Playground</span>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={S.title}>{city}</h1>
          <hr style={S.divider} />
          <p style={S.meta}>Tap 'Play this card' to build a day around it.</p>
          <p style={{ ...S.meta, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#FFF0EC', border: '1px solid #E07055', color: '#E07055', fontSize: 10, lineHeight: 1, flexShrink: 0 }}>✕</span>
            <span>removes a card from your Playground.</span>
          </p>
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
              <div key={save.id} style={{ borderRadius: 14, padding: 0, marginBottom: 12, background: '#FFFFFF', overflow: 'hidden', animation: justMovedId === save.id ? 'pg-card-land 0.7s ease-out' : undefined }}>
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
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#6E6560', border: '1px solid #6E6560', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      title="Move to Save for Later"
                    >
                      ❤️
                    </button>

                    {/* Flag button */}
                    <button onClick={() => handleFlag(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: flagPopupId === save.id ? '#F5C842' : (flaggedIds.has(save.id) ? '#F5C842' : '#FEF3CC'), border: '1px solid #C9963A', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
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
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: '1px solid #E07055', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#E07055' }}
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
              <div key={save.id} style={{ borderRadius: 14, padding: 0, marginBottom: 12, background: '#FFFFFF', overflow: 'hidden', animation: justMovedId === save.id ? 'pg-card-land 0.7s ease-out' : undefined }}>
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
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: '1px solid #6E6560', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      title="Move to Family Faves"
                    >
                      ❤️
                    </button>

                    {/* Flag button */}
                    <button onClick={() => handleFlag(save.id)}
                      style={{ width: 42, height: 42, borderRadius: '50%', background: flagPopupId === save.id ? '#F5C842' : (flaggedIds.has(save.id) ? '#F5C842' : '#FEF3CC'), border: '1px solid #C9963A', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
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
                      style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EC', border: '1px solid #E07055', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#E07055' }}
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

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1C1917', color: '#FEFBF3', borderRadius: 14, padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 16px rgba(28,25,23,0.3)', animation: 'pg-toast-in 0.25s ease-out', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
