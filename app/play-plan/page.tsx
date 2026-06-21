'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PlaybillData, PlayStructureData, WheelOption, Stop } from '@/types'
import Wheel from '@/components/Wheel'
import PlayByPlayView from '@/components/PlayByPlayView'
import PinwheelIcon from '@/components/PinwheelIcon'
import { sameStop } from '@/lib/stopNames'

type Step =
  | 'welcome' | 'crew' | 'fun-chips' | 'not-fun-chips' | 'food' | 'great-day' | 'practical'
  | 'play-structure' | 'generating' | 'options' | 'family-fave-swap' | 'wildcard-swap' | 'countdown' | 'wheel'
  | 'loading-plan' | 'play-by-play' | 'replay'

const STEP_ORDER: Step[] = [
  'welcome', 'crew', 'fun-chips', 'not-fun-chips', 'food', 'great-day', 'practical',
  'play-structure', 'generating', 'options', 'family-fave-swap', 'wildcard-swap', 'countdown', 'wheel', 'loading-plan', 'play-by-play', 'replay',
]

// Mini wheel component for countdown
function MiniWheel() {
  return (
    <div style={{ position: 'relative', width: 24, height: 24 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#E8E8E8" strokeWidth="2"/>
        <circle cx="50" cy="50" r="40" fill="url(#wheelGradient)"/>
        <defs>
          <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C842" />
            <stop offset="25%" stopColor="#3D9E8F" />
            <stop offset="50%" stopColor="#E07055" />
            <stop offset="75%" stopColor="#8FB88A" />
            <stop offset="100%" stopColor="#F5C842" />
          </linearGradient>
        </defs>
        {/* Center dot */}
        <circle cx="50" cy="50" r="8" fill="#1C1917" />
      </svg>
    </div>
  )
}

const COUNTDOWN_LINES = [
  { icon: '✅', text: 'Options locked in.' },
  { icon: '👥', text: 'Crew assembled.' },
  { component: MiniWheel, text: 'Decision wheel… ready.' },
  { icon: '🎲', text: 'One spin. No take-backs.' },
]

const LOADING_QUIPS = [
  'Consulting the locals…',
  'Ignoring the obvious tourist traps…',
  'Finding something everyone will actually enjoy…',
  'Checking what\'s genuinely worth it…',
  'Thinking like a knowledgeable local friend…',
  'Avoiding anywhere with a gift shop at the exit…',
  'Looking for the hidden gems…',
  'Almost there — making sure fate has good taste…',
]

const FUN_CHIPS = [
  { id: 'adventure', emoji: '🧗', label: 'Adventure & thrills' },
  { id: 'beach',     emoji: '🏖️', label: 'Beach & coast' },
  { id: 'craft',     emoji: '🎨', label: 'Craft & workshops' },
  { id: 'food',      emoji: '🍜', label: 'Food experiences' },
  { id: 'hiking',    emoji: '🥾', label: 'Hiking & trails' },
  { id: 'history',   emoji: '🏰', label: 'History' },
  { id: 'shows',     emoji: '🎭', label: 'Live shows' },
  { id: 'markets',   emoji: '🎪', label: 'Markets & fairs' },
  { id: 'playgrounds', emoji: '🛝', label: 'Playgrounds' },
  { id: 'wander',    emoji: '☕', label: 'Slow wanders & cafés' },
  { id: 'visual-arts', emoji: '🖼️', label: 'Visual arts' },
]

const FOOD_LOVE_CHIPS = [
  { id: 'bakery',     emoji: '🥐', label: 'Bakeries' },
  { id: 'bistro',     emoji: '🍷', label: 'Bistros' },
  { id: 'cafes',      emoji: '☕', label: 'Cafés' },
  { id: 'gourmet',    emoji: '🍽️', label: 'Gourmet meals' },
  { id: 'ice-cream',  emoji: '🍦', label: 'Ice cream' },
  { id: 'local',      emoji: '🗺️', label: 'Local specialities' },
  { id: 'picnics',    emoji: '🧺', label: 'Picnics' },
  { id: 'pizza',      emoji: '🍕', label: 'Pizza' },
  { id: 'small-plates', emoji: '🍤', label: 'Small plates' },
  { id: 'street',     emoji: '🚐', label: 'Street food' },
]

const FOOD_AVOID_CHIPS = [
  { id: 'buffets',     emoji: '🥘', label: 'Buffets' },
  { id: 'crowded',     emoji: '👥', label: 'Crowded spots' },
  { id: 'dairy',       emoji: '🧀', label: 'Dairy' },
  { id: 'fast-food',   emoji: '🍟', label: 'Fast food' },
  { id: 'fine-dining', emoji: '🍽️', label: 'Fine dining' },
  { id: 'foodtruck',   emoji: '🚐', label: 'Food trucks' },
  { id: 'gluten',      emoji: '🌾', label: 'Gluten' },
  { id: 'meat',        emoji: '🥩', label: 'Meat' },
  { id: 'nuts',        emoji: '🥜', label: 'Nuts' },
  { id: 'pubs',        emoji: '🍺', label: 'Pubs' },
  { id: 'shellfish',   emoji: '🦐', label: 'Shellfish' },
  { id: 'spicy',       emoji: '🌶️', label: 'Spicy' },
]

const NOT_FUN_CHIPS = [
  { id: 'arcade',     emoji: '🎮', label: 'Arcades' },
  { id: 'gallery',    emoji: '🖼️', label: 'Art galleries' },
  { id: 'ballgames',  emoji: '⚾', label: 'Ball games' },
  { id: 'escape',     emoji: '🔐', label: 'Escape rooms' },
  { id: 'mini-golf',  emoji: '⛳', label: 'Mini golf' },
  { id: 'movies',     emoji: '🎬', label: 'Movies' },
  { id: 'shopping',   emoji: '🛍️', label: 'Shopping malls' },
  { id: 'theme-park', emoji: '🎢', label: 'Theme parks' },
  { id: 'water',      emoji: '🌊', label: 'Water activities' },
  { id: 'zoo',        emoji: '🦁', label: 'Zoo' },
]

const MOOD_OPTIONS = [
  { value: 'low-key',       label: '😴 Low key',      desc: 'Easy, relaxed, no rush' },
  { value: 'middle-ground', label: '😊 Middle ground', desc: 'Some effort, some ease' },
  { value: 'high-energy',   label: '🔥 High energy',  desc: 'Active and adventurous' },
  { value: 'surprise-me',   label: '🎲 Surprise me',  desc: 'Whatever you think is best' },
]
const DURATION_OPTIONS = [
  { value: 'few-hours', label: 'A few hours' },
  { value: 'half-day',  label: 'Half day' },
  { value: 'full-day',  label: 'Full day' },
]
const RADIUS_OPTIONS = [
  { value: 'local',   label: '🏘️ Stay local', desc: '~15 min' },
  { value: '30min',   label: '🚌 30 minutes', desc: 'A bit further' },
  { value: '1hour',   label: '🚗 1 hour',     desc: 'Worth the drive' },
  { value: 'further', label: '🗺️ Further',    desc: "If it's worth it" },
]
const TRANSPORT_OPTIONS = ['Walking', 'Transit', 'Car', 'Bike']

// ── Shared styles ─────────────────────────────────────────────────

const S = {
  screen: { background: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '32px 20px 56px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const },
  btnPrimary: { background: '#F2C94C', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, height: 52, borderRadius: 26, border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 18px rgba(242,201,76,0.4)', letterSpacing: '-0.01em' } as React.CSSProperties,
  btnSecondary: { background: 'transparent', color: '#1C1917', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, height: 44, borderRadius: 22, border: '1.5px solid #E8DCC8', cursor: 'pointer' } as React.CSSProperties,
  btnSkip: { background: '#F5EFE0', color: '#5C4E3D', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, height: 44, borderRadius: 22, border: 'none', cursor: 'pointer', width: '100%', marginTop: 10 } as React.CSSProperties,
  card: { background: '#FFFFFF', borderRadius: 20, padding: 18, boxShadow: '0 4px 16px rgba(28,25,23,0.08)', marginBottom: 12 },
  h1: { fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: '#1C1917', margin: 0 } as React.CSSProperties,
  label: { fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: '#1C1917', display: 'block', marginBottom: 10 } as React.CSSProperties,
  textarea: { width: '100%', border: '1.5px solid #E8DCC8', borderRadius: 16, padding: '13px 16px', fontSize: 15, fontFamily: 'var(--font-body)', lineHeight: 1.6, resize: 'none' as const, height: 120, outline: 'none', boxSizing: 'border-box' as const, background: '#FFFFFF', color: '#1C1917' },
  input: { width: '100%', border: '1.5px solid #E8DCC8', borderRadius: 16, padding: '13px 16px', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' as const, background: '#FFFFFF', color: '#1C1917' } as React.CSSProperties,
}

// ── Countdown / buildup screen ───────────────────────────────────

function CountdownScreen({
  lines, visible, onVisibleChange, onPlayBall,
}: {
  lines: ({ icon?: string; component?: () => React.ReactNode; text: string })[]
  visible: number
  onVisibleChange: (n: number) => void
  onPlayBall: () => void
}) {
  useEffect(() => {
    if (visible >= lines.length) return
    const t = setTimeout(() => onVisibleChange(visible + 1), visible === 0 ? 400 : 700)
    return () => clearTimeout(t)
  }, [visible, lines.length, onVisibleChange])

  const done = visible >= lines.length

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ marginBottom: 8 }}><PinwheelIcon size={48} spinning={!done} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '32px 0 40px', minHeight: 180 }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <span style={{ fontSize: 24, width: 32, textAlign: 'center' }}>
              {line.component ? <line.component /> : line.icon}
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917' }}>
              {line.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        opacity: done ? 1 : 0,
        transform: done ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
        pointerEvents: done ? 'auto' : 'none',
      }}>
        <button onClick={onPlayBall} style={{
          background: '#F5C842', color: '#1C1917',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20,
          height: 60, padding: '0 52px', borderRadius: 30, border: 'none',
          cursor: 'pointer', boxShadow: '0 4px 24px rgba(245,200,66,0.5)',
          letterSpacing: '-0.01em',
        }}>
          Ready to spin →
        </button>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090', marginTop: 10 }}>
          The wheel is waiting
        </p>
      </div>
    </div>
  )
}

