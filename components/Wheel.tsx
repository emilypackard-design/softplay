'use client'

import { useState } from 'react'
import type { WheelOption } from '@/types'
import Confetti from '@/components/Confetti'

const SEGMENT_COLORS = [
  '#F5C842', '#3D9E8F', '#E07055', '#F5EFE0',
  '#6B8F6E', '#C9963A', '#B8D4C8', '#E8C49A',
]

export interface WheelProps {
  options: WheelOption[]
  onSpinComplete: (winnerId: string) => void
  autoSpin?: boolean
  wildcardInWheel?: boolean
}

export default function Wheel({ options, onSpinComplete, autoSpin, wildcardInWheel }: WheelProps) {
  const [totalRotation, setTotalRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const spin = () => {
    if (isSpinning || options.length === 0) return

    const n = options.length
    const segmentAngle = 360 / n
    const winnerIndex = Math.floor(Math.random() * n)
    const fullRotations = (6 + Math.floor(Math.random() * 3)) * 360
    const winnerCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2
    const landingOffset = 360 - winnerCenterAngle

    setIsSpinning(true)
    setHasSpun(true)
    setShowConfetti(false)
    setTotalRotation(prev => prev + fullRotations + landingOffset)

    setTimeout(() => {
      setIsSpinning(false)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1800)
      onSpinComplete(options[winnerIndex].id)
    }, 4300)
  }

  const n = options.length
  const conicParts = options.map((opt, i) => {
    const start = i * (360 / n)
    const end = (i + 1) * (360 / n)
    const color = (opt as any).isWildcard ? '#E8A0A8' : SEGMENT_COLORS[i % SEGMENT_COLORS.length]
    return `${color} ${start}deg ${end}deg`
  }).join(', ')

  return (
    <>
      <Confetti active={showConfetti} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

        {/* Coral Pointer */}
        <div style={{
          position: 'relative', marginBottom: -8, zIndex: 10,
          width: 0, height: 0,
          borderLeft: '9px solid transparent', borderRight: '9px solid transparent',
          borderTop: '16px solid #E07055',
          filter: 'drop-shadow(0 2px 4px rgba(224,112,85,0.5))',
        }} />

        {/* Wheel with Bezel */}
        <div style={{
          position: 'relative', width: 308, height: 308,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          // Bezel effect
          background: 'linear-gradient(145deg, #3A3530 0%, #1A1714 45%, #2E2926 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 12px 40px rgba(0,0,0,0.35),
            0 4px 12px rgba(0,0,0,0.2),
            inset 0 2px 4px rgba(255,255,255,0.08),
            inset 0 -3px 6px rgba(0,0,0,0.4)
          `,
        }}>

        {/* Wheel */}
        <div style={{ position: 'relative', width: 268, height: 268 }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: `conic-gradient(${conicParts})`,
            transform: `rotate(${totalRotation}deg)`,
            transition: isSpinning ? 'transform 4.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            filter: 'drop-shadow(0 10px 32px rgba(28,25,23,0.15))',
            position: 'relative',
          }}>
            {/* Labels */}
            {options.map((option, i) => {
              const angleDeg = i * (360 / n) + 360 / n / 2
              const angleRad = ((angleDeg - 90) * Math.PI) / 180
              const r = 80
              const x = Math.cos(angleRad) * r
              const y = Math.sin(angleRad) * r
              return (
                <div key={option.id} style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                  width: 80, textAlign: 'center', pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 22 }}>{option.emoji}</div>
                </div>
              )
            })}

            {/* Black Chrome Dome Button */}
            <button
              onClick={spin}
              disabled={isSpinning}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 72, height: 72, borderRadius: '50%',
                border: 'none',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                background: `radial-gradient(circle at 35% 30%, #5A5048 0%, #3A3228 30%, #1C1814 70%, #0A0806 100%)`,
                boxShadow: `
                  0 0 0 3px #0A0806,
                  0 0 0 5px #3A3530,
                  0 0 0 7px #0A0806,
                  0 6px 24px rgba(0,0,0,0.7),
                  inset 0 2px 4px rgba(255,255,255,0.15),
                  inset 0 -2px 4px rgba(0,0,0,0.6)
                `,
                color: '#F5C842',
                fontFamily: 'var(--font-heading)',
                fontSize: 13,
                fontWeight: 900,
                textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(245,200,66,0.3)',
                transition: 'all 0.15s',
                zIndex: 20,
                // Shimmer highlight
                backgroundImage: `
                  radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.22) 0%, transparent 70%),
                  radial-gradient(circle at 35% 30%, #5A5048 0%, #3A3228 30%, #1C1814 70%, #0A0806 100%)
                `,
              }}
              onMouseDown={e => {
                if (!isSpinning) {
                  e.currentTarget.style.transform = 'translate(-50%, -47%) scale(0.95)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)'
                }
              }}
              onMouseUp={e => {
                if (!isSpinning) {
                  e.currentTarget.style.transform = 'translate(-50%, -50%)'
                  e.currentTarget.style.boxShadow = `
                    0 0 0 3px #0A0806,
                    0 0 0 5px #3A3530,
                    0 0 0 7px #0A0806,
                    0 6px 24px rgba(0,0,0,0.7),
                    inset 0 2px 4px rgba(255,255,255,0.15),
                    inset 0 -2px 4px rgba(0,0,0,0.6)
                  `
                }
              }}
            >
              SPIN
            </button>
          </div>
        </div>
        </div> {/* End bezel container */}
      </div>
    </>
  )
}
