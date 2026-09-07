import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FileUp, ListChecks, Code2, GraduationCap, PenLine } from 'lucide-react'
import DyoraOrb from '../components/orb/DyoraOrb'
import { useAuth } from '../hooks/useAuth'
import { useConversations } from '../hooks/useConversations'

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'Ask anything', to: '/chat' },
  { icon: FileUp, label: 'Analyze a PDF', to: '/documents' },
  { icon: ListChecks, label: 'Create a plan', to: '/chat?intent=plan' },
  { icon: Code2, label: 'Help me code', to: '/chat?intent=code' },
  { icon: GraduationCap, label: 'Prepare for interview', to: '/chat?intent=interview' },
  { icon: PenLine, label: 'Write something', to: '/chat?intent=write' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { conversations } = useConversations()

  return (
    <div className="atmospheric-bg relative min-h-screen overflow-y-auto">
      <div className="grain-overlay" />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-16 text-center">
        <DyoraOrb state="idle" size={200} />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-5xl font-semibold tracking-tight text-gradient-plum"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          DYORA
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-md text-[var(--color-ivory-300)]"
        >
          An AI that understands more than your words.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10 text-lg text-[var(--color-ivory-200)]"
        >
          {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Welcome.'} What can I help you create today?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="editorial-card flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-sm text-[var(--color-ivory-200)] transition-transform hover:-translate-y-0.5"
            >
              <action.icon size={18} className="text-[var(--color-plum-300)]" />
              {action.label}
            </button>
          ))}
        </motion.div>

        {conversations.length > 0 && (
          <div className="mt-14 w-full max-w-2xl text-left">
            <h2 className="mb-3 text-sm font-medium text-[var(--color-ivory-300)]/70">Recent conversations</h2>
            <div className="space-y-2">
              {conversations.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-[var(--color-ivory-200)] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="truncate">{c.title}</span>
                  <span className="text-xs text-[var(--color-ivory-300)]/40">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
