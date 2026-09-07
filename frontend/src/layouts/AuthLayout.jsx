import { motion } from 'framer-motion'
import DyoraOrb from '../components/orb/DyoraOrb'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="atmospheric-bg relative flex min-h-screen items-center justify-center px-4">
      <div className="grain-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="editorial-card relative z-10 w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <DyoraOrb state="idle" size={110} />
          <h1
            className="mt-3 text-2xl font-semibold text-gradient-plum"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--color-ivory-300)]">{subtitle}</p>}
        </div>
        {children}
      </motion.div>
    </div>
  )
}
