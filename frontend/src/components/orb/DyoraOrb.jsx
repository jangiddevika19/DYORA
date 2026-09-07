import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * DYORA's signature entity — an organic, faceted sculptural form
 * (not a generic glowing sphere). Reacts to cursor proximity and
 * exposes visual states: idle | thinking | responding | listening | error.
 */
export default function DyoraOrb({ state = 'idle', size = 220 }) {
  const wrapperRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleMove(e) {
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      setTilt({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  const palette = {
    idle: ['#8a4a8e', '#a9a1d4', '#d98e83'],
    thinking: ['#a866ad', '#c78fca', '#eec9a3'],
    responding: ['#c78fca', '#eec9a3', '#e6b3a8'],
    listening: ['#a9a1d4', '#8a4a8e', '#c3bce3'],
    error: ['#8a4a4a', '#5c2f2f', '#d98e83'],
  }[state] || palette_default()

  function palette_default() { return ['#8a4a8e', '#a9a1d4', '#d98e83'] }

  const breatheDuration = state === 'thinking' ? 1.6 : state === 'responding' ? 2.2 : 4.2

  return (
    <div ref={wrapperRef} className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Ambient atmospheric glow — soft, not neon */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${palette[0]}33, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sculptural faceted core */}
      <motion.svg
        viewBox="0 0 200 200"
        width={size * 0.72}
        height={size * 0.72}
        className="relative z-10 drop-shadow-2xl"
        style={{ transform: `rotateX(${tilt.y * -8}deg) rotateY(${tilt.x * 8}deg)`, transformStyle: 'preserve-3d' }}
        animate={{
          scale: state === 'thinking' ? [1, 1.05, 0.98, 1] : state === 'error' ? [1, 0.96, 1] : [1, 1.04, 1],
          rotate: state === 'thinking' ? [0, 8, -6, 0] : [0, 3, -3, 0],
        }}
        transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="dyora-face-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette[0]} />
            <stop offset="100%" stopColor={palette[1]} />
          </linearGradient>
          <linearGradient id="dyora-face-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette[1]} />
            <stop offset="100%" stopColor={palette[2]} />
          </linearGradient>
          <linearGradient id="dyora-face-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette[2]} />
            <stop offset="100%" stopColor={palette[0]} />
          </linearGradient>
        </defs>

        {/* organic, asymmetric polygon facets forming a distinctive crystalline entity */}
        <polygon points="100,10 165,55 175,120 120,185 60,175 20,115 35,50" fill="url(#dyora-face-1)" opacity="0.9" />
        <polygon points="100,10 165,55 130,95 90,70" fill="url(#dyora-face-2)" opacity="0.85" />
        <polygon points="165,55 175,120 130,95" fill="url(#dyora-face-3)" opacity="0.75" />
        <polygon points="130,95 175,120 120,185 100,130" fill="url(#dyora-face-2)" opacity="0.65" />
        <polygon points="90,70 130,95 100,130 60,110" fill="url(#dyora-face-1)" opacity="0.55" />
        <polygon points="60,110 100,130 120,185 60,175" fill="url(#dyora-face-3)" opacity="0.7" />
        <polygon points="35,50 90,70 60,110 20,115" fill="url(#dyora-face-2)" opacity="0.5" />

        {/* thin edge lines for sculptural precision */}
        <g stroke="rgba(247,243,238,0.25)" strokeWidth="0.6" fill="none">
          <polygon points="100,10 165,55 175,120 120,185 60,175 20,115 35,50" />
          <line x1="100" y1="10" x2="130" y2="95" />
          <line x1="165" y1="55" x2="130" y2="95" />
          <line x1="130" y1="95" x2="100" y2="130" />
          <line x1="90" y1="70" x2="100" y2="130" />
          <line x1="60" y1="110" x2="100" y2="130" />
        </g>
      </motion.svg>

      {/* Fine particle drift */}
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: palette[i % palette.length],
            top: `${20 + i * 8}%`,
            left: `${15 + ((i * 37) % 70)}%`,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -14, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}
    </div>
  )
}
