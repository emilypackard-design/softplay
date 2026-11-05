import { ImageResponse } from 'next/og'

export const alt = 'softplay — Fun Decision Maker for family days out'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const blade = 'M50,50 L50,16 Q70,16 74,36 Q74,47 50,50 Z'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FEF5CC 0%, #FEFBF3 55%, #E8F5F2 100%)',
          padding: 60,
        }}
      >
        <svg width="260" height="260" viewBox="0 0 100 100" style={{ marginRight: 56 }}>
          <path d={blade} fill="#C9963A" />
          <path d={blade} fill="#3D9E8F" transform="rotate(90 50 50)" />
          <path d={blade} fill="#E07055" transform="rotate(180 50 50)" />
          <path d={blade} fill="#F5C842" transform="rotate(270 50 50)" />
          <circle cx="50" cy="50" r="7" fill="#1C1917" />
          <circle cx="50" cy="50" r="3.5" fill="#FEFBF3" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: '#5A4F48', letterSpacing: -3, lineHeight: 1 }}>softplay</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#3D9E8F', letterSpacing: 6, marginTop: 18 }}>FUN DECISION MAKER</div>
          <div style={{ fontSize: 40, color: '#5C4E3D', marginTop: 28, lineHeight: 1.3, maxWidth: 620 }}>
            Because great Saturdays don&apos;t plan themselves.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
