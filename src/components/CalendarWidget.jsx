import { useMemo, useState } from 'react'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function padMonth(y, m) {
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const daysInMonth = last.getDate()
  const startPad = first.getDay()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return { cells, year: y, month: m }
}

/** @param {Date | string | number} raw */
function toYmd(raw) {
  const dt = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(dt.getTime())) return null
  return { y: dt.getFullYear(), m: dt.getMonth(), day: dt.getDate() }
}

export default function CalendarWidget({ title = 'Schedule', highlightDates = [] }) {
  const now = new Date()
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const { cells, year, month } = useMemo(
    () => padMonth(view.y, view.m),
    [view.y, view.m],
  )

  const label = new Date(year, month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const highlightSet = useMemo(() => {
    const set = new Set()
    for (const raw of highlightDates) {
      const ymd = toYmd(raw)
      if (ymd) set.add(`${ymd.y}-${ymd.m}-${ymd.day}`)
    }
    return set
  }, [highlightDates])

  function shift(delta) {
    const d = new Date(year, month + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  function goToday() {
    const t = new Date()
    setView({ y: t.getFullYear(), m: t.getMonth() })
  }

  return (
    <div className="w-full max-w-full rounded border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2 py-2 sm:px-3">
        {title ? (
          <h3 className="min-w-0 shrink text-sm font-semibold text-slate-800 sm:text-base">{title}</h3>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center justify-end gap-1 text-[10px] sm:text-xs">
          <button
            type="button"
            onClick={goToday}
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shift(-1)}
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100"
            aria-label="Next month"
          >
            ›
          </button>
          <span className="ml-1 hidden font-medium text-slate-700 sm:ml-2 sm:inline">{label}</span>
        </div>
      </div>
      <p className="px-2 pt-1 text-[10px] text-slate-500 sm:hidden">{label}</p>
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[17.5rem] grid-cols-7 gap-px bg-slate-200 p-1.5 text-center text-[10px] sm:min-w-0 sm:p-2 sm:text-xs">
          {weekdays.map((w) => (
            <div key={w} className="bg-slate-100 py-0.5 font-semibold text-slate-600 sm:py-1">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const key =
              d != null ? `${year}-${month}-${d}` : `pad-${i}`
            const isHi = d != null && highlightSet.has(`${year}-${month}-${d}`)
            return (
              <div
                key={key}
                className={`flex min-h-[1.75rem] items-center justify-center bg-white py-0.5 sm:min-h-[2.25rem] sm:py-1 ${
                  d && isHi
                    ? 'font-semibold text-white ring-1 ring-blue-500 bg-blue-600'
                    : 'text-slate-800'
                }`}
              >
                {d ?? ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
