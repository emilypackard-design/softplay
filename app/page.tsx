import Link from 'next/link'
import PinwheelIcon from '@/components/PinwheelIcon'

export default function Home() {
  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          main {
            padding: 16px 20px !important;
          }
          .brand-section {
            margin-bottom: 20px !important;
          }
          .brand-icon {
            margin-bottom: 12px !important;
          }
          .brand-title {
            font-size: 40px !important;
          }
          .brand-tagline {
            font-size: 13px !important;
            margin-top: 6px !important;
          }
          .cards-section {
            gap: 12px !important;
          }
          .playground-link {
            margin-top: 20px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
      <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 75% 25%, #FEF5CC 0%, #FEFBF3 55%, #E8F5F2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        boxSizing: 'border-box',
      }}>

      {/* Brand */}
      <div className="brand-section" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="brand-icon" style={{ marginBottom: 20 }}><PinwheelIcon size={72} /></div>
        <h1 className="brand-title" style={{
          fontFamily: 'var(--font-wordmark)',
          fontSize: 54,
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#5A4F48',
          margin: 0,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}>
          softplay
        </h1>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '3.5px',
          textTransform: 'uppercase',
          color: '#3D9E8F',
          margin: '10px 0 0',
        }}>
          Fun Decision Maker
        </p>
        <p className="brand-tagline" style={{
          fontFamily: 'var(--font-wordmark)',
          fontSize: 17,
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(28,25,23,0.45)',
          margin: '14px 0 0',
          lineHeight: 1.4,
        }}>
          Because great Saturdays<br />don&apos;t plan themselves.
        </p>
      </div>

      {/* Path cards */}
      <div className="cards-section" style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Playbook */}
        <Link href="/play-plan" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: 'linear-gradient(180deg, #F5C842 0%, #FEF9E8 100%)',
            borderRadius: 24,
            padding: '24px 26px 26px',
            boxShadow: '0 4px 24px rgba(28,25,23,0.10)',
            cursor: 'pointer',
          }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#3D9E8F',
              margin: '0 0 10px',
            }}>
              The Full Experience
            </p>
            <h2 style={{
              fontFamily: 'var(--font-wordmark)',
              fontSize: 34,
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#1C1917',
              margin: '0 0 12px',
              lineHeight: 1.1,
            }}>
              Playbook
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: '#3D2E1C',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              Answer a few questions. Get four suggestion cards picked for your crew. Spin to decide.
            </p>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 14,
              fontWeight: 700,
              color: '#1C1917',
            }}>
              Let&apos;s go →
            </span>
          </div>
        </Link>

        {/* Free Play */}
        <Link href="/free-play" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FEFBF3 0%, #C8E6E1 100%)',
            borderRadius: 24,
            padding: '24px 26px 26px',
            boxShadow: '0 4px 24px rgba(28,25,23,0.10)',
            cursor: 'pointer',
          }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#3D9E8F',
              margin: '0 0 10px',
            }}>
              Quick Idea Generation
            </p>
            <h2 style={{
              fontFamily: 'var(--font-wordmark)',
              fontSize: 34,
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#1C1917',
              margin: '0 0 12px',
              lineHeight: 1.1,
            }}>
              Free Play
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: '#3D2E1C',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              Start with a location you want to explore. Flip through suggestion cards. Save your faves.
            </p>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 14,
              fontWeight: 700,
              color: '#3D9E8F',
            }}>
              Let&apos;s explore →
            </span>
          </div>
        </Link>
      </div>

      {/* Playground link */}
      <Link href="/playground" style={{ textDecoration: 'none' }}>
        <div className="playground-link" style={{
          marginTop: 32,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#5AAA32',
          color: '#FFFFFF',
          fontFamily: 'var(--font-heading)',
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 20,
          padding: '8px 16px',
          cursor: 'pointer',
        }}>
          <span style={{ color: '#E07055', fontSize: 14 }}>📌</span>
          Playground
        </div>
      </Link>
    </main>
    </>
  )
}
