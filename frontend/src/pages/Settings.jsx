import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Trash2 } from 'lucide-react'
import { settingsService } from '../services/settingsService'
import { memoryService } from '../services/memoryService'
import { useAuth } from '../hooks/useAuth'

const TABS = ['Profile', 'Appearance', 'AI preferences', 'Memory', 'Privacy', 'Shortcuts']

function SectionCard({ children }) {
  return <div className="editorial-card rounded-2xl p-6">{children}</div>
}

function OptionPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
        active
          ? 'border-[var(--color-plum-400)]/60 bg-[var(--color-plum-700)]/25 text-[var(--color-ivory-100)]'
          : 'border-white/10 bg-white/[0.02] text-[var(--color-ivory-300)] hover:bg-white/[0.05]'
      }`}
    >
      {children}
    </button>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Profile')
  const [settings, setSettings] = useState(null)
  const [memories, setMemories] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [s, m] = await Promise.all([settingsService.get(), memoryService.list()])
      setSettings(s)
      setMemories(m)
    } finally {
      setLoading(false)
    }
  }

  async function update(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    await settingsService.update(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function removeMemory(id) {
    setMemories((prev) => prev.filter((m) => m.id !== id))
    await memoryService.remove(id)
  }

  async function clearAllMemories() {
    setMemories([])
    await memoryService.clearAll()
  }

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-plum-300)]" />
      </div>
    )
  }

  return (
    <div className="atmospheric-bg h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gradient-plum" style={{ fontFamily: 'var(--font-display)' }}>
            Settings
          </h1>
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-sm text-[var(--color-plum-300)]">
              <Check size={14} /> Saved
            </motion.span>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                tab === t ? 'bg-[var(--color-plum-700)]/40 text-[var(--color-ivory-100)]' : 'text-[var(--color-ivory-300)]/60 hover:text-[var(--color-ivory-100)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Profile' && (
          <SectionCard>
            <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Your profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-[var(--color-ivory-300)]/60">Name</span>
                <span className="text-[var(--color-ivory-100)]">{user?.name}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[var(--color-ivory-300)]/60">Email</span>
                <span className="text-[var(--color-ivory-100)]">{user?.email}</span>
              </div>
            </div>
          </SectionCard>
        )}

        {tab === 'Appearance' && (
          <SectionCard>
            <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Theme</h2>
            <div className="flex gap-3">
              {['DARK', 'LIGHT', 'SYSTEM'].map((theme) => (
                <OptionPill key={theme} active={settings.theme === theme} onClick={() => update({ theme })}>
                  {theme.charAt(0) + theme.slice(1).toLowerCase()}
                </OptionPill>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-ivory-300)]/50">
              DYORA's signature dark identity is recommended for the full cinematic experience.
            </p>
          </SectionCard>
        )}

        {tab === 'AI preferences' && (
          <div className="space-y-4">
            <SectionCard>
              <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Response length</h2>
              <div className="flex gap-3">
                {['SHORT', 'BALANCED', 'DETAILED'].map((v) => (
                  <OptionPill key={v} active={settings.responseLength === v} onClick={() => update({ responseLength: v })}>
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </SectionCard>
            <SectionCard>
              <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Personality</h2>
              <div className="flex gap-3">
                {['BALANCED', 'FRIENDLY', 'PROFESSIONAL'].map((v) => (
                  <OptionPill key={v} active={settings.personality === v} onClick={() => update({ personality: v })}>
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </SectionCard>
            <SectionCard>
              <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Language</h2>
              <div className="flex flex-wrap gap-3">
                {['AUTO', 'ENGLISH', 'HINDI', 'HINGLISH'].map((v) => (
                  <OptionPill key={v} active={settings.preferredLanguage === v} onClick={() => update({ preferredLanguage: v })}>
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </OptionPill>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'Memory' && (
          <SectionCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[var(--color-ivory-100)]">What DYORA remembers</h2>
              {memories.length > 0 && (
                <button onClick={clearAllMemories} className="text-xs text-rose-300 hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <div className="space-y-2">
              {memories.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm text-[var(--color-ivory-100)]">{m.value}</p>
                    <p className="text-xs text-[var(--color-ivory-300)]/50">{m.key.replace(/_/g, ' ')}</p>
                  </div>
                  <button onClick={() => removeMemory(m.id)} className="text-[var(--color-ivory-300)]/50 hover:text-rose-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {memories.length === 0 && (
                <p className="py-6 text-center text-sm text-[var(--color-ivory-300)]/40">
                  DYORA hasn't stored anything about you yet. Only explicit preferences (like a career goal or preferred style) are ever remembered.
                </p>
              )}
            </div>
          </SectionCard>
        )}

        {tab === 'Privacy' && (
          <SectionCard>
            <h2 className="mb-3 text-lg font-medium text-[var(--color-ivory-100)]">Privacy</h2>
            <p className="text-sm text-[var(--color-ivory-300)]">
              Your conversations and documents are private to your account. DYORA only stores long-term
              memory for explicit, non-sensitive preferences you share — never inferred sensitive personal
              information. You can review or clear everything from the Memory tab at any time.
            </p>
          </SectionCard>
        )}

        {tab === 'Shortcuts' && (
          <SectionCard>
            <h2 className="mb-4 text-lg font-medium text-[var(--color-ivory-100)]">Keyboard shortcuts</h2>
            <div className="space-y-2 text-sm text-[var(--color-ivory-300)]">
              <div className="flex justify-between"><span>Open command menu</span><kbd className="rounded bg-white/10 px-2 py-0.5">Ctrl + K</kbd></div>
              <div className="flex justify-between"><span>Send message</span><kbd className="rounded bg-white/10 px-2 py-0.5">Enter</kbd></div>
              <div className="flex justify-between"><span>New line</span><kbd className="rounded bg-white/10 px-2 py-0.5">Shift + Enter</kbd></div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  )
}
