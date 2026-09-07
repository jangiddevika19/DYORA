import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, PanelRightOpen, PanelRightClose } from 'lucide-react'
import DyoraOrb from '../components/orb/DyoraOrb'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import { conversationService } from '../services/conversationService'
import { chatService } from '../services/chatService'
import { documentService } from '../services/documentService'
import DocumentWorkspace from '../components/documents/DocumentWorkspace'

const INTENT_PROMPTS = {
  plan: 'Help me create a structured plan. What should it be for?',
  code: "I'm ready to help with code. What are you working on?",
  interview: "Let's prepare for your interview. Which role or subject are you targeting?",
  resume: 'Paste your resume text (or describe your background) and I\u2019ll suggest concrete improvements.',
  notes: 'Tell me the topic and I\u2019ll create clean, structured notes for you.',
  write: "What would you like help writing today — an email, a post, a message?",
}

export default function Chat() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refresh } = useOutletContext()

  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [linkedDocument, setLinkedDocument] = useState(null)
  const [showDocPanel, setShowDocPanel] = useState(false)
  const [orbState, setOrbState] = useState('idle')
  const scrollRef = useRef(null)
  const lastUserMessageRef = useRef('')

  useEffect(() => {
    if (!id) {
      setMessages([])
      const intent = searchParams.get('intent')
      if (intent && INTENT_PROMPTS[intent]) {
        setMessages([{
          id: 'intro',
          role: 'ASSISTANT',
          content: INTENT_PROMPTS[intent],
        }])
      }
      return
    }
    loadConversation(id)
  }, [id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function loadConversation(conversationId) {
    setLoadingHistory(true)
    setError('')
    try {
      const [conv, msgs] = await Promise.all([
        conversationService.get(conversationId),
        conversationService.messages(conversationId),
      ])
      setMessages(msgs)
      if (conv.linkedDocumentId) {
        const doc = await documentService.get(conv.linkedDocumentId).catch(() => null)
        setLinkedDocument(doc)
      } else {
        setLinkedDocument(null)
      }
    } catch (e) {
      setError('Could not load this conversation.')
    } finally {
      setLoadingHistory(false)
    }
  }

  async function handleSend(text) {
    lastUserMessageRef.current = text
    setError('')
    const userMsg = { id: `local-${Date.now()}`, role: 'USER', content: text }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)
    setOrbState('thinking')
    try {
      const res = await chatService.send({
        conversationId: id ? Number(id) : undefined,
        message: text,
        documentId: linkedDocument?.id,
      })
      setOrbState('responding')
      setMessages((prev) => [...prev, {
        id: res.messageId,
        role: 'ASSISTANT',
        content: res.content,
        responseType: res.responseType,
        detectedMood: res.detectedMood,
      }])
      if (!id) {
        await refresh()
        navigate(`/chat/${res.conversationId}`, { replace: true })
      } else {
        refresh()
      }
    } catch (e) {
      setError(e.friendlyMessage || 'DYORA could not respond right now. Please try again.')
      setOrbState('error')
    } finally {
      setSending(false)
      setTimeout(() => setOrbState('idle'), 1200)
    }
  }

  async function handleRegenerate() {
    if (!lastUserMessageRef.current) return
    setMessages((prev) => prev.slice(0, -1))
    await handleSend(lastUserMessageRef.current)
  }

  async function handleRetry() {
    setError('')
    if (lastUserMessageRef.current) await handleSend(lastUserMessageRef.current)
  }

  const isEmpty = messages.length === 0 && !loadingHistory

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
          <div className="flex items-center gap-3">
            <DyoraOrb state={orbState} size={40} />
            <span className="text-sm font-medium text-[var(--color-ivory-200)]">DYORA</span>
          </div>
          {linkedDocument && (
            <button
              onClick={() => setShowDocPanel((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[var(--color-ivory-300)] hover:bg-white/5"
            >
              {showDocPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              {linkedDocument.fileName}
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {isEmpty && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <DyoraOrb state="idle" size={140} />
              <p className="mt-4 text-[var(--color-ivory-300)]">Ask me anything to get started.</p>
            </div>
          )}
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                isLast={i === messages.length - 1 && m.role === 'ASSISTANT'}
                onRegenerate={handleRegenerate}
              />
            ))}
            {sending && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-plum-300)]">DYORA</span>
                <TypingIndicator />
              </div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
              >
                <span className="flex items-center gap-2"><AlertTriangle size={14} /> {error}</span>
                <button onClick={handleRetry} className="rounded-lg bg-rose-400/10 px-3 py-1 text-xs hover:bg-rose-400/20">
                  Retry
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSend={handleSend} disabled={sending} isStreaming={false} />
          </div>
        </div>
      </div>

      {showDocPanel && linkedDocument && (
        <div className="hidden w-96 border-l border-white/5 p-4 lg:block">
          <DocumentWorkspace document={linkedDocument} />
        </div>
      )}
    </div>
  )
}
