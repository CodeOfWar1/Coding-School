import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mergeLandingSiteRow } from '../utils/landingContentMerge'

/**
 * Loads merged landing/gallery/partners CMS from `landing_content` (public read).
 * Falls back to code defaults when offline or row missing.
 */
export function useLandingSiteContent() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(() => mergeLandingSiteRow(null))
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: row, error: qErr } = await supabase.from('landing_content').select('*').limit(1).maybeSingle()
        if (cancelled) return
        if (qErr) setError(qErr.message)
        setData(mergeLandingSiteRow(row))
      } catch (e) {
        if (!cancelled) {
          setError(String(e))
          setData(mergeLandingSiteRow(null))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { loading, data, error }
}
