import { useEffect } from 'react'

export function useKeyboardShortcut(combo, callback) {
  useEffect(() => {
    function handler(e) {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      if (combo === 'ctrl+k' && isCtrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        callback(e)
      } else if (combo === 'escape' && e.key === 'Escape') {
        callback(e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [combo, callback])
}
