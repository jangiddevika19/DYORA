import client from '../api/client'

export const documentService = {
  async upload(file, onProgress) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await client.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total))
      },
    })
    return data
  },
  async list() {
    const { data } = await client.get('/documents')
    return data
  },
  async get(id) {
    const { data } = await client.get(`/documents/${id}`)
    return data
  },
  async remove(id) {
    await client.delete(`/documents/${id}`)
  },
  async ask(id, question) {
    const { data } = await client.post(`/documents/${id}/ask`, { question })
    return data.answer
  },
  async summary(id) {
    const { data } = await client.post(`/documents/${id}/summary`)
    return data.summary
  },
  async mcqs(id, count = 10) {
    const { data } = await client.post(`/documents/${id}/mcqs?count=${count}`)
    return data.mcqs
  },
  async flashcards(id) {
    const { data } = await client.post(`/documents/${id}/flashcards`)
    return data.flashcards
  },
  async notes(id) {
    const { data } = await client.post(`/documents/${id}/notes`)
    return data.notes
  },
  async studyPlan(id, timeframe = '3 days') {
    const { data } = await client.post(`/documents/${id}/study-plan?timeframe=${encodeURIComponent(timeframe)}`)
    return data.studyPlan
  },
}
