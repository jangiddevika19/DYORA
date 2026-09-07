import client from '../api/client'

export const moodService = {
  async analyze(text) {
    const { data } = await client.post('/mood/analyze', { text })
    return data
  },
}
