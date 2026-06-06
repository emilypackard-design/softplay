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

    // Create winner/main stop from the playground card
    // Leave address/hours/price blank when unknown (don't show "Check website" placeholders)
    const mainStop: Stop = {
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
    setWinnerStop(mainStop)

    // Don't auto-generate food — let user choose via "Play On"
    setMounted(true)
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
    router.push('/playground')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFBF3', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8DCC8', background: '#FFFFFF' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 12, color: '#3D9E8F', textDecoration: 'underline', cursor: 'pointer', marginBottom: 8, padding: 0 }}
        >
          ← Back to Playground
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px', maxWidth: 480, margin: '0 auto', width: '100%', overflowY: 'auto' }}>
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
