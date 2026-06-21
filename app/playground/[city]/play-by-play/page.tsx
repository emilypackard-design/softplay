'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import PlayByPlayView from '@/components/PlayByPlayView'
import PinwheelIcon from '@/components/PinwheelIcon'
import type { PlaygroundSave, Stop, WheelOption, PlaybillData, PlayStructureData } from '@/types'

export default function PlaygroundPlayByPlayPage() {
  const router = useRouter()
  const params = useParams()
  const city = params?.city ? decodeURIComponent(params.city as string) : null

  const [card, setCard] = useState<PlaygroundSave | null>(null)
  const [playbill, setPlaybill] = useState<PlaybillData | null>(null)
  const [winnerStop, setWinnerStop] = useState<Stop | null>(null)
  const [halfTime, setHalfTime] = useState<Stop | null>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)

  useEffect(() => {
    // Get card from sessionStorage
    const stored = sessionStorage.getItem('playgroundCard')
    if (!stored) {
      setError('No card selected')
      setMounted(true)
      return
    }

    const playgroundCard: PlaygroundSave = JSON.parse(stored)
    setCard(playgroundCard)

    // Try to load playbill from localStorage (from previous Playbook session)
    const savedPlaybill = localStorage.getItem('lastPlaybill')
    const playbillData: PlaybillData = savedPlaybill
      ? JSON.parse(savedPlaybill)
      : {
          skipped: false,
          adults: 2,
          kids: [],
          funChips: [],
          funNote: '',
          notFunChips: [],
          notFunNote: '',
          foodLoveChips: [],
          foodAvoidChips: [],
          foodNote: '',
          greatDay: '',
          cityAndPractical: playgroundCard.city,
        }
    setPlaybill(playbillData)

    // Default play structure
    const playStructure: PlayStructureData = {
      city: playgroundCard.city,
      sessionAdults: playbillData.adults,
      sessionKids: playbillData.kids,
      mood: 'middle-ground',
      duration: 'half-day',
      transport: [],
      radius: 'local',
      lowerCarbon: false,
      rainProof: false,
      screenplay: '',
      sessionNotes: '',
    }

    // Regenerate fresh, date-aware detail for TODAY: strips stale date framing from the
    // saved pitch, fills in real address/hours, and adds a seasonal heads-up when the
    // saved activity doesn't suit the current date. Mirrors the Playbook "Play On"
    // experience so both pathways feel identical. (Food is still chosen via "Play On".)
    const fallbackStop: Stop = {
      id: playgroundCard.id,
      name: playgroundCard.title,
      emoji: playgroundCard.emoji,
      address: '',
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(playgroundCard.title + ' ' + playgroundCard.city)}`,
      hours: '',
      price: '',
      tip: playgroundCard.pitch,
      props: '',
      isHalfTime: false,
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/playground-itinerary', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: playgroundCard.title, city: playgroundCard.city, pitch: playgroundCard.pitch }),
        })
        const data = await res.json()
        if (!res.ok || !data.stop) throw new Error(data.error || 'No detail returned')
        // Keep the saved card's own id + emoji; take the regenerated practical detail
        if (!cancelled) setWinnerStop({ ...data.stop, id: playgroundCard.id, emoji: playgroundCard.emoji, isHalfTime: false })
      } catch {
        // Graceful fallback: show the saved pitch (stale framing and all) rather than nothing
        if (!cancelled) setWinnerStop(fallbackStop)
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()

    return () => { cancelled = true }
  }, [])

  if (!city) return <div>No city found</div>

  if (!mounted || !card || !winnerStop || !playbill) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FEFBF3', padding: '20px' }}>
        <div style={{ marginBottom: 20 }}><PinwheelIcon size={48} spinning /></div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#1C1917', margin: '0 0 8px', textAlign: 'center' }}>Building your day…</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#8C7B6B', textAlign: 'center', maxWidth: 300 }}>
          {card?.title || 'Setting up your itinerary'}
        </p>
      </div>
    )
  }

  const playStructure: PlayStructureData = {
    city: card.city,
    // No Playbill is filled in via the Playground path, so don't show crew chips.
    // (Passing 0 / empty keeps the crew summary hidden in PlayByPlayView.)
    sessionAdults: 0,
    sessionKids: [],
    mood: 'middle-ground',
    duration: 'half-day',
    transport: [],
    radius: 'local',
    lowerCarbon: false,
    rainProof: false,
    screenplay: '',
    sessionNotes: '',
  }

  const chosenOption: WheelOption = {
    id: card.id,
    name: card.title,
    emoji: card.emoji,
    pitch: card.pitch,
  }

  const handleReplay = () => {
    router.back()
  }

  const handleCopyPlan = () => {
    setShowCopyFeedback(true)
    setTimeout(() => setShowCopyFeedback(false), 2000)
  }

  const handlePlanAnotherDay = () => {
    // Go Home (fresh start) — the top "← Back to Playground" already covers returning to saves.
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', width: '100%', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3', boxSizing: 'border-box' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' }}>softplay</Link>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' }}>Playground</span>
      </header>
      <div style={{ borderBottom: '1px solid #E8DCC8', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: '#3D9E8F', cursor: 'pointer', padding: 0 }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <PlayByPlayView
          winnerStop={winnerStop}
          chosenOption={chosenOption}
          playbill={playbill}
          playStructure={playStructure}
          vetoes={[]}
          initialHalfTime={halfTime || undefined}
          onReplay={handleReplay}
          onCopyPlan={handleCopyPlan}
          showCopyFeedback={showCopyFeedback}
          onPlanAnotherDay={handlePlanAnotherDay}
        />
      </div>
    </div>
  )
}
