import { motion } from 'framer-motion'
import { Copy, RotateCcw, Check } from 'lucide-react'
import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import MoodIndicator from '../ui/MoodIndicator'

export default function MessageBubble({ message, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'USER'

  function handleCopy() {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[var(--color-obsidian-800)] border border-white/5 px-4 py-3 text-[var(--color-ivory-100)]">
          <p className="whitespace-pre-wrap text-[0.95rem]">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex justify-start"
    >
      <div className="max-w-[85%]">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-[var(--color-plum-300)]">DYORA</span>
          {message.detectedMood && <MoodIndicator mood={message.detectedMood} />}
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-[var(--color-obsidian-900)]/60 px-4 py-3.5">
          <MarkdownRenderer content={message.content} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[var(--color-ivory-300)]/60 hover:text-[var(--color-ivory-100)] transition-colors">
            {copied ? <Check size={12} /> : <Copy size={12} />} Copy
          </button>
          {isLast && onRegenerate && (
            <button onClick={onRegenerate} className="flex items-center gap-1 text-xs text-[var(--color-ivory-300)]/60 hover:text-[var(--color-ivory-100)] transition-colors">
              <RotateCcw size={12} /> Regenerate
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
