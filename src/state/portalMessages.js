const KEY = 'myschool_portal_messages_v1'

function nowIso() {
  return new Date().toISOString()
}

export function listPortalMessages() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function listMessagesForRole(role) {
  const target = String(role || '').toLowerCase()
  return listPortalMessages()
    .filter((m) => m.target === 'all' || m.target === target)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function createPortalMessage({ title, body, target = 'all', author = 'admin' }) {
  const next = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || '').trim(),
    body: String(body || '').trim(),
    target: String(target || 'all'),
    author,
    created_at: nowIso(),
  }
  if (!next.title || !next.body) return null
  const prev = listPortalMessages()
  const merged = [next, ...prev].slice(0, 200)
  localStorage.setItem(KEY, JSON.stringify(merged))
  return next
}
