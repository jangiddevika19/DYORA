import client from '../api/client'

export const conversationService = {
  async list() {
    const { data } = await client.get('/conversations')
    return data
  },
  async create(title) {
    const { data } = await client.post('/conversations', title ? { title } : {})
    return data
  },
  async get(id) {
    const { data } = await client.get(`/conversations/${id}`)
    return data
  },
  async rename(id, title) {
    const { data } = await client.patch(`/conversations/${id}`, { title })
    return data
  },
  async remove(id) {
    await client.delete(`/conversations/${id}`)
  },
  async messages(id) {
    const { data } = await client.get(`/conversations/${id}/messages`)
    return data
  },
}
