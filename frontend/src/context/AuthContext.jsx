import { createContext, useCallback, useEffect, useState } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('dyora_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('dyora_user', JSON.stringify(user))
    else localStorage.removeItem('dyora_user')
  }, [user])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('dyora_token', data.token)
      const nextUser = { id: data.userId, name: data.name, email: data.email }
      setUser(nextUser)
      return nextUser
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const data = await authService.register(payload)
      localStorage.setItem('dyora_token', data.token)
      const nextUser = { id: data.userId, name: data.name, email: data.email }
      setUser(nextUser)
      return nextUser
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dyora_token')
    localStorage.removeItem('dyora_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
