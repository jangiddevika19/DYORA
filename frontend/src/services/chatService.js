import client from '../api/client'

export const chatService = {
  async send({ conversationId, message, documentId }) {
    const { data } = await client.post('/chat', { conversationId, message, documentId })
    return data
  },
}
