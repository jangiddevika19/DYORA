import client from '../api/client'

export const settingsService = {
  async get() {
    const { data } = await client.get('/settings')
    return data
  },
  async update(payload) {
    await client.put('/settings', payload)
  },
}
