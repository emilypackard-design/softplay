'use client'

import { useMemo } from 'react'

// Shared confetti — the original softplay design (CSS keyframe `confetti-fall`
// defined in globals.css). Used by the Wheel (fires on spin-land) and the
// Playbook winner-card reveal. Keeping one component keeps the celebration
// identical everywhere.
const CONFETTI_COLORS = ['#F5C842', '#3D9E8F', '#E07055', '#6B8F6E', '#C9963A']

export default function Confetti({ active = true }: { active?: boolean }) {
  const pieces = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      duration: 0.9 + Math.random() * 0.7,
      delay: Math.random() * 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      width: 6 + Math.random() * 6,
      height: 8 + Math.random() * 8,
    })), [])

  if (!active) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }} aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '35%', left: `${p.left}%`,
          width: p.width, height: p.height,
          background: p.color, borderRadius: 2,
          animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s both`,
        }} />
      ))}
    </div>
  )
}
