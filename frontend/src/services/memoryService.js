import client from '../api/client'

export const memoryService = {
  async list() {
    const { data } = await client.get('/memory')
    return data
  },
  async remove(id) {
    await client.delete(`/memory/${id}`)
  },
  async clearAll() {
    await client.delete('/memory')
  },
}
