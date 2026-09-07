import client from '../api/client'

export const authService = {
  async register({ name, email, password }) {
    const { data } = await client.post('/auth/register', { name, email, password })
    return data
  },
  async login({ email, password }) {
    const { data } = await client.post('/auth/login', { email, password })
    return data
  },
}
