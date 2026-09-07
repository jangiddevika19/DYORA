import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dyora_theme') || 'DARK')

  useEffect(() => {
    localStorage.setItem('dyora_theme', theme)
    document.documentElement.dataset.theme = theme.toLowerCase()
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
