import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-br from-[var(--color-plum-500)] to-[var(--color-plum-700)] text-[var(--color-ivory-100)] shadow-lg shadow-black/30',
  ghost: 'bg-transparent border border-white/10 text-[var(--color-ivory-200)] hover:bg-white/5',
  subtle: 'bg-[var(--color-obsidian-800)] text-[var(--color-ivory-200)] hover:bg-[var(--color-obsidian-700)]',
  danger: 'bg-transparent border border-rose-400/30 text-rose-300 hover:bg-rose-400/10',
}

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
