import { ImageResponse } from 'next/og'

export const alt = 'softplay — Fun Decision Maker for family days out'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const blade = 'M50,50 L50,16 Q70,16 74,36 Q74,47 50,50 Z'

// Everything is centered and kept inside the middle 630px square, because Facebook and
// Messenger crop link previews to a small square from the center in comments and chats.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FEF5CC 0%, #FEFBF3 55%, #E8F5F2 100%)',
        }}
      >
        <svg width="150" height="203" viewBox="0 0 100 135">
          <rect x="45.5" y="54" width="9" height="81" rx="4.5" fill="#C9963A" />
          <path d={blade} fill="#C9963A" />
          <path d={blade} fill="#3D9E8F" transform="rotate(90 50 50)" />
          <path d={blade} fill="#E07055" transform="rotate(180 50 50)" />
          <path d={blade} fill="#F5C842" transform="rotate(270 50 50)" />
          <circle cx="50" cy="50" r="7" fill="#1C1917" />
          <circle cx="50" cy="50" r="3.5" fill="#FEFBF3" />
        </svg>
        <div style={{ fontSize: 104, fontWeight: 700, color: '#5A4F48', letterSpacing: -3, lineHeight: 1, marginTop: 6 }}>softplay</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#3D9E8F', letterSpacing: 5, marginTop: 14 }}>FUN DECISION MAKER</div>
        <div style={{ fontSize: 31, color: '#5C4E3D', marginTop: 16, lineHeight: 1.25, textAlign: 'center', maxWidth: 420 }}>
          Because great Saturdays don&apos;t plan themselves.
        </div>
      </div>
    ),
    { ...size },
  )
}
