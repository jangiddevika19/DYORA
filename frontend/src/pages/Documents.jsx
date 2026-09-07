import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Trash2, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DocumentUpload from '../components/documents/DocumentUpload'
import DocumentWorkspace from '../components/documents/DocumentWorkspace'
import { documentService } from '../services/documentService'
import { conversationService } from '../services/conversationService'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const docs = await documentService.list()
      setDocuments(docs)
    } finally {
      setLoading(false)
    }
  }

  function handleUploaded(doc) {
    setDocuments((prev) => [doc, ...prev])
    setActive(doc)
  }

  async function handleDelete(id) {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (active?.id === id) setActive(null)
    await documentService.remove(id)
  }

  async function startChatAboutDocument(doc) {
    const conv = await conversationService.create(`About: ${doc.fileName}`)
    navigate(`/chat/${conv.id}`)
  }

  return (
    <div className="atmospheric-bg h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-gradient-plum" style={{ fontFamily: 'var(--font-display)' }}>
          Document Intelligence
        </h1>
        <p className="mt-1 text-[var(--color-ivory-300)]">
          Upload a PDF, DOCX or TXT file and DYORA will summarize it, answer questions, and generate study material.
        </p>

        <div className="mt-6">
          <DocumentUpload onUploaded={handleUploaded} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 className="mb-3 text-sm font-medium text-[var(--color-ivory-300)]/70">Your documents</h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <motion.button
                  key={doc.id}
                  layout
                  onClick={() => setActive(doc)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                    active?.id === doc.id
                      ? 'border-[var(--color-plum-400)]/50 bg-[var(--color-plum-700)]/15'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <FileText size={16} className="shrink-0 text-[var(--color-plum-300)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--color-ivory-100)]">{doc.fileName}</p>
                    <p className="text-xs text-[var(--color-ivory-300)]/50">
                      {doc.pageCount ? `${doc.pageCount} pages` : doc.fileType}
                    </p>
                  </div>
                  <span
                    onClick={(e) => { e.stopPropagation(); startChatAboutDocument(doc) }}
                    className="rounded-lg p-1.5 text-[var(--color-ivory-300)]/50 hover:text-[var(--color-ivory-100)]"
                  >
                    <MessageSquare size={14} />
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                    className="rounded-lg p-1.5 text-[var(--color-ivory-300)]/50 hover:text-rose-300"
                  >
                    <Trash2 size={14} />
                  </span>
                </motion.button>
              ))}
              {!loading && documents.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--color-ivory-300)]/40">
                  No documents yet. Upload one to get started.
                </p>
              )}
            </div>
          </div>

          <div>
            {active ? (
              <DocumentWorkspace document={active} />
            ) : (
              <div className="editorial-card flex h-full min-h-[300px] items-center justify-center rounded-2xl text-sm text-[var(--color-ivory-300)]/40">
                Select a document to get started
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
