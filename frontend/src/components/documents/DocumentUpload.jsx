import { useCallback, useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { documentService } from '../../services/documentService'

export default function DocumentUpload({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    const allowed = ['.pdf', '.txt', '.docx']
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError('Please upload a PDF, DOCX or TXT file.')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15MB.')
      return
    }
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const doc = await documentService.upload(file, setProgress)
      onUploaded(doc)
    } catch (e) {
      setError(e.friendlyMessage || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
        dragOver ? 'border-[var(--color-plum-400)] bg-[var(--color-plum-700)]/10' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <>
          <Loader2 className="animate-spin text-[var(--color-plum-300)]" size={28} />
          <p className="text-sm text-[var(--color-ivory-300)]">Uploading… {progress}%</p>
        </>
      ) : (
        <>
          <UploadCloud className="text-[var(--color-plum-300)]" size={28} />
          <p className="text-sm text-[var(--color-ivory-200)]">Drag & drop a PDF, DOCX or TXT file, or click to browse</p>
          <p className="text-xs text-[var(--color-ivory-300)]/50">Max 15MB</p>
        </>
      )}
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  )
}
