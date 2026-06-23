'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PinwheelIcon from '@/components/PinwheelIcon'
import type { PlaygroundSave } from '@/types'

interface Card {
  id: string
  name: string
  emoji: string
  pitch: string
  checkItUrl: string
}

interface Kid { age: number }

type Step = 'entry' | 'cards'

const LOADING_QUIPS = [
  'Asking the locals…',
  'Ignoring the tourist traps…',
  'Finding the good stuff…',
  'Thinking like a local friend…',
  'Almost there…',
]

// ── localStorage utilities ────────────────────────────────────────
const PLAYGROUND_KEY = 'softplay_playground'

function getPlaygroundSaves(): PlaygroundSave[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(PLAYGROUND_KEY)
  return data ? JSON.parse(data) : []
}

function saveToPlayground(save: PlaygroundSave) {
  const current = getPlaygroundSaves()
  // Skip if card already exists (first save wins, no city changes)
  const alreadyExists = current.some(s => s.title === save.title)
  if (alreadyExists) {
    return { saved: save, canUndo: false, message: 'Already in Playground' }
  }
  // Cap at 100 total
  const updated = [save, ...current].slice(0, 100)
  localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(updated))
  return { saved: save, canUndo: true }
}

function removeFromPlayground(id: string) {
  const current = getPlaygroundSaves()
  const updated = current.filter(s => s.id !== id)
  localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(updated))
}

// ── Card component ────────────────────────────────────────────────

