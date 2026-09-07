import { useRef, useState } from 'react'
import { ArrowUp, Paperclip, Square } from 'lucide-react'

export default function ChatInput({ onSend, disabled, onStop, isStreaming }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleInput(e) {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="editorial-card flex items-end gap-2 rounded-2xl p-2 pl-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message DYORA…"
          className="max-h-[200px] flex-1 resize-none bg-transparent py-2.5 text-[0.95rem] text-[var(--color-ivory-100)] outline-none placeholder:text-[var(--color-ivory-300)]/40"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/20 text-rose-300 hover:bg-rose-400/30 transition-colors"
            aria-label="Stop generating"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-plum-500)] to-[var(--color-plum-700)] text-white disabled:opacity-30 transition-opacity"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