// ── Skip button with explanatory note ────────────────────────────

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ marginTop: 14, textAlign: 'center' }}>
      <button onClick={onClick} style={S.btnSkip}>
        Skip for now
      </button>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B0A090', marginTop: 6 }}>
        The app learns your preferences as you go — no pressure to fill this in.
      </p>
    </div>
  )
}

// ── Chip selector ─────────────────────────────────────────────────

function ChipGrid({
  chips,
  selected,
  onToggle,
}: {
  chips: { id: string; emoji: string; label: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chips.map(chip => {
        const active = selected.includes(chip.id)
        return (
          <button
            key={chip.id}
            onClick={() => onToggle(chip.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 14px',
              borderRadius: 30,
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${active ? '#F2C94C' : '#E8DCC8'}`,
              background: active ? '#F2C94C' : '#FFFFFF',
              color: '#1C1917',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 16 }}>{chip.emoji}</span>
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function PlayPlanPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [quipIndex, setQuipIndex] = useState(0)

  // Load saved Playbill from localStorage on mount
  const [playbill, setPlaybill] = useState<PlaybillData>(() => {
    if (typeof window === 'undefined') {
      return {
        skipped: false, adults: 2, kids: [],
        funChips: [], funNote: '',
        notFunChips: [], notFunNote: '',
        foodLoveChips: [], foodAvoidChips: [], foodNote: '',
        greatDay: '', cityAndPractical: '',
      }
    }
    const saved = localStorage.getItem('lastPlaybill')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {
          skipped: false, adults: 2, kids: [],
          funChips: [], funNote: '',
          notFunChips: [], notFunNote: '',
          foodLoveChips: [], foodAvoidChips: [], foodNote: '',
          greatDay: '', cityAndPractical: '',
        }
      }
    }
    return {
      skipped: false, adults: 2, kids: [],
      funChips: [], funNote: '',
      notFunChips: [], notFunNote: '',
      foodLoveChips: [], foodAvoidChips: [], foodNote: '',
      greatDay: '', cityAndPractical: '',
    }
  })

  // Persist the Playbill so it's remembered next visit (Step 0 of V1.5 memory —
  // same data shape later syncs to Supabase). Skip the untouched default so we
  // don't overwrite a saved Playbill with an empty one before hydration settles.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isPristineDefault =
      playbill.kids.length === 0 && playbill.adults === 2 &&
      playbill.funChips.length === 0 && playbill.notFunChips.length === 0 &&
      playbill.foodLoveChips.length === 0 && playbill.foodAvoidChips.length === 0 &&
      !playbill.funNote && !playbill.notFunNote && !playbill.foodNote &&
      !playbill.greatDay && !playbill.cityAndPractical
    if (!isPristineDefault) {
      localStorage.setItem('lastPlaybill', JSON.stringify(playbill))
    }
  }, [playbill])

  const [playStructure, setPlayStructure] = useState<PlayStructureData>({
    city: '', sessionAdults: 2, sessionKids: [],
    mood: 'middle-ground', duration: 'half-day',
    transport: [], radius: '30min',
    lowerCarbon: false, rainProof: false, screenplay: '', sessionNotes: '',
  })

  const [wheelOptions, setWheelOptions] = useState<WheelOption[]>([])
  const [swapsRemaining, setSwapsRemaining] = useState(2)
  const [countdownVisible, setCountdownVisible] = useState(0)
  const [optionVetoes, setOptionVetoes] = useState<string[]>([])
  const [swappingOptionId, setSwappingOptionId] = useState<string | null>(null)
  const [pinnedOptions, setPinnedOptions] = useState<Set<string>>(new Set())
  const [heartedOptions, setHeartedOptions] = useState<Set<string>>(new Set())
  const [flaggedOptions, setFlaggedOptions] = useState<Set<string>>(new Set())
  const [flagPopupOption, setFlagPopupOption] = useState<WheelOption | null>(null)
  const [heartToast, setHeartToast] = useState<string | null>(null)
  const [familyFaveHeart, setFamilyFaveHeart] = useState<any | null>(null)
  const [wildcardInWheel, setWildcardInWheel] = useState(false)
  const [chosenOption, setChosenOption] = useState<WheelOption | null>(null)
  const [winnerStop, setWinnerStop] = useState<Stop | null>(null)
  const [initialFoodStop, setInitialFoodStop] = useState<Stop | undefined>()
  const [playground, setPlayground] = useState<WheelOption[]>([])
  const [vetoes, setVetoes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [replayRating, setReplayRating] = useState<'loved' | 'ok' | 'pass' | null>(null)
  const [replayNote, setReplayNote] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)

  // True when the saved Playbill has real content — used to show the skip button
  const playbillIsSaved =
    playbill.funChips.length > 0 || playbill.notFunChips.length > 0 ||
    playbill.foodLoveChips.length > 0 || playbill.foodAvoidChips.length > 0 ||
    !!playbill.funNote || !!playbill.greatDay || !!playbill.cityAndPractical

  const getPreviousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex > 0) {
      return STEP_ORDER[currentIndex - 1]
    }
    return null
  }

  const addKid = () => setPlaybill(p => ({ ...p, kids: [...p.kids, { age: 8 }] }))
  const removeKid = () => setPlaybill(p => ({ ...p, kids: p.kids.slice(0, -1) }))
  const updateKidAge = (i: number, age: number) =>
    setPlaybill(p => ({ ...p, kids: p.kids.map((k, idx) => idx === i ? { age } : k) }))
  const toggleTransport = (t: string) =>
    setPlayStructure(p => ({ ...p, transport: p.transport.includes(t) ? p.transport.filter(x => x !== t) : [...p.transport, t] }))
  const toggleFun = (id: string) =>
    setPlaybill(p => ({ ...p, funChips: p.funChips.includes(id) ? p.funChips.filter(x => x !== id) : [...p.funChips, id] }))
  const toggleNotFun = (id: string) =>
    setPlaybill(p => ({ ...p, notFunChips: p.notFunChips.includes(id) ? p.notFunChips.filter(x => x !== id) : [...p.notFunChips, id] }))
  const toggleFoodLove = (id: string) =>
    setPlaybill(p => ({ ...p, foodLoveChips: p.foodLoveChips.includes(id) ? p.foodLoveChips.filter(x => x !== id) : [...p.foodLoveChips, id] }))
  const toggleFoodAvoid = (id: string) =>
    setPlaybill(p => ({ ...p, foodAvoidChips: p.foodAvoidChips.includes(id) ? p.foodAvoidChips.filter(x => x !== id) : [...p.foodAvoidChips, id] }))

  // Every replaced/saved/flagged option gets added here so Claude never repeats it
  const trackSeen = (names: string[]) =>
    setOptionVetoes(prev => [...prev, ...names.filter(n => !prev.includes(n))])

  const handleSaveToPlayground = (option: WheelOption) => {
    // Pin and Heart are mutually exclusive
    setHeartedOptions(prev => {
      const next = new Set(prev)
      if (next.has(option.id)) {
        // Remove from hearted if it was
        next.delete(option.id)
        const current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        const updated = current.filter((s: any) => !(s.title === option.name && s.type === 'heart'))
        if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify(updated))
      }
      return next
    })

    setPinnedOptions(prev => {
      const next = new Set(prev)
      if (next.has(option.id)) {
        // Deselect pin
        next.delete(option.id)
        const current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        const updated = current.filter((s: any) => s.title !== option.name)
        if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify(updated))
      } else {
        // Select pin - only save if this card doesn't already exist in Playground
        next.add(option.id)
        let current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        // Skip if card already exists (first save wins, no city changes)
        const alreadyExists = current.some((s: any) => s.title === option.name)
        if (!alreadyExists) {
          const save = {
            id: Date.now().toString(),
            type: 'pin',
            title: option.name,
            emoji: option.emoji,
            pitch: option.pitch,
            city: playStructure.city,
            savedAt: Date.now(),
          }
          if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify([...current, save]))
        }
      }
      return next
    })
  }

  const handleFlagOption = (option: WheelOption) => {
    if (flaggedOptions.has(option.id)) {
      // Already flagged — tap again to unflag (remove from vetoes so it's back in play)
      setFlaggedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      setOptionVetoes(prev => prev.filter(v => v !== option.name))
    } else {
      // First tap — show reason popup
      setFlagPopupOption(option)
    }
  }

  const handleFlagReason = async (option: WheelOption, reason: string) => {
    // Close popup
    setFlagPopupOption(null)

    // Mark as flagged
    setFlaggedOptions(prev => new Set([...prev, option.id]))

    // Swap the option
    const newVetoes = [...optionVetoes, option.name]
    setOptionVetoes(newVetoes)
    setSwappingOptionId(option.id)
    try {
      const res = await fetch('/api/swap-option', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure, currentOptions: wheelOptions, vetoedOption: option, allVetoes: newVetoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      trackSeen([data.option.name])
      // Keep the slot's original (unique) id so swapped-in cards never collide on id
      setWheelOptions(prev => prev.map(o => o.id === option.id ? { ...data.option, id: option.id } : o))
      // Clear all UI state for this slot — replacement card always starts fresh
      setFlaggedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      setHeartedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      setPinnedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      // Re-check playground: only pre-fill saved state if new card genuinely matches
      if (typeof window !== 'undefined') {
        try {
          const saves = JSON.parse(localStorage.getItem('softplay_playground') || '[]')
          const pinNames = new Set(saves.filter((s: any) => s.type === 'pin').map((s: any) => s.title))
          const heartNames = new Set(saves.filter((s: any) => s.type === 'heart').map((s: any) => s.title))
          if (pinNames.has(data.option.name)) setPinnedOptions(prev => new Set([...prev, option.id]))
          if (heartNames.has(data.option.name)) setHeartedOptions(prev => new Set([...prev, option.id]))
        } catch { /* ignore */ }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not get a replacement.')
    } finally {
      setSwappingOptionId(null)
    }
  }

  const handleHeartOption = (option: WheelOption) => {
    // Pin and Heart are mutually exclusive
    setPinnedOptions(prev => {
      const next = new Set(prev)
      if (next.has(option.id)) {
        // Remove from pinned if it was
        next.delete(option.id)
        const current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        const updated = current.filter((s: any) => s.title !== option.name)
        if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify(updated))
      }
      return next
    })

    setHeartedOptions(prev => {
      const next = new Set(prev)
      if (next.has(option.id)) {
        // Deselect heart
        next.delete(option.id)
        const current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        const updated = current.filter((s: any) => s.title !== option.name)
        if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify(updated))
      } else {
        // Select heart - only save if this card doesn't already exist in Playground
        next.add(option.id)
        // Save to Playground as heart
        let current = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('softplay_playground') || '[]') : []
        // Skip if card already exists (first save wins, no city changes)
        const alreadyExists = current.some((s: any) => s.title === option.name)
        if (!alreadyExists) {
          const save = {
            id: Date.now().toString(),
            type: 'heart',
            title: option.name,
            emoji: option.emoji,
            pitch: option.pitch,
            city: playStructure.city,
            savedAt: Date.now(),
          }
          if (typeof window !== 'undefined') localStorage.setItem('softplay_playground', JSON.stringify([...current, save]))
          setHeartToast(option.name)
          setTimeout(() => setHeartToast(null), 3000)
        }
      }
      return next
    })
  }

  const handleVetoOption = async (option: WheelOption) => {
    if (swapsRemaining <= 0) return
    setSwappingOptionId(option.id)
    const newVetoes = [...optionVetoes, option.name]
    setOptionVetoes(newVetoes)
    setSwapsRemaining(s => s - 1)
    try {
      const res = await fetch('/api/swap-option', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure, currentOptions: wheelOptions, vetoedOption: option, allVetoes: newVetoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Swap failed')
      trackSeen([data.option.name])
      // Keep the slot's original (unique) id so swapped-in cards never collide on id
      setWheelOptions(prev => prev.map(o => o.id === option.id ? { ...data.option, id: option.id } : o))
      // Clear all UI state for this slot — replacement card always starts fresh
      setFlaggedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      setHeartedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      setPinnedOptions(prev => { const next = new Set(prev); next.delete(option.id); return next })
      // Re-check playground: only pre-fill saved state if new card genuinely matches
      if (typeof window !== 'undefined') {
        try {
          const saves = JSON.parse(localStorage.getItem('softplay_playground') || '[]')
          const pinNames = new Set(saves.filter((s: any) => s.type === 'pin').map((s: any) => s.title))
          const heartNames = new Set(saves.filter((s: any) => s.type === 'heart').map((s: any) => s.title))
          if (pinNames.has(data.option.name)) setPinnedOptions(prev => new Set([...prev, option.id]))
          if (heartNames.has(data.option.name)) setHeartedOptions(prev => new Set([...prev, option.id]))
        } catch { /* ignore */ }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Swap failed. Try again.')
      setSwapsRemaining(s => s + 1)
    } finally {
      setSwappingOptionId(null)
    }
  }

  const generateOptions = async () => {
    setStep('generating')
    setError(null)
    let qi = 0
    const timer = setInterval(() => { qi = (qi + 1) % LOADING_QUIPS.length; setQuipIndex(qi) }, 2200)
    try {
      const res = await fetch('/api/generate-options', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure }),
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Server returned: ${text.substring(0, 300)}`)
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setWheelOptions(data.options)
      setSwapsRemaining(2)
      setOptionVetoes([])

      // Smart Playground detection: check if any generated options match Playground saves (pins or hearts)
      if (typeof window !== 'undefined') {
        const playgroundData = localStorage.getItem('softplay_playground')
        if (playgroundData) {
          try {
            const saves = JSON.parse(playgroundData)
            const pinNames = new Set(saves.filter((s: any) => s.type === 'pin').map((s: any) => s.title))
            const heartNames = new Set(saves.filter((s: any) => s.type === 'heart').map((s: any) => s.title))

            const matchedPins = new Set<string>(data.options.filter((opt: any) => pinNames.has(opt.name)).map((opt: any) => opt.id))
            const matchedHearts = new Set<string>(data.options.filter((opt: any) => heartNames.has(opt.name)).map((opt: any) => opt.id))

            if (matchedPins.size > 0) {
              setPinnedOptions(matchedPins)
            }
            if (matchedHearts.size > 0) {
              setHeartedOptions(matchedHearts)
            }
          } catch (e) {
            console.error('Error checking Playground saves:', e)
          }
        }
      }

      // Load family favorite heart for this city
      if (typeof window !== 'undefined') {
        const playgroundData = localStorage.getItem('softplay_playground')
        if (playgroundData) {
          try {
            const saves = JSON.parse(playgroundData)
            const hearts = saves.filter((s: any) => s.type === 'heart' && s.city.toLowerCase() === playStructure.city.toLowerCase())
            // Wildcard: Always show if hearts exist (v1.0 — no randomness yet. Re-add Math.random() < 0.4 in v1.5+ for surprise bonus)
            if (hearts.length > 0) {
              // Fuzzy compare so "Arnold Arboretum" isn't offered as a wildcard when
              // "Arnold Arboretum of Harvard University" is already on the wheel
              const wildcardCandidates = hearts.filter((h: any) => !wheelOptions.some(o => sameStop(o.name, h.title)))
              if (wildcardCandidates.length > 0) {
                // Pick most recently hearted
                const wildcardHeart = wildcardCandidates[0]
                setFamilyFaveHeart(wildcardHeart)
              } else {
                setFamilyFaveHeart(null)
              }
            } else {
              setFamilyFaveHeart(null)
            }
          } catch (e) {
            console.error('Error loading family favorite:', e)
            setFamilyFaveHeart(null)
          }
        } else {
          setFamilyFaveHeart(null)
        }
      }

      setStep('options')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setStep('play-structure')
    } finally { clearInterval(timer) }
  }

  const handleSpinComplete = async (winnerId: string) => {
    const winner = wheelOptions.find(o => o.id === winnerId)
    if (!winner) return
    setChosenOption(winner)
    setStep('loading-plan')
    try {
      const res = await fetch('/api/play-by-play', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbill, playStructure, chosenOption: winner }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setWinnerStop(data.stop)
      // Don't auto-load food — let user choose via "Play On"
      // if (data.foodStop) {
      //   setInitialFoodStop(data.foodStop)
      //   setVetoes(prev => [...prev, data.foodStop.name])
      // }
      setStep('play-by-play')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong generating the plan.')
      setStep('wheel')
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step)
  const progress = Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100)

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .finalist-chips {
            grid-template-columns: 1fr 1fr;
          }
          .finalist-chip {
            flex: 1;
          }
        }
      `}</style>
      <div style={{ ...S.screen, background: (step === 'welcome' || step === 'crew') ? 'linear-gradient(180deg, #F5C842 0%, #FEF9E8 100%)' : 'transparent' }}>
      <header style={S.header}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          softplay
        </Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090' }}>Playbook</span>
      </header>

      {step !== 'welcome' && (
        <div style={{ height: 3, background: '#E8DCC8' }}>
          <div style={{ height: '100%', background: '#F2C94C', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
      )}

      <main style={S.main}>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FFF0EC', border: '1px solid #E07055', borderRadius: 16, color: '#B85040', fontFamily: 'var(--font-body)', fontSize: 14, width: '100%' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="fade-up" style={{ textAlign: 'center', width: '100%' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#1C1917', textDecoration: 'none', display: 'block', marginBottom: 16, textAlign: 'left' }}>← Back</Link>
            <div style={{ marginBottom: 24 }}><PinwheelIcon size={56} /></div>
            <h1 style={{ ...S.h1, fontSize: 28, marginBottom: 16 }}>Ready to plan your day?</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#5C4E3D', lineHeight: 1.65, marginBottom: 16 }}>
              Every production starts with a cast and crew.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#5C4E3D', lineHeight: 1.65, marginBottom: 28 }}>
              Your Playbill will remember who you are and what you like so you never have to start from scratch.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setStep('crew')} style={S.btnPrimary}>
                Build my Playbill
              </button>
            </div>
          </div>
        )}

        {/* ── CREW ── */}
        {step === 'crew' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <button onClick={() => setStep('welcome')} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#1C1917', cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 2px 12px rgba(28,25,23,0.08)', margin: '0 auto 8px' }}>🎭</div>
              <h1 style={S.h1}>Cast Members</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6, lineHeight: 1.6 }}>
                The regulars. You can change the cast and crew for future productions.
              </p>
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>Adults</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={() => setPlaybill(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5EFE0', border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#1C1917' }}>−</button>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', minWidth: 24, textAlign: 'center' }}>{playbill.adults}</span>
                  <button onClick={() => setPlaybill(p => ({ ...p, adults: p.adults + 1 }))}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: '#F2C94C', border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#1C1917' }}>+</button>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: playbill.kids.length > 0 ? 16 : 0 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>Kids</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={removeKid} disabled={playbill.kids.length === 0}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5EFE0', border: 'none', fontSize: 20, cursor: playbill.kids.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, color: '#1C1917', opacity: playbill.kids.length === 0 ? 0.3 : 1 }}>−</button>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#1C1917', minWidth: 24, textAlign: 'center' }}>{playbill.kids.length}</span>
                  <button onClick={addKid}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: '#F2C94C', border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#1C1917' }}>+</button>
                </div>
              </div>
              {playbill.kids.map((kid, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D' }}>Kid {i + 1}</span>
                  <select value={kid.age} onChange={e => updateKidAge(i, Number(e.target.value))}
                    style={{ border: '1.5px solid #E8DCC8', borderRadius: 12, padding: '8px 12px', fontSize: 14, color: '#1C1917', background: '#FEFBF3', fontFamily: 'var(--font-body)' }}>
                    <option value="1">&lt; 2 years old</option>
                    {Array.from({ length: 16 }, (_, j) => j + 2).map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('fun-chips')} style={S.btnPrimary}>Next →</button>
            {playbillIsSaved && (
              <button onClick={() => {
                setPlayStructure(p => ({ ...p, sessionAdults: playbill.adults, sessionKids: playbill.kids }))
                setStep('play-structure')
              }} style={{ ...S.btnSkip, marginTop: 10 }}>
                Playbill saved — skip to today's plan →
              </button>
            )}
          </div>
        )}

        {/* ── FUN CHIPS ── */}
        {step === 'fun-chips' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
              <h1 style={S.h1}>What sounds like a good day?</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6 }}>
                Pick as many as you like.
              </p>
            </div>

            <ChipGrid chips={FUN_CHIPS} selected={playbill.funChips} onToggle={toggleFun} />

            <div style={{ marginTop: 20 }}>
              <label style={{ ...S.label, fontSize: 13, color: '#8C7B6B', fontWeight: 600 }}>
                Anything else to add?
              </label>
              <textarea
                value={playbill.funNote}
                onChange={e => setPlaybill(p => ({ ...p, funNote: e.target.value }))}
                placeholder="e.g. We love anything near water. The kids go wild for anything with animals. Sunday markets are a favourite."
                style={{ ...S.textarea, height: 90 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep('crew')} style={{ ...S.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => setStep('not-fun-chips')} style={{ ...S.btnPrimary, flex: 2 }}>Next →</button>
            </div>
            <SkipButton onClick={() => setStep('not-fun-chips')} />
          </div>
        )}

        {/* ── NOT FUN CHIPS ── */}
        {step === 'not-fun-chips' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🚫</div>
              <h1 style={S.h1}>What&apos;s a hard no?</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6 }}>
                Tap anything to rule it out.
              </p>
            </div>

            <ChipGrid chips={NOT_FUN_CHIPS} selected={playbill.notFunChips} onToggle={toggleNotFun} />

            <div style={{ marginTop: 20 }}>
              <label style={{ ...S.label, fontSize: 13, color: '#8C7B6B', fontWeight: 600 }}>
                Anything else to avoid?
              </label>
              <textarea
                value={playbill.notFunNote}
                onChange={e => setPlaybill(p => ({ ...p, notFunNote: e.target.value }))}
                placeholder="e.g. Anything too passive or curated. The 13-year-old finds anything 'educational' deeply embarrassing."
                style={{ ...S.textarea, height: 90 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep('fun-chips')} style={{ ...S.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => setStep('food')} style={{ ...S.btnPrimary, flex: 2 }}>Next →</button>
            </div>
            <SkipButton onClick={() => setStep('food')} />
          </div>
        )}

        {/* ── FOOD ── */}
        {step === 'food' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
              <h1 style={S.h1}>Food — loves and avoids.</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6, lineHeight: 1.6 }}>
                What&apos;s always a yes? We&apos;ll make sure the food stop is worth it.
              </p>
            </div>

            <label style={{ ...S.label, marginBottom: 10 }}>We never pass up</label>
            <ChipGrid chips={FOOD_LOVE_CHIPS} selected={playbill.foodLoveChips} onToggle={toggleFoodLove} />

            <label style={{ ...S.label, marginTop: 20, marginBottom: 10 }}>Rarely or never</label>
            <ChipGrid chips={FOOD_AVOID_CHIPS} selected={playbill.foodAvoidChips} onToggle={toggleFoodAvoid} />

            <div style={{ marginTop: 20 }}>
              <label style={{ ...S.label, fontSize: 13, color: '#8C7B6B', fontWeight: 600 }}>
                Allergies, things to seek out, or anything else?
              </label>
              <textarea
                value={playbill.foodNote}
                onChange={e => setPlaybill(p => ({ ...p, foodNote: e.target.value }))}
                placeholder="e.g. Anything with a good brunch menu. We seek out local coffee roasters. One of us is vegetarian."
                style={{ ...S.textarea, height: 90 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep('not-fun-chips')} style={{ ...S.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => setStep('great-day')} style={{ ...S.btnPrimary, flex: 2 }}>Next →</button>
            </div>
            <SkipButton onClick={() => setStep('great-day')} />
          </div>
        )}

        {/* ── GREAT DAY ── */}
        {step === 'great-day' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
              <h1 style={S.h1}>Picture a perfect day out.</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6 }}>
                Real or made up. A story, a list, or just a few words — whatever comes naturally.
              </p>
            </div>
            <textarea value={playbill.greatDay} onChange={e => setPlaybill(p => ({ ...p, greatDay: e.target.value }))}
              placeholder="e.g. Somewhere outdoors, not too structured. The kids can run around. A good place to eat nearby. Everyone home before meltdown."
              style={S.textarea} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => setStep('not-fun-chips')} style={{ ...S.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => setStep('practical')} style={{ ...S.btnPrimary, flex: 2 }}>Next →</button>
            </div>
            <SkipButton onClick={() => setStep('practical')} />
          </div>
        )}

        {/* ── PRACTICAL ── */}
        {step === 'practical' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏡</div>
              <h1 style={S.h1}>Home base.</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6 }}>
                Where are you based, and where do you often end up?
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ ...S.label, fontSize: 13, color: '#8C7B6B', fontWeight: 600 }}>Home city</label>
              <input
                value={playbill.cityAndPractical.split('|')[0] || ''}
                onChange={e => setPlaybill(p => ({ ...p, cityAndPractical: e.target.value + '|' + (p.cityAndPractical.split('|')[1] || '') }))}
                placeholder="e.g. London, Austin, Cape Town…"
                style={S.input}
              />
            </div>

<div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => setStep('great-day')} style={{ ...S.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => {
                setPlayStructure(p => ({ ...p, sessionAdults: playbill.adults, sessionKids: playbill.kids }))
                setStep('play-structure')
              }} style={{ ...S.btnPrimary, flex: 2 }}>Build my Playbill →</button>
            </div>
            <SkipButton onClick={() => setStep('play-structure')} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B0A090', textAlign: 'center', marginTop: 6 }}>
              You can always come back and revise your Playbill later.
            </p>
          </div>
        )}

        {/* ── PLAY STRUCTURE ── */}
        {step === 'play-structure' && (
          <div className="fade-up" style={{ width: '100%' }}>
            <button onClick={() => setStep('practical')} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#1C1917', cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
              <h1 style={S.h1}>Now, today&apos;s plan.</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', marginTop: 6 }}>This changes every session — tell me about today.</p>
            </div>

            {/* City */}
            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Where are you starting from?</label>
              <input value={playStructure.city} onChange={e => setPlayStructure(p => ({ ...p, city: e.target.value }))}
                placeholder="e.g. Paris, Tokyo, San Francisco…" style={S.input} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>What&apos;s the mood?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MOOD_OPTIONS.map(m => (
                  <button key={m.value} onClick={() => setPlayStructure(p => ({ ...p, mood: m.value as PlayStructureData['mood'] }))}
                    style={{ borderRadius: 16, padding: '13px 10px', textAlign: 'left', border: `1.5px solid ${playStructure.mood === m.value ? '#F2C94C' : '#E8DCC8'}`, background: playStructure.mood === m.value ? '#FEF9E7' : '#FFFFFF', cursor: 'pointer' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: '#1C1917' }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>How long?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DURATION_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => setPlayStructure(p => ({ ...p, duration: d.value as PlayStructureData['duration'] }))}
                    style={{ flex: 1, borderRadius: 16, padding: '12px 6px', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, border: `1.5px solid ${playStructure.duration === d.value ? '#F2C94C' : '#E8DCC8'}`, background: playStructure.duration === d.value ? '#FEF9E7' : '#FFFFFF', color: '#1C1917', cursor: 'pointer' }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Getting around</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TRANSPORT_OPTIONS.map(t => (
                  <button key={t} onClick={() => toggleTransport(t)}
                    style={{ borderRadius: 30, padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: `1.5px solid ${playStructure.transport.includes(t) ? '#F2C94C' : '#E8DCC8'}`, background: playStructure.transport.includes(t) ? '#F2C94C' : '#FFFFFF', color: '#1C1917', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Travel radius</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {RADIUS_OPTIONS.map(r => (
                  <button key={r.value} onClick={() => setPlayStructure(p => ({ ...p, radius: r.value as PlayStructureData['radius'] }))}
                    style={{ borderRadius: 16, padding: '12px', textAlign: 'left', border: `1.5px solid ${playStructure.radius === r.value ? '#F2C94C' : '#E8DCC8'}`, background: playStructure.radius === r.value ? '#FEF9E7' : '#FFFFFF', cursor: 'pointer' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: '#1C1917' }}>{r.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#8C7B6B' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>
                Screenplay{' '}
                <span style={{ fontWeight: 400, color: '#B0A090', fontFamily: 'var(--font-body)' }}>(optional)</span>
              </label>
              <input value={playStructure.screenplay} onChange={e => setPlayStructure(p => ({ ...p, screenplay: e.target.value }))}
                placeholder="e.g. Lord of the Rings, Moana, spooky mystery…" style={S.input} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B0A090', marginTop: 5 }}>
                A film, book, or mood — I&apos;ll find real-world tie-ins.
              </p>
            </div>

            {/* Today's crew with quick toggles */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginBottom: 10 }}>
                Today's crew: 👥 {playbill.adults} adult{playbill.adults !== 1 ? 's' : ''}{playbill.kids.length > 0 ? `, 👧👦 ${playbill.kids.length} kid${playbill.kids.length !== 1 ? 's' : ''} (ages ${playbill.kids.map(k => k.age).join(', ')})` : ''}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Just adults', 'Bigger crew', 'Smaller crew'].map(chip => (
                  <button key={chip} onClick={() => {
                    setPlayStructure(p => {
                      // Replace any existing crew chip with the new one
                      let notes = p.sessionNotes || ''
                      const crewChipRegex = /\[(Just adults|Bigger crew|Smaller crew)\]/g
                      const hasCrewChip = crewChipRegex.test(notes)

                      if (hasCrewChip) {
                        // Replace existing crew chip
                        notes = notes.replace(/\[(Just adults|Bigger crew|Smaller crew)\]/g, `[${chip}]`)
                      } else {
                        // Add new crew chip
                        notes = (notes ? notes + ' ' : '') + `[${chip}]`
                      }

                      return { ...p, sessionNotes: notes }
                    })
                  }}
                    style={{ background: '#F5EFE0', border: 'none', borderRadius: 12, padding: '6px 12px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#5C4E3D', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Anything else */}
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>
                Anything else?{' '}
                <span style={{ fontWeight: 400, color: '#B0A090', fontFamily: 'var(--font-body)' }}>(optional)</span>
              </label>
              <textarea
                value={playStructure.sessionNotes}
                onChange={e => setPlayStructure(p => ({ ...p, sessionNotes: e.target.value }))}
                placeholder="e.g. Keep it under $50 total. One kid is tired of museums. Would like to find a summer farmers market this Saturday."
                style={{ ...S.textarea, height: 80 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {[
                { key: 'lowerCarbon' as const, label: '🌱 Lower carbon', desc: 'Lower-impact activity choices' },
                { key: 'rainProof' as const, label: '🏠 Indoors',     desc: 'Indoor options only' },
              ].map(tog => {
                const active = playStructure[tog.key]
                return (
                  <button key={tog.key} onClick={() => setPlayStructure(p => ({ ...p, [tog.key]: !active }))}
                    title={tog.desc}
                    style={{ flex: 1, borderRadius: 16, padding: '11px 4px', fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, border: `1.5px solid ${active ? '#3D9E8F' : '#E8DCC8'}`, background: active ? '#EBF7F5' : '#FFFFFF', color: active ? '#3D9E8F' : '#8C7B6B', cursor: 'pointer', lineHeight: 1.3, textAlign: 'center' as const }}>
                    {tog.label}
                  </button>
                )
              })}
            </div>

            <button onClick={generateOptions} disabled={!playStructure.city}
              style={{ ...S.btnPrimary, opacity: playStructure.city ? 1 : 0.4, cursor: playStructure.city ? 'pointer' : 'not-allowed' }}>
              Find my options →
            </button>
            {!playStructure.city && (
              <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: '#B0A090', marginTop: 8 }}>Add a starting city to continue</p>
            )}
          </div>
        )}

        {/* ── GENERATING ── */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 20 }}><PinwheelIcon size={64} spinning /></div>
            <h2 style={{ ...S.h1, marginBottom: 12 }}>Finding your options…</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#8C7B6B', fontStyle: 'italic', minHeight: 28 }}>
              {LOADING_QUIPS[quipIndex]}
            </p>
          </div>
        )}

        {/* ── OPTIONS — review before spin ── */}
        {step === 'options' && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ ...S.h1, marginBottom: 6 }}>Your options are ready.</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B' }}>
                Not feeling one?{' '}
                <span style={{ color: swapsRemaining > 0 ? '#E07055' : '#B0A090', fontWeight: 600 }}>
                  {swapsRemaining > 0 ? `${swapsRemaining} swap${swapsRemaining === 1 ? '' : 's'} left` : 'No swaps left'}
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {wheelOptions.map(opt => (
                <div key={opt.id} style={{ ...S.card, marginBottom: 0, opacity: swappingOptionId === opt.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{opt.emoji}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>{opt.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', marginTop: 3, lineHeight: 1.5 }}>{opt.pitch}</div>
                    </div>
                  </div>
                  {/* Three actions */}
                  <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F5EFE0', paddingTop: 10, position: 'relative' }}>
                    {/* Save (Pin) button */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <button onClick={() => handleSaveToPlayground(opt)} disabled={!!swappingOptionId}
                        style={{ width: '100%', background: pinnedOptions.has(opt.id) ? '#3D9E8F' : '#E5EFE3', border: '1px solid #3D9E8F', borderRadius: 12, padding: '7px 4px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: pinnedOptions.has(opt.id) ? '#FFFFFF' : '#1C1917', cursor: 'pointer', transition: 'all 0.2s' }}>
                        📌 {pinnedOptions.has(opt.id) ? 'Saved' : 'Save for Later'}
                      </button>
                    </div>
                    {/* Heart button */}
                    <button onClick={() => handleHeartOption(opt)} disabled={!!swappingOptionId}
                      style={{ flex: 1, background: heartedOptions.has(opt.id) ? '#6E6560' : '#FFF0EC', border: '1px solid #6E6560', borderRadius: 12, padding: '7px 4px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: heartedOptions.has(opt.id) ? '#FFFFFF' : '#1C1917', cursor: 'pointer', transition: 'all 0.2s' }}>
                      ❤️ {heartedOptions.has(opt.id) ? 'Saved' : 'Family Fave'}
                    </button>
                    {/* Flag button */}
                    <button onClick={() => handleFlagOption(opt)} disabled={!!swappingOptionId}
                      style={{ flex: 1, background: flaggedOptions.has(opt.id) ? '#F5C842' : '#FEF3CC', border: '1px solid #C9963A', borderRadius: 12, padding: '7px 4px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: flaggedOptions.has(opt.id) ? '#C9963A' : '#1C1917', cursor: 'pointer', transition: 'all 0.2s' }}>
                      🚩 {flaggedOptions.has(opt.id) ? 'Flagged' : 'Flag'}
                    </button>
                    {/* Swap button */}
                    <button onClick={() => handleVetoOption(opt)} disabled={!!swappingOptionId || swapsRemaining <= 0}
                      style={{ flex: 1, background: swapsRemaining > 0 ? '#FFF0EC' : '#F5EFE0', border: `1px solid ${swapsRemaining > 0 ? '#E07055' : '#C9BEB0'}`, borderRadius: 12, padding: '7px 4px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: swapsRemaining > 0 ? '#E07055' : '#B0A090', cursor: swapsRemaining > 0 && !swappingOptionId ? 'pointer' : 'not-allowed' }}>
                      {swappingOptionId === opt.id ? '…' : `✕ Swap${swapsRemaining < 2 ? ` (${swapsRemaining})` : ''}`}
                    </button>

                    {/* Flag popup */}
                    {flagPopupOption?.id === opt.id && (
                      <div style={{ position: 'absolute', bottom: 40, left: 0, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 8px 24px rgba(28,25,23,0.15)', padding: '8px 0', zIndex: 10, minWidth: 200 }}>
                        {[
                          { icon: '🔒', label: 'Permanently closed' },
                          { icon: '📅', label: 'Not today' },
                          { icon: '🚫', label: 'Bad suggestion' },
                        ].map(({ icon, label }) => (
                          <button key={label} onClick={() => handleFlagReason(opt, label)}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#1C1917' }}>
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8C7B6B', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
              📌 ❤️ Saved cards go to your Playground. You won&apos;t lose them even if the wheel picks something else.
            </p>
            <button
              onClick={() => setStep(familyFaveHeart ? 'family-fave-swap' : 'countdown')}
              disabled={!!swappingOptionId}
              style={{ ...S.btnPrimary, opacity: swappingOptionId ? 0.4 : 1 }}
            >
              Lock in my options →
            </button>
          </div>
        )}

        {/* ── WILDCARD REVEAL ── */}
        {step === 'family-fave-swap' && familyFaveHeart && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-block', background: '#FAEAEC', color: '#C4686F', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', padding: '6px 14px', borderRadius: 20, marginBottom: 16 }}>
                🃏 WILD CARD PLAY
              </div>
            </div>

            {/* Wildcard card */}
            <div style={{ background: '#FAEAEC', borderRadius: 14, border: '2px solid #E8A0A8', padding: '16px 14px', marginBottom: 28 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{familyFaveHeart.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#1C1917', marginBottom: 4 }}>{familyFaveHeart.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', lineHeight: 1.5 }}>{familyFaveHeart.pitch}</div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 300, fontStyle: 'italic', color: '#8C7B6B', margin: 0 }}>Play to swap in a card. Pass to keep your four.</p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setStep('wildcard-swap')}
                style={{ width: '100%', background: '#E07055', color: '#FFFFFF', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '14px 20px', borderRadius: 26, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(224,112,85,0.35)' }}
              >
                🃏 Play it →
              </button>
              <button
                onClick={() => {
                  setFamilyFaveHeart(null)
                  setStep('countdown')
                }}
                style={{ width: '100%', background: 'none', color: '#8C7B6B', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, padding: '10px 20px', border: 'none', cursor: 'pointer' }}
              >
                Pass
              </button>
            </div>
          </div>
        )}

        {/* ── WILDCARD SWAP ── */}
        {step === 'wildcard-swap' && familyFaveHeart && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0, marginBottom: 8 }}>Which card does it replace?</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', margin: 0 }}>Tap the one to swap out</p>
            </div>

            {/* Incoming wildcard */}
            <div style={{ background: '#FAEAEC', borderRadius: 14, border: '2px solid #E8A0A8', padding: '14px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{familyFaveHeart.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: '#1C1917' }}>{familyFaveHeart.title}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#C4686F', fontWeight: 700, letterSpacing: '0.3px' }}>🃏 WILD CARD</div>
            </div>

            {/* Swap symbol */}
            <div style={{ textAlign: 'center', margin: '16px 0', fontFamily: 'var(--font-body)', fontSize: 18 }}>↕</div>

            {/* Your 4 options in 2x2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {wheelOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setWheelOptions(prev => prev.map(o => o.id === opt.id ? { ...familyFaveHeart, id: opt.id, name: familyFaveHeart.title, isWildcard: true } : o))
                    setWildcardInWheel(true)
                    setFamilyFaveHeart(null)
                    setStep('countdown')
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, position: 'relative' }}
                >
                  <div style={{ ...S.card, marginBottom: 0 }}>
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#FFF0EC', color: '#E07055', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      ✕
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: '#1C1917', wordBreak: 'break-word' }}>{opt.name}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#8C7B6B', marginTop: 2, lineHeight: 1.3 }}>{opt.pitch}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setFamilyFaveHeart(null)
                setStep('countdown')
              }}
              style={{ ...S.btnSecondary, width: '100%' }}
            >
              Send back to Playground
            </button>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {step === 'countdown' && (
          <CountdownScreen
            lines={COUNTDOWN_LINES}
            visible={countdownVisible}
            onVisibleChange={setCountdownVisible}
            onPlayBall={() => { setCountdownVisible(0); setStep('wheel') }}
          />
        )}

        {/* ── WHEEL ── */}
        {step === 'wheel' && (
          <div style={{ width: '100%' }}>
            {/* Yellow gradient hero header */}
            <div style={{ background: 'linear-gradient(180deg, #F5C842 0%, #F0BC2E 100%)', padding: '24px 20px', borderRadius: '0 0 24px 24px', marginBottom: 24, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, color: '#1C1917', margin: '0 0 4px', lineHeight: 1.1 }}>
                Fate decides.
              </h2>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 300, fontStyle: 'italic', color: 'rgba(28,25,23,0.5)', margin: 0 }}>
                No take-backs.
              </p>
            </div>

            {/* Finalist chips grid - exact wheel colors */}
            <div className="finalist-chips" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 24, padding: '0 20px' }}>
              {wheelOptions.map((opt, idx) => {
                // Exact wheel segment colors
                const colours = [
                  { bg: '#F5C842', text: '#F5C842' },      // yellow
                  { bg: '#3D9E8F', text: '#3D9E8F' },      // teal
                  { bg: '#E07055', text: '#E07055' },      // coral
                  { bg: '#8FB88A', text: '#8FB88A' },      // sage
                ]
                const colour = colours[idx % 4]
                return (
                  <div key={opt.id} className="finalist-chip" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: colour.bg, borderRadius: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 12, flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF', opacity: 0.4 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF' }}>{opt.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {opt.name}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Wheel container with bezel */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <Wheel options={wheelOptions} onSpinComplete={handleSpinComplete} wildcardInWheel={wildcardInWheel} />
            </div>
          </div>
        )}

        {/* ── LOADING PLAN ── */}
        {step === 'loading-plan' && (
          <div style={{ textAlign: 'center' }}>
            {/* Winner highlight */}
            <div style={{ background: '#F5EFE0', borderRadius: 24, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>{chosenOption?.emoji}</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: '#1C1917', margin: 0 }}>
                {chosenOption?.name}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#5C4E3D', marginTop: 8, fontStyle: 'italic' }}>
                {chosenOption?.pitch}
              </p>
            </div>

            {/* Loading indicator */}
            <div style={{ marginBottom: 20 }}><PinwheelIcon size={48} spinning /></div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>Building your day…</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#B0A090', fontStyle: 'italic' }}>
              Finding the best stops, timings, and a good food spot…
            </p>
          </div>
        )}

        {/* ── PLAY BY PLAY ── */}
        {step === 'play-by-play' && winnerStop && chosenOption && (
          <div style={{ width: '100%' }}>
            <PlayByPlayView
              winnerStop={winnerStop}
              chosenOption={chosenOption}
              playbill={playbill}
              playStructure={playStructure}
              vetoes={vetoes}
              initialHalfTime={initialFoodStop}
              onReplay={() => setStep('replay')}
              onCopyPlan={() => {
                setCopyFeedback(true)
                setTimeout(() => setCopyFeedback(false), 2000)
              }}
              showCopyFeedback={copyFeedback}
              onPlanAnotherDay={() => setShowResetConfirm(true)}
            />

            {/* Reset confirmation dialog */}
            {showResetConfirm && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 24, maxWidth: 320, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#1C1917', margin: '0 0 8px' }}>Start over?</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', margin: '0 0 20px', lineHeight: 1.5 }}>
                    This will take you back to the home page and reset your plan.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowResetConfirm(false)}
                      style={{ flex: 1, ...S.btnSecondary }}>
                      Cancel
                    </button>
                    <button onClick={() => { setStep('welcome'); setWheelOptions([]); setChosenOption(null); setWinnerStop(null); setInitialFoodStop(undefined); setVetoes([]); setOptionVetoes([]); setSwapsRemaining(2); setCountdownVisible(0); setShowResetConfirm(false); setFamilyFaveHeart(null); }}
                      style={{ flex: 1, ...S.btnPrimary }}>
                      Start over
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REPLAY ── */}
        {step === 'replay' && (
          <div className="fade-up" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
            <h2 style={{ ...S.h1, marginBottom: 6 }}>Play it again, Sam?</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#8C7B6B', marginBottom: 28 }}>How&apos;d it go? One tap is enough.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {[
                { value: 'loved', label: '❤️', desc: 'Loved it' },
                { value: 'ok',    label: '👍', desc: 'Pretty good' },
                { value: 'pass',  label: '👎', desc: 'Pass' },
              ].map(r => (
                <button key={r.value} onClick={() => setReplayRating(r.value as 'loved' | 'ok' | 'pass')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 20px', borderRadius: 20, border: `1.5px solid ${replayRating === r.value ? '#F2C94C' : '#E8DCC8'}`, background: replayRating === r.value ? '#FEF9E7' : '#FFFFFF', cursor: 'pointer' }}>
                  <span style={{ fontSize: 34 }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#5C4E3D' }}>{r.desc}</span>
                </button>
              ))}
            </div>
            <textarea value={replayNote} onChange={e => setReplayNote(e.target.value)}
              placeholder="Any notes? (optional)"
              style={{ ...S.textarea, height: 90, marginBottom: 16 }} />
            <Link href="/" style={{ display: 'block', width: '100%', background: '#F2C94C', color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, padding: '15px', borderRadius: 26, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', boxShadow: '0 4px 18px rgba(242,201,76,0.4)' }}>
              Done — back to home
            </Link>
            <button onClick={() => { setStep('welcome'); setWheelOptions([]); setChosenOption(null); setWinnerStop(null); setInitialFoodStop(undefined); setVetoes([]); setOptionVetoes([]); setSwapsRemaining(2); setReplayRating(null); setReplayNote(''); setPlaybill({ skipped: false, adults: 2, kids: [], funChips: [], funNote: '', notFunChips: [], notFunNote: '', foodLoveChips: [], foodAvoidChips: [], foodNote: '', greatDay: '', cityAndPractical: '' }); setFamilyFaveHeart(null); }}
              style={{ ...S.btnSkip, marginTop: 10, background: 'none', color: '#B0A090' }}>
              Plan another day
            </button>
          </div>
        )}

      </main>

      {/* Heart toast notification */}
      {heartToast && (
        <div style={{ position: 'fixed', bottom: 24, left: 24, right: 24, background: '#FFFFFF', borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#1C1917', boxShadow: '0 8px 24px rgba(28,25,23,0.15)', zIndex: 1000, animation: 'slideUp 0.3s ease' }}>
          ❤️ Added to Family Favourites
        </div>
      )}
    </div>
    </>
  )
}
