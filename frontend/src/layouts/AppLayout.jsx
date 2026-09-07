import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import MobileNav from '../components/layout/MobileNav'
import CommandPalette from '../components/ui/CommandPalette'
import { useConversations } from '../hooks/useConversations'
import { conversationService } from '../services/conversationService'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { conversations, refresh, setConversations } = useConversations()
  const navigate = useNavigate()
  const { toggle, setOpen } = useCommandPalette()

  useKeyboardShortcut('ctrl+k', toggle)
  useKeyboardShortcut('escape', () => setOpen(false))

  async function handleCreate() {
    const conv = await conversationService.create()
    await refresh()
    navigate(`/chat/${conv.id}`)
  }

  async function handleDelete(id) {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    await conversationService.remove(id)
    navigate('/home')
  }

  async function handleRename(id, title) {
    await conversationService.rename(id, title)
    refresh()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-obsidian-950)]">
      <div className="hidden md:flex">
        <Sidebar
          conversations={conversations}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onRename={handleRename}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>
      <div className="flex-1 overflow-hidden pb-14 md:pb-0">
        <Outlet context={{ conversations, refresh, onCreate: handleCreate }} />
      </div>
      <MobileNav />
      <CommandPalette />
    </div>
  )
}
