'use client'

import { useEffect, useRef } from 'react'

// Lightweight, dependency-free confetti burst. Renders a full-viewport canvas
// overlay (pointer-events: none) and fires one celebratory burst on mount from
// roughly the winner-card area, then fades out and stops. softplay palette.
const COLORS = ['#F5C842', '#3D9E8F', '#E07055', '#8FB88A', '#F0A820']

export default function Confetti({ originY = 0.32, durationMs = 2600 }: { originY?: number; durationMs?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const ox = W / 2
    const oy = H * originY
    const count = Math.min(140, Math.round(W / 4))
    const parts = Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 7
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed * (0.6 + Math.random()),
        vy: Math.sin(angle) * speed - (3 + Math.random() * 3),
        size: 5 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        rect: Math.random() < 0.5,
      }
    })

    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const elapsed = t - start
      ctx.clearRect(0, 0, W, H)
      const fade = Math.max(0, 1 - elapsed / durationMs)
      for (const p of parts) {
        p.vy += 0.18 // gravity
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.rect) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (elapsed < durationMs) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [originY, durationMs])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
    />
  )
}
