import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquarePlus, FileUp, Search, ListChecks, NotebookPen,
  GraduationCap, FileText, Settings as SettingsIcon,
} from 'lucide-react'
import { useCommandPalette } from '../../hooks/useCommandPalette'

export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const commands = useMemo(() => [
    { id: 'new-chat', label: 'New Chat', icon: MessageSquarePlus, action: () => navigate('/chat') },
    { id: 'upload-pdf', label: 'Upload PDF', icon: FileUp, action: () => navigate('/documents') },
    { id: 'search-chats', label: 'Search Chats', icon: Search, action: () => navigate('/chat') },
    { id: 'create-plan', label: 'Create Plan', icon: ListChecks, action: () => navigate('/chat?intent=plan') },
    { id: 'generate-notes', label: 'Generate Notes', icon: NotebookPen, action: () => navigate('/chat?intent=notes') },
    { id: 'interview-prep', label: 'Interview Prep', icon: GraduationCap, action: () => navigate('/chat?intent=interview') },
    { id: 'resume-review', label: 'Resume Review', icon: FileText, action: () => navigate('/chat?intent=resume') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, action: () => navigate('/settings') },
  ], [navigate])

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => { if (!open) setQuery('') }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="editorial-card w-full max-w-lg rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 px-4 py-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command…"
                className="w-full bg-transparent text-[var(--color-ivory-100)] outline-none placeholder:text-[var(--color-ivory-300)]/40"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-ivory-300)]/60">No commands found</div>
              )}
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); setOpen(false) }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--color-ivory-200)] hover:bg-white/5 transition-colors"
                >
                  <cmd.icon size={16} className="text-[var(--color-plum-300)]" />
                  {cmd.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
