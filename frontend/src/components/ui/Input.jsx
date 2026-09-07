export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-[var(--color-ivory-300)]">{label}</span>}
      <input
        className={`w-full rounded-xl border border-white/10 bg-[var(--color-obsidian-800)] px-4 py-2.5 text-[var(--color-ivory-100)] placeholder:text-[var(--color-ivory-300)]/40 outline-none focus:border-[var(--color-plum-400)] transition-colors ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-rose-300">{error}</span>}
    </label>
  )
}