function SwipeCard({ card, onAction, disabled }: {
  card: Card
  onAction: (action: 'pin' | 'flag' | 'never' | 'heart', reason?: string) => void
  disabled: boolean
}) {
  const [pinned, setPinned] = useState(false)
  const [hearted, setHearted] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [showFlagPopup, setShowFlagPopup] = useState(false)
  const [toast, setToast] = useState<{ type: 'pin' | 'heart', title: string } | null>(null)
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  const handleNoThanks = () => {
    if (!disabled) onAction('never')
  }

  const handleFlag = () => {
    if (!disabled) {
      if (flagged) {
        // Second tap — reset without showing popup
        setFlagged(false)
      } else {
        // First tap — show popup
        setShowFlagPopup(true)
      }
    }
  }

  const handleFlagOption = (reason: string) => {
    setFlagged(true)
    setShowFlagPopup(false)
    // Delay moving to next card so color change renders first (match pin/heart 2sec delay)
    setTimeout(() => onAction('flag', reason), 2000)
  }

  const handlePin = () => {
    if (!disabled) {
      if (pinned) {
        // Undo — remove from playground
        setPinned(false)
      } else {
        // Add to playground
        setPinned(true)
        setToast({ type: 'pin', title: card.name })
        setTimeout(() => setToast(null), 3000)
        // Delay 2 seconds so user sees color change & toast before next card
        setTimeout(() => onAction('pin'), 2000)
      }
    }
  }

  const handleHeart = () => {
    if (!disabled) {
      if (hearted) {
        // Undo — remove from playground
        setHearted(false)
      } else {
        // Add to playground
        setHearted(true)
        setToast({ type: 'heart', title: card.name })
        setTimeout(() => setToast(null), 3000)
        // Delay moving to next card so color change renders first
        setTimeout(() => onAction('heart'), 200)
      }
    }
  }

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
      {/* The card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 8px 32px rgba(28,25,23,0.12)',
        marginBottom: 20,
        minHeight: 180,
        position: 'relative',
      }}>

        <div style={{ fontSize: 48, marginBottom: 12 }}>{card.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', margin: '0 0 10px', lineHeight: 1.2 }}>
          {card.name}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', lineHeight: 1.6, margin: '0 0 16px' }}>
          {card.pitch}
        </p>
        <a href={card.checkItUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#3D9E8F', textDecoration: 'none' }}>
          🔗 Check it →
        </a>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between', marginTop: 28, paddingBottom: 8, position: 'relative' }}>
        {/* Skip button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, order: 4 }}>
          <button
            onClick={handleNoThanks}
            onMouseDown={() => !disabled && setPressedButton('noThanks')}
            onMouseUp={() => setPressedButton(null)}
            onTouchStart={() => !disabled && setPressedButton('noThanks')}
            onTouchEnd={() => setPressedButton(null)}
            disabled={disabled}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: '#FFF0EC',
              border: '1px solid #E07055',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transform: pressedButton === 'noThanks' ? 'scale(0.88)' : 'scale(1)',
              transition: 'transform 0.08s ease'
            }}
          >
            <span style={{ fontSize: 22, color: '#E07055', fontWeight: 700 }}>✕</span>
          </button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 800, color: '#1C1917', letterSpacing: '0.3px', textTransform: 'uppercase', textAlign: 'center', width: 56, lineHeight: 1.2 }}>Skip</span>
        </div>

        {/* Flag button with popup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', order: 3 }}>
          <button
            onClick={handleFlag}
            onMouseDown={() => !disabled && setPressedButton('flag')}
            onMouseUp={() => setPressedButton(null)}
            onTouchStart={() => !disabled && setPressedButton('flag')}
            onTouchEnd={() => setPressedButton(null)}
            disabled={disabled}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: flagged ? '#F5C842' : '#FEF3CC',
              border: '1px solid #C9963A',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.08s ease',
              transform: pressedButton === 'flag' ? 'scale(0.88)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: 22 }}>🚩</span>
          </button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 800, color: flagged ? '#C9963A' : '#1C1917', letterSpacing: '0.3px', textTransform: 'uppercase', textAlign: 'center', width: 56, lineHeight: 1.2, transition: 'color 0.2s' }}>{flagged ? 'Flagged' : 'Flag'}</span>

          {/* Flag popup — only on first tap */}
          {showFlagPopup && !flagged && (
            <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', background: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 32px rgba(28,25,23,0.16)', zIndex: 100, width: 192, padding: 6 }}>
              {[
                { emoji: '🔒', label: 'Permanently closed' },
                { emoji: '📅', label: 'Not today' },
                { emoji: '🚫', label: 'Bad suggestion' },
              ].map((option, i) => (
                <button key={i} onClick={() => handleFlagOption(option.label)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#1C1917', borderRadius: 12, marginBottom: i < 2 ? 0 : 0 }}>
                  {option.emoji} {option.label}
                </button>
              ))}
              {/* Popup arrow */}
              <div style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #FFFFFF' }} />
            </div>
          )}
        </div>

        {/* Save for Later button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, order: 1 }}>
          <button
            onClick={handlePin}
            onMouseDown={() => !disabled && setPressedButton('pin')}
            onMouseUp={() => setPressedButton(null)}
            onTouchStart={() => !disabled && setPressedButton('pin')}
            onTouchEnd={() => setPressedButton(null)}
            disabled={disabled}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: pinned ? '#3D9E8F' : '#E5EFE3',
              border: '1px solid #3D9E8F',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.08s ease',
              transform: pressedButton === 'pin' ? 'scale(0.88)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: 22 }}>📌</span>
          </button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 800, color: pinned ? '#3D9E8F' : '#1C1917', letterSpacing: '0.3px', textTransform: 'uppercase', textAlign: 'center', width: 56, lineHeight: 1.2, transition: 'color 0.2s' }}>{pinned ? 'Saved' : 'Save for Later'}</span>
        </div>

        {/* Save as Fave button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, order: 2 }}>
          <button
            onClick={handleHeart}
            onMouseDown={() => !disabled && setPressedButton('heart')}
            onMouseUp={() => setPressedButton(null)}
            onTouchStart={() => !disabled && setPressedButton('heart')}
            onTouchEnd={() => setPressedButton(null)}
            disabled={disabled}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: hearted ? '#6E6560' : '#FFF0EC',
              border: '1px solid #6E6560',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.08s ease',
              transform: pressedButton === 'heart' ? 'scale(0.88)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: 22 }}>❤️</span>
          </button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 800, color: '#1C1917', letterSpacing: '0.3px', textTransform: 'uppercase', textAlign: 'center', width: 56, lineHeight: 1.2 }}>Family Fave</span>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div style={{ position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#1C1917', color: '#FEFBF3', borderRadius: 14, padding: '10px 14px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(28,25,23,0.3)', animation: 'slideUp 0.3s ease-out' }}>
          <span>{toast.type === 'pin' ? '📌' : '❤️'} {toast.type === 'pin' ? 'Saved for Later' : 'Added to Family Favourites'}</span>
          <button onClick={() => { if (toast.type === 'pin') setPinned(false); else setHearted(false); setToast(null); }} style={{ background: '#F5C842', color: '#1C1917', border: 'none', borderRadius: 6, padding: '4px 8px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Undo
          </button>
        </div>
      )}

      {/* Dismiss flag popup on outside click */}
      {showFlagPopup && <div onClick={() => setShowFlagPopup(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function FreePlayPage() {
  const [step, setStep] = useState<Step>('entry')

  // Entry state
  const [city, setCity] = useState('')
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState<Kid[]>([])
  const [preferences, setPreferences] = useState('')
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set())

  // Card state
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [yeses, setYeses] = useState<Card[]>([])
  const [pinned, setPinned] = useState<Card[]>([])
  const [hearted, setHearted] = useState<Card[]>([])
  const [vetoes, setVetoes] = useState<string[]>([])           // persisted permanent (only "Permanently closed"), shared with Playbook
  const [sessionExcludes, setSessionExcludes] = useState<string[]>([])  // session-only: skip, heart-dedup, "not today", "bad suggestion"
  const [seen, setSeen] = useState<string[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [quipIndex, setQuipIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Toast state
  const [toast, setToast] = useState<{ id: string; title: string; emoji: string; type: 'pin' | 'heart' } | null>(null)


  const currentCard = cards[currentIndex]
  const yesCount = yeses.length

  // Load persisted vetoes from localStorage on mount
  // Also exclude cards already saved to Playground from suggestions
  useEffect(() => {
    if (typeof window !== 'undefined' && city) {
      const savedVetoes = localStorage.getItem(`softplay_vetoes_${city.toLowerCase()}`)
      if (savedVetoes) {
        try {
          setVetoes(JSON.parse(savedVetoes))
        } catch (e) {
          console.error('Error loading vetoes:', e)
        }
      }

      // Load playground saves to exclude from suggestions
      const playgroundData = getPlaygroundSaves()
      const playgroundNames = playgroundData.map(s => s.title)
      setSeen(playgroundNames)
    }
  }, [city])

  // Save vetoes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && city && vetoes.length > 0) {
      localStorage.setItem(`softplay_vetoes_${city.toLowerCase()}`, JSON.stringify(vetoes))
    }
  }, [vetoes, city])

  // Rotate loading quips
  useEffect(() => {
    if (!loadingCards) return
    let qi = 0
    const t = setInterval(() => { qi = (qi + 1) % LOADING_QUIPS.length; setQuipIndex(qi) }, 2000)
    return () => clearInterval(t)
  }, [loadingCards])

  // No auto-load — just use the initial 6 cards

  // background = fetch quietly without disabling the deck (used for flag
  // replacements, so the user keeps swiping at full speed while it loads)
  const loadMoreCards = async (appendLimit?: number, background = false) => {
    if (!background) setLoadingCards(true)
    setError(null)
    try {
      // Combine selected chips with preferences
      const preferencesWithChips = [
        Array.from(selectedChips).join(', '),
        preferences
      ].filter(p => p.trim()).join('. ')

      // Personalize with the saved Playbill when one exists (V1.5 decision):
      // food avoids, dislikes etc. flow into Free Play suggestions too.
      let savedPlaybill = null
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('lastPlaybill') : null
        if (raw) savedPlaybill = JSON.parse(raw)
      } catch { /* ignore — stay anonymous */ }

      // Exclude both the permanent vetoes (persisted, shared with Playbook) and this
      // session's situational excludes (skips, "not today", "bad suggestion", hearts).
      const excluded = [...vetoes, ...sessionExcludes]
      const res = await fetch('/api/free-play-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, adults, kids, seen, vetoes: excluded, playbill: savedPlaybill, preferences: preferencesWithChips }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Safety net: never show a card that was previously flagged/vetoed for this city.
      const vetoSet = new Set(excluded.map((v: string) => v.toLowerCase()))
      let freshCards = data.cards.filter((c: Card) => !vetoSet.has(c.name.toLowerCase()))
      // appendLimit: when flagging, we only want ONE replacement card (keeps the 6-card flow).
      if (appendLimit) freshCards = freshCards.slice(0, appendLimit)
      setCards(prev => [...prev, ...freshCards])
      setSeen(prev => [...prev, ...data.cards.map((c: Card) => c.name)])
    } catch (e: unknown) {
      if (!background) setError(e instanceof Error ? e.message : 'Could not load cards')
    } finally {
      if (!background) setLoadingCards(false)
    }
  }

  const startCards = async () => {
    if (!city) return
    setStep('cards')
    await loadMoreCards()
  }

  const handleAction = (action: 'pin' | 'flag' | 'never' | 'heart', reason?: string) => {
    if (!currentCard) return

    if (action === 'pin') {
      // Save to Playground as pin
      const save: PlaygroundSave = {
        id: Date.now().toString(),
        type: 'pin',
        title: currentCard.name,
        emoji: currentCard.emoji,
        pitch: currentCard.pitch,
        city: city,
        savedAt: Date.now(),
      }
      saveToPlayground(save)
      setToast({ id: save.id, title: currentCard.name, emoji: currentCard.emoji, type: 'pin' })
      setTimeout(() => setToast(null), 3000)
      setPinned(prev => [...prev, currentCard])
      setCurrentIndex(i => i + 1)
    } else if (action === 'heart') {
      // Save to Playground as heart (family favorite)
      const save: PlaygroundSave = {
        id: Date.now().toString(),
        type: 'heart',
        title: currentCard.name,
        emoji: currentCard.emoji,
        pitch: currentCard.pitch,
        city: city,
        savedAt: Date.now(),
      }
      saveToPlayground(save)
      setToast({ id: save.id, title: currentCard.name, emoji: currentCard.emoji, type: 'heart' })
      setTimeout(() => setToast(null), 3000)
      setHearted(prev => [...prev, currentCard])
      // Don't re-show this session (it's now in the Playground; the 'seen' load covers future sessions)
      setSessionExcludes(prev => [...prev, currentCard.name])
      setCurrentIndex(i => i + 1)
    } else if (action === 'never') {
      // Skip is situational — exclude this session only, can resurface another day
      setSessionExcludes(prev => [...prev, currentCard.name])
      setCurrentIndex(i => i + 1)
    } else if (action === 'flag') {
      // Flag: move on + add ONE free replacement card (universal flag rule).
      // Only "Permanently closed" persists across sessions + both pathways; other
      // reasons ("Not today", "Bad suggestion") are situational → session-only.
      if (reason === 'Permanently closed') {
        setVetoes(prev => [...prev, currentCard.name])
      } else {
        setSessionExcludes(prev => [...prev, currentCard.name])
      }
      setCurrentIndex(i => i + 1)
      void loadMoreCards(1, true)
    }
  }

  const addKid = () => setKids(k => [...k, { age: 8 }])
  const removeKid = () => setKids(k => k.slice(0, -1))
  const updateKidAge = (i: number, age: number) =>
    setKids(k => k.map((kid, idx) => idx === i ? { age } : kid))

  const S = {
    screen: { background: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' },
    main: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '32px 20px 56px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const },
    btnPrimary: { background: '#F2C94C', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, height: 52, borderRadius: 26, border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 18px rgba(242,201,76,0.4)' } as React.CSSProperties,
    card: { background: '#FFFFFF', borderRadius: 20, padding: 18, boxShadow: '0 4px 16px rgba(28,25,23,0.08)', marginBottom: 12 },
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      <div style={S.screen}>
      {/* Header */}
      <header style={S.header}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          softplay
        </Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090' }}>Free Play</span>
      </header>

      <main style={S.main}>

        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FFF0EC', border: '1px solid #E07055', borderRadius: 16, color: '#B85040', fontFamily: 'var(--font-body)', fontSize: 14, width: '100%' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── ENTRY ── */}
        {step === 'entry' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ marginBottom: 16 }}><PinwheelIcon size={52} /></div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>
                Free Play
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#8C7B6B' }}>
                Fill in your location and crew size, add a few details, and off you go!
              </p>
            </div>

            {/* City */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: '#1C1917', display: 'block', marginBottom: 8 }}>Where are you?</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Dublin, Boston, London…"
                style={{ width: '100%', border: '1.5px solid #E8DCC8', borderRadius: 16, padding: '13px 16px', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' as const, background: '#FFFFFF', color: '#1C1917' }}
              />
            </div>

            {/* Adults */}
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>Adults</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: '#F5EFE0', border: 'none', fontSize: 24, cursor: 'pointer', fontWeight: 700, color: '#1C1917', WebkitAppearance: 'none', WebkitTouchCallout: 'none', padding: 0 }}>−</button>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', minWidth: 24, textAlign: 'center' }}>{adults}</span>
                <button type="button" onClick={() => setAdults(a => a + 1)}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: '#F2C94C', border: 'none', fontSize: 24, cursor: 'pointer', fontWeight: 700, color: '#1C1917', WebkitAppearance: 'none', WebkitTouchCallout: 'none', padding: 0 }}>+</button>
              </div>
            </div>

            {/* Kids */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: kids.length > 0 ? 16 : 0 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>Kids</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="button" onClick={removeKid} disabled={kids.length === 0}
                    style={{ width: 48, height: 48, borderRadius: '50%', background: '#F5EFE0', border: 'none', fontSize: 24, cursor: kids.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, color: '#1C1917', opacity: kids.length === 0 ? 0.3 : 1, WebkitAppearance: 'none', WebkitTouchCallout: 'none', padding: 0 }}>−</button>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', minWidth: 24, textAlign: 'center' }}>{kids.length}</span>
                  <button type="button" onClick={addKid}
                    style={{ width: 48, height: 48, borderRadius: '50%', background: '#F2C94C', border: 'none', fontSize: 24, cursor: 'pointer', fontWeight: 700, color: '#1C1917', WebkitAppearance: 'none', WebkitTouchCallout: 'none', padding: 0 }}>+</button>
                </div>
              </div>
              {kids.map((kid, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D' }}>Kid {i + 1}</span>
                  <select value={kid.age} onChange={e => updateKidAge(i, Number(e.target.value))}
                    style={{ border: '1.5px solid #E8DCC8', borderRadius: 12, padding: '8px 12px', fontSize: 14, color: '#1C1917', background: '#FEFBF3', fontFamily: 'var(--font-body)' }}>
                    {Array.from({ length: 16 }, (_, j) => j + 2).map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Quick preference chips */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: '#1C1917', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick picks</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['No car', 'Indoors', 'Low cost'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const newChips = new Set(selectedChips)
                      if (newChips.has(chip)) {
                        newChips.delete(chip)
                      } else {
                        newChips.add(chip)
                      }
                      setSelectedChips(newChips)
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 20,
                      border: `1.5px solid ${selectedChips.has(chip) ? '#F2C94C' : '#E8DCC8'}`,
                      background: selectedChips.has(chip) ? '#FEF9E7' : '#FFFFFF',
                      color: selectedChips.has(chip) ? '#1C1917' : '#5C4E3D',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Anything else text field */}
            <div style={{ ...S.card, padding: '14px 16px' }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: '#1C1917', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anything else</label>
              <textarea
                value={preferences}
                onChange={e => setPreferences(e.target.value)}
                placeholder="Anything else you're feeling or not feeling for today (e.g. 'no hikes today')"
                rows={3}
                style={{ width: '100%', border: '1.5px solid #E8DCC8', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', background: '#FFFFFF', color: '#1C1917', resize: 'none', lineHeight: 1.5 }}
              />
            </div>

            <button type="button" onClick={startCards} disabled={!city}
              style={{ ...S.btnPrimary, opacity: city ? 1 : 0.4, cursor: city ? 'pointer' : 'not-allowed', WebkitAppearance: 'none', WebkitTouchCallout: 'none' }}>
              Show me what&apos;s out there →
            </button>
          </div>
        )}

        {/* ── CARDS ── */}
        {step === 'cards' && (
          <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Toast notification */}
            {toast && (
              <div style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1C1917',
                color: '#FEFBF3',
                padding: '12px 20px',
                borderRadius: 16,
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                zIndex: 1000,
                boxShadow: '0 4px 16px rgba(28,25,23,0.2)',
                animation: 'slideUp 0.3s ease-out',
              }}>
                <span>{toast.emoji}</span>
                <span>{toast.title} {toast.type === 'heart' ? 'loved!' : 'saved!'}</span>
              </div>
            )}

            {/* Yes counter + wheel prompt */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B' }}>
                {city} · {adults} adult{adults !== 1 ? 's' : ''}{kids.length > 0 ? ` · ${kids.length} kid${kids.length !== 1 ? 's' : ''}` : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < yesCount ? '#F2C94C' : '#E8DCC8', transition: 'background 0.2s' }} />
                ))}
              </div>
            </div>

            <p style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginTop: 0, marginBottom: 16, lineHeight: 1.5, textAlign: 'center' }}>
              Tap 📌 or ❤️ to save a card to your Playground (where your saved ideas live).
            </p>

            {/* Card or loading */}
            {loadingCards && cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ marginBottom: 16 }}><PinwheelIcon size={52} spinning /></div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#8C7B6B', fontStyle: 'italic' }}>
                  {LOADING_QUIPS[quipIndex]}
                </p>
              </div>
            ) : currentCard ? (
              <SwipeCard key={currentCard.id} card={currentCard} onAction={handleAction} disabled={loadingCards} />
            ) : loadingCards ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <PinwheelIcon size={40} spinning />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 12 }}>Loading…</p>
              </div>
            ) : cards.length > 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>
                  You've explored all {cards.length} ideas
                </p>
                {(hearted.length > 0 || pinned.length > 0) && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#8C7B6B', lineHeight: 1.6, marginBottom: 28 }}>
                    {hearted.length > 0 && `❤️ ${hearted.length} Family Fave${hearted.length !== 1 ? 's' : ''}`}
                    {hearted.length > 0 && pinned.length > 0 && ' · '}
                    {pinned.length > 0 && `📌 ${pinned.length} Saved`}
                  </p>
                )}
                <Link href={`/playground/${encodeURIComponent(city)}`} style={{ display: 'block', background: '#F2C94C', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, padding: '15px 32px', borderRadius: 26, textDecoration: 'none', boxShadow: '0 4px 18px rgba(242,201,76,0.4)', marginBottom: 12 }}>
                  View in Playground →
                </Link>
                <Link href="/" style={{ display: 'block', background: 'none', color: '#8C7B6B', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, padding: '12px 32px', borderRadius: 22, border: '1.5px solid #E8DCC8', textDecoration: 'none' }}>
                  Back to home
                </Link>
              </div>
            ) : null}
          </div>
        )}


      </main>
    </div>
    </>
  )
}
