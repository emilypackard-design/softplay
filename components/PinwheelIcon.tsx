// Pinwheel icon — brand hero and loading state
// Blades: amber, teal, ink, yellow (yellow has stroke so it reads on yellow backgrounds)

interface Props {
  size?: number
  spinning?: boolean
  spinDuration?: number // seconds per rotation — higher = slower
  stem?: boolean // show the stick; false = just the wheel (square)
}

export default function PinwheelIcon({ size = 48, spinning = false, spinDuration = 1, stem = true }: Props) {
  const totalHeight = stem ? Math.round(size * 1.35) : size
  const viewBox = stem ? '0 0 100 135' : '0 0 100 100'

  const blades = [
    { color: '#E8A020', stroke: 'none' },        // amber
    { color: '#3D9E8F', stroke: 'none' },         // teal
    { color: '#E07055', stroke: 'none' },         // coral
    { color: '#FFE566', stroke: 'rgba(28,25,23,0.2)' }, // yellow — stroke so it reads on yellow bg
  ]

  return (
    <svg
      width={size}
      height={totalHeight}
      viewBox={viewBox}
      style={{ display: 'inline-block', overflow: 'visible' }}
    >
      {/* Stick */}
      {stem && <rect x="45.5" y="54" width="9" height="81" rx="4.5" fill="#C9963A" />}

      {/* Spinning wheel group */}
      <g style={{
        transformOrigin: '50px 50px',
        animation: spinning ? `spin-pinwheel ${spinDuration}s linear infinite` : 'none',
      }}>
        {blades.map((blade, i) => (
          <path
            key={i}
            d="M50,50 L50,16 Q70,16 74,36 Q74,47 50,50 Z"
            fill={blade.color}
            stroke={blade.stroke === 'none' ? undefined : blade.stroke}
            strokeWidth={blade.stroke === 'none' ? undefined : 1.5}
            transform={i > 0 ? `rotate(${i * 90} 50 50)` : undefined}
          />
        ))}

        {/* Centre pin */}
        <circle cx="50" cy="50" r="7" fill="#1C1917" />
        <circle cx="50" cy="50" r="3.5" fill="#FEFBF3" />
      </g>
    </svg>
  )
}
