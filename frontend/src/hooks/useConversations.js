import { useCallback, useEffect, useState } from 'react'
import { conversationService } from '../services/conversationService'

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await conversationService.list()
      setConversations(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { conversations, loading, refresh, setConversations }
}
