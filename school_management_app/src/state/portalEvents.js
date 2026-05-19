export const PORTAL_EVENTS_STORAGE_KEY = 'myschool_portal_events_v1'

const KEY = PORTAL_EVENTS_STORAGE_KEY

/** Same-tab + cross-component refresh when events change (parent/student calendars listen). */
export const PORTAL_EVENTS_CHANGED = 'myschool-portal-events-changed'

function notifyPortalEventsChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PORTAL_EVENTS_CHANGED))
}

function nowIso() {
  return new Date().toISOString()
}

export function listPortalEvents() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function createPortalEvent({ title, date, target = 'all', author = 'admin' }) {
  const nextTitle = String(title || '').trim()
  const nextTarget = String(target || 'all').toLowerCase()
  const allowed = ['all', 'student', 'parent']
  const safeTarget = allowed.includes(nextTarget) ? nextTarget : 'all'

  const dt = new Date(date)
  if (Number.isNaN(dt.getTime())) return null

  // Store only the date portion (calendar highlight uses y-m-d).
  const ymd = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
    dt.getDate(),
  ).padStart(2, '0')}`

  const next = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: nextTitle,
    target: safeTarget,
    date: `${ymd}T00:00:00.000Z`,
    author,
    created_at: nowIso(),
  }

  if (!next.title) return null
  const prev = listPortalEvents()
  const merged = [next, ...prev].slice(0, 200)
  localStorage.setItem(KEY, JSON.stringify(merged))
  notifyPortalEventsChanged()
  return next
}

