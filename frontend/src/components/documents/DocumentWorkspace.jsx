import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Sparkles, ListChecks, MessageCircleQuestion,
  NotebookPen, Layers, CalendarClock, Loader2,
} from 'lucide-react'
import { documentService } from '../../services/documentService'
import MarkdownRenderer from '../chat/MarkdownRenderer'

const ACTIONS = [
  { id: 'summary', label: 'Summary', icon: Sparkles },
  { id: 'notes', label: 'Generate Notes', icon: NotebookPen },
  { id: 'mcqs', label: 'Generate MCQs', icon: ListChecks },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'studyPlan', label: 'Revision Plan', icon: CalendarClock },
]

export default function DocumentWorkspace({ document, onAskInChat }) {
  const [activeAction, setActiveAction] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')

  async function runAction(actionId) {
    setActiveAction(actionId)
    setLoading(true)
    setResult('')
    try {
      let text
      if (actionId === 'summary') text = await documentService.summary(document.id)
      else if (actionId === 'notes') text = await documentService.notes(document.id)
      else if (actionId === 'mcqs') text = await documentService.mcqs(document.id, 15)
      else if (actionId === 'flashcards') text = await documentService.flashcards(document.id)
      else if (actionId === 'studyPlan') text = await documentService.studyPlan(document.id, '3 days')
      setResult(text)
    } catch (e) {
      setResult('Something went wrong while processing this document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function askQuestion(e) {
    e.preventDefault()
    if (!question.trim()) return
    setActiveAction('ask')
    setLoading(true)
    setResult('')
    try {
      const answer = await documentService.ask(document.id, question)
      setResult(answer)
    } catch {
      setResult('I could not process that question right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="editorial-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-plum-700)]/30 text-[var(--color-plum-300)]">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-ivory-100)]">{document.fileName}</p>
            <p className="text-xs text-[var(--color-ivory-300)]/60">
              {document.pageCount ? `${document.pageCount} pages` : ''} · {document.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => runAction(action.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
              activeAction === action.id
                ? 'border-[var(--color-plum-400)]/50 bg-[var(--color-plum-700)]/20 text-[var(--color-ivory-100)]'
                : 'border-white/10 bg-white/[0.02] text-[var(--color-ivory-200)] hover:bg-white/[0.05]'
            }`}
          >
            <action.icon size={14} /> {action.label}
          </button>
        ))}
      </div>

      <form onSubmit={askQuestion} className="flex items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask DYORA about this document…"
          className="flex-1 rounded-xl border border-white/10 bg-[var(--color-obsidian-800)] px-3 py-2.5 text-sm text-[var(--color-ivory-100)] outline-none placeholder:text-[var(--color-ivory-300)]/40 focus:border-[var(--color-plum-400)]"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[var(--color-plum-500)] to-[var(--color-plum-700)] px-3 py-2.5 text-sm text-white"
        >
          <MessageCircleQuestion size={15} /> Ask
        </button>
      </form>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.015] p-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-ivory-300)]/60">
            <Loader2 size={14} className="animate-spin" /> DYORA is reading the document…
          </div>
        )}
        {!loading && result && <MarkdownRenderer content={result} />}
        {!loading && !result && (
          <p className="text-sm text-[var(--color-ivory-300)]/40">
            Choose an action above, or ask a direct question about this document.
          </p>
        )}
      </div>
    </div>
  )
}
