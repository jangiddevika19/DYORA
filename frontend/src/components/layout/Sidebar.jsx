import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MessageSquarePlus, Search, Trash2, Pencil, FileText, Settings,
  LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ conversations, onCreate, onDelete, onRename, collapsed, setCollapsed }) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const navigate = useNavigate()
  const { id: activeId } = useParams()
  const { user, logout } = useAuth()

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))

  function startEdit(c) {
    setEditingId(c.id)
    setEditValue(c.title)
  }

  function commitEdit(c) {
    if (editValue.trim() && editValue !== c.title) onRename(c.id, editValue.trim())
    setEditingId(null)
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-16 flex-col items-center gap-4 border-r border-white/5 bg-[var(--color-obsidian-900)] py-4">
        <button onClick={() => setCollapsed(false)} className="rounded-lg p-2 text-[var(--color-ivory-300)] hover:bg-white/5">
          <PanelLeft size={18} />
        </button>
        <button onClick={onCreate} className="rounded-lg p-2 text-[var(--color-plum-300)] hover:bg-white/5">
          <MessageSquarePlus size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-72 flex-col border-r border-white/5 bg-[var(--color-obsidian-900)]">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="font-display text-lg tracking-tight text-[var(--color-ivory-100)]" style={{ fontFamily: 'var(--font-display)' }}>DYORA</span>
        <button onClick={() => setCollapsed(true)} className="rounded-lg p-1.5 text-[var(--color-ivory-300)]/60 hover:bg-white/5">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <button
          onClick={onCreate}
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-[var(--color-ivory-100)] hover:bg-white/[0.06] transition-colors"
        >
          <MessageSquarePlus size={16} className="text-[var(--color-plum-300)]" /> New Chat
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
          <Search size={14} className="text-[var(--color-ivory-300)]/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm text-[var(--color-ivory-200)] outline-none placeholder:text-[var(--color-ivory-300)]/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.map((c) => (
          <motion.div
            key={c.id}
            layout
            className={`group mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
              String(activeId) === String(c.id) ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
            }`}
            onClick={() => navigate(`/chat/${c.id}`)}
          >
            {editingId === c.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(c)}
                onKeyDown={(e) => e.key === 'Enter' && commitEdit(c)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent text-sm text-[var(--color-ivory-100)] outline-none border-b border-[var(--color-plum-400)]"
              />
            ) : (
              <span className="flex-1 truncate text-sm text-[var(--color-ivory-200)]">{c.title}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); startEdit(c) }}
              className="opacity-0 group-hover:opacity-100 text-[var(--color-ivory-300)]/50 hover:text-[var(--color-ivory-100)]"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
              className="opacity-0 group-hover:opacity-100 text-[var(--color-ivory-300)]/50 hover:text-rose-300"
            >
              <Trash2 size={13} />
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-[var(--color-ivory-300)]/40">No conversations yet</p>
        )}
      </div>

      <div className="border-t border-white/5 p-3">
        <button onClick={() => navigate('/documents')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-ivory-200)] hover:bg-white/5">
          <FileText size={15} /> Documents
        </button>
        <button onClick={() => navigate('/settings')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-ivory-200)] hover:bg-white/5">
          <Settings size={15} /> Settings
        </button>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2">
          <span className="truncate text-xs text-[var(--color-ivory-300)]/70">{user?.name}</span>
          <button onClick={logout} className="text-[var(--color-ivory-300)]/60 hover:text-rose-300">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
