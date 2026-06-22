'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PinwheelIcon from '@/components/PinwheelIcon'
import type { PlaygroundSave } from '@/types'
import { canonicalCityMap } from '@/lib/cityGroups'

const PLAYGROUND_KEY = 'softplay_playground'

interface CityGroup {
  city: string
  saves: PlaygroundSave[]
  hearts: PlaygroundSave[]
  pins: PlaygroundSave[]
}

export default function PlaygroundPage() {
  const [cities, setCities] = useState<CityGroup[]>([])
  const [totalSaves, setTotalSaves] = useState(0)
  const [homeCity, setHomeCity] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load on mount
    const data = typeof window !== 'undefined' ? localStorage.getItem(PLAYGROUND_KEY) : null
    const saves: PlaygroundSave[] = data ? JSON.parse(data) : []

    // Group by city, folding prefix-variants together (e.g. "Greystones Ireland" → "Greystones")
    const canonMap = canonicalCityMap(saves.map(s => s.city))
    const grouped = new Map<string, { original: string; saves: PlaygroundSave[] }>()
    saves.forEach(save => {
      const canon = canonMap[save.city] ?? save.city
      const key = canon.toLowerCase()
      if (!grouped.has(key)) grouped.set(key, { original: canon, saves: [] })
      grouped.get(key)!.saves.push(save)
    })

    // Sort cities: home first, then by count descending
    const cityGroups = Array.from(grouped.entries())
      .map(([_, group]) => ({
        city: group.original,
        saves: group.saves,
        hearts: group.saves.filter(s => s.type === 'heart'),
        pins: group.saves.filter(s => s.type === 'pin'),
      }))
      .sort((a, b) => {
        if (a.city.toLowerCase() === homeCity?.toLowerCase()) return -1
        if (b.city.toLowerCase() === homeCity?.toLowerCase()) return 1
        return b.saves.length - a.saves.length
      })

    setCities(cityGroups)
    setTotalSaves(saves.length)
    setMounted(true)
  }, [homeCity])

  if (!mounted) return null

  const S = {
    // Match city view: one continuous emerald #1C7E46 gradient → cream by ~240px, then stays cream.
    screen: { minHeight: '100vh', backgroundImage: 'linear-gradient(180deg, #1C7E46 0%, #4F9D6C 22%, #84BD93 45%, #B9D9C0 66%, #E4F1E5 85%, #FEFBF3 100%)', backgroundRepeat: 'no-repeat', backgroundSize: '100% 420px', backgroundColor: '#FEFBF3', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const },
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', width: '100%', borderBottom: '1px solid #E8DCC8', background: '#FEFBF3' },
    wordmark: { fontFamily: 'var(--font-wordmark)', fontSize: 24, fontWeight: 300, fontStyle: 'italic' as const, color: '#5A4F48', textDecoration: 'none', letterSpacing: '-0.5px' },
    pathwayLabel: { fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#B0A090' },
    header: { padding: '20px 24px 36px', textAlign: 'center' as const, position: 'relative' as const, width: '100%', maxWidth: 480 },
    backBtn: { position: 'absolute' as const, left: 16, top: 16, background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', cursor: 'pointer', textDecoration: 'none' },
    daisy: { display: 'block', margin: '0 auto 12px', width: 72, height: 72 },
    title: { fontFamily: 'var(--font-wordmark)', fontSize: 32, fontWeight: 700, color: '#1C1917', margin: '0 0 11px', letterSpacing: '-0.5px' },
    divider: { width: 48, height: 1, background: 'rgba(28,25,23,0.2)', border: 'none', margin: '11px auto' },
    subtitle: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(28,25,23,0.6)', margin: 0 },
    saveCount: { position: 'absolute' as const, right: 16, top: 18, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.95)' },
    main: { padding: '14px 14px 24px', flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 10, background: 'transparent', width: '100%', maxWidth: 480 },
    cityRow: { background: '#FFFFFF', borderRadius: 18, padding: '14px 14px 12px', boxShadow: '0 3px 14px rgba(28,25,23,0.07)' },
    homeCity: { background: '#F8FFF6', border: '1.5px solid rgba(61,107,65,0.3)' },
    cityTop: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 },
    cityName: { fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: '#1C1917' },
    badge: { display: 'inline-block', background: '#D4E8D4', color: '#3D6B41', fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: 8, marginLeft: 0 },
    pills: { display: 'flex', gap: 7, marginBottom: 11 },
    pill: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 5, background: '#FEFBF3', border: '1px solid #EDE7D9', borderRadius: 16, padding: '6px 10px', overflow: 'hidden' as const },
    pillIcon: { fontSize: 12, flexShrink: 0 },
    pillName: { fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: '#1C1917', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' },
    heartPill: { background: '#FFF8F7', borderColor: 'rgba(224,112,85,0.15)' },
    seeAll: { fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#3D6B41', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
    empty: { textAlign: 'center' as const, padding: '60px 20px' },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontFamily: 'var(--font-wordmark)', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#1C1917', marginBottom: 12 },
    emptyText: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#8C7B6B', lineHeight: 1.6, marginBottom: 20 },
    emptyBtn: { display: 'inline-block', background: '#3D9E8F', color: '#FFFFFF', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, padding: '13px 24px', borderRadius: 22, textDecoration: 'none' },
  }

  return (
    <div style={S.screen}>
      <header style={S.topBar}>
        <Link href="/" style={S.wordmark}>softplay</Link>
        <span style={S.pathwayLabel}>Playground</span>
      </header>
      <div style={S.header}>
        <div style={S.saveCount}>{totalSaves} saves</div>
        <svg style={S.daisy} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(36,36)">
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(0) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(18) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(36) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(54) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(72) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(90) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(108) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(126) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(144) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(162) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(180) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(198) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(216) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(234) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(252) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(270) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(288) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(306) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(324) translate(0,-19)"/>
            <ellipse rx="4.5" ry="14" fill="white" opacity="0.95" transform="rotate(342) translate(0,-19)"/>
            <circle r="12" fill="#D89010"/>
            <circle r="10" fill="#F0A820"/>
            <circle r="8" fill="#E89818"/>
            <circle cx="-3" cy="-3" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="0" cy="-4.5" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="3" cy="-3" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="4.5" cy="0" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="3" cy="3" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="0" cy="4.5" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="-3" cy="3" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="-4.5" cy="0" r="1.3" fill="#A06010" opacity="0.5"/>
            <circle cx="-2" cy="-2" r="2.5" fill="rgba(255,255,255,0.2)"/>
          </g>
        </svg>
        <h1 style={S.title}>Playground</h1>
        <hr style={S.divider} />
        <p style={S.subtitle}>Your saved ideas, kept by location. Tap one to revisit or build a day.</p>
      </div>

      <main style={S.main}>
        {cities.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>🪁</div>
            <h2 style={S.emptyTitle}>Nothing here yet</h2>
            <p style={S.emptyText}>
              In Free Play, tap 📌 to save for later or ❤️ to save as fave.
            </p>
            <Link href="/free-play" style={S.emptyBtn}>Try Free Play →</Link>
          </div>
        ) : (
          cities.map(group => (
            <Link key={group.city} href={`/playground/${encodeURIComponent(group.city)}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                ...S.cityRow,
                ...(group.city === homeCity ? S.homeCity : {})
              }}>
                <div style={S.cityTop}>
                  <span style={S.cityName}>
                    {group.city}
                  </span>
                  {group.city === homeCity && <span style={S.badge}>Your city</span>}
                </div>

                <div style={S.pills}>
                  {group.hearts.length > 0 && (
                    <div style={{ ...S.pill, ...S.heartPill }}>
                      <span style={S.pillIcon}>❤️</span>
                      <span style={S.pillName}>{group.hearts[0].title}</span>
                    </div>
                  )}
                  {group.pins.length > 0 && (
                    <div style={S.pill}>
                      <span style={S.pillIcon}>📌</span>
                      <span style={S.pillName}>{group.pins[0].title}</span>
                    </div>
                  )}
                </div>

                <button style={S.seeAll}>See all {group.saves.length} →</button>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  )
}
