import { useCallback, useEffect, useState } from 'react'

/**
 * Simple unread inbox flag persisted in sessionStorage (per user + scope).
 * @param {string | null} userId
 * @param {string} scope — e.g. 'student', 'parent'
 */
export function useMessageInbox(userId, scope) {
  const key = userId ? `myschool_msg_${scope}_${userId}` : `myschool_msg_${scope}_anon`

  const [read, setRead] = useState(() => {
    try {
      return sessionStorage.getItem(key) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, read ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [key, read])

  const markRead = useCallback(() => setRead(true), [])
  const markUnread = useCallback(() => setRead(false), [])

  const unreadCount = read ? 0 : 1

  return { unreadCount, markRead, markUnread, read }
}
