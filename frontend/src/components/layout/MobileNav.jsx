import { useNavigate, useLocation } from 'react-router-dom'
import { Home, MessageSquare, FileText, Settings } from 'lucide-react'

const items = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/documents', icon: FileText, label: 'Docs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[var(--color-obsidian-900)]/95 backdrop-blur-md px-2 py-2 md:hidden">
      {items.map((item) => {
        const active = location.pathname.startsWith(item.to)
        return (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] transition-colors ${
              active ? 'text-[var(--color-plum-300)]' : 'text-[var(--color-ivory-300)]/60'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
