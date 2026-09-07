const MOOD_META = {
  HAPPY: { label: 'Feeling good', color: '#eec9a3' },
  EXCITED: { label: 'Excited', color: '#d98e83' },
  CALM: { label: 'Calm', color: '#a9a1d4' },
  NEUTRAL: { label: '', color: '#b9bcc2' },
  CONFUSED: { label: 'Let\u2019s simplify', color: '#c78fca' },
  FRUSTRATED: { label: 'Taking it slow', color: '#c3937e' },
  SAD: { label: 'Here for you', color: '#a9a1d4' },
  STRESSED: { label: 'One step at a time', color: '#c78fca' },
  ANGRY: { label: 'Staying steady', color: '#c3937e' },
  TIRED: { label: 'Keeping it brief', color: '#b9bcc2' },
}

/**
 * A subtle, non-creepy mood indicator — a small dot + short phrase,
 * never a loud label or diagnosis.
 */
export default function MoodIndicator({ mood }) {
  const meta = MOOD_META[mood] || MOOD_META.NEUTRAL
  if (!meta.label) return null
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--color-ivory-300)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </div>
  )
}
