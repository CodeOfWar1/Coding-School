import { useMemo, useState } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

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

  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-secondary/15 bg-gradient-to-b from-white via-[#f8fbff]/80 to-[#fff8ef]/30 shadow-lg shadow-secondary/[0.08] ring-1 ring-primary/10">
      <div
        className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary"
        aria-hidden
      />
      <div className="border-b border-secondary/10 bg-gradient-to-r from-secondary/[0.08] via-primary/[0.06] to-secondary/[0.08] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? (
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg shadow-secondary/25 ring-2 ring-white">
                <FaCalendarAlt className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-heading text-lg font-bold tracking-tight text-secondary">{title}</h3>
            </div>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-secondary/15 bg-white shadow-md shadow-secondary/[0.06]">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="flex items-center justify-center px-2.5 py-2 text-secondary transition hover:bg-[#f8fbff] hover:text-primary"
                aria-label="Previous month"
              >
                <FaChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="flex min-w-[11rem] items-center justify-center border-x border-secondary/10 bg-gradient-to-b from-[#fff8ef]/90 to-white px-3 py-2 font-heading text-sm font-bold tabular-nums text-secondary sm:min-w-[12.5rem] sm:text-base">
                {label}
              </span>
              <button
                type="button"
                onClick={() => shift(1)}
                className="flex items-center justify-center px-2.5 py-2 text-secondary transition hover:bg-[#f8fbff] hover:text-primary"
                aria-label="Next month"
              >
                <FaChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl bg-gradient-to-r from-secondary to-[#243652] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-secondary/30 ring-1 ring-primary/25 transition hover:from-[#243652] hover:to-secondary hover:shadow-lg"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-transparent to-[#f8fbff]/40 px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="grid grid-cols-7 gap-x-1.5 gap-y-2 sm:gap-x-2 sm:gap-y-2.5">
          {weekdays.map((w, wi) => (
            <div
              key={w}
              className={[
                'rounded-lg pb-1.5 pt-1 text-center font-heading text-[10px] font-bold uppercase tracking-[0.12em] sm:text-[11px]',
                wi === 0 || wi === 6
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary/10 text-secondary/75',
              ].join(' ')}
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const key =
              d != null ? `${year}-${month}-${d}` : `pad-${i}`
            const isHi = d != null && highlightSet.has(`${year}-${month}-${d}`)
            const isToday =
              d != null &&
              year === todayY &&
              month === todayM &&
              d === todayD
            const dow = d != null ? new Date(year, month, d).getDay() : -1
            const isWeekend = dow === 0 || dow === 6

            if (d == null) {
              return <div key={key} className="min-h-[2.75rem] sm:min-h-[3rem]" aria-hidden />
            }

            const weekendBase =
              isWeekend && !isHi
                ? 'border-primary/15 bg-gradient-to-b from-[#fff8ef]/90 to-[#fff3e0]/50 hover:border-primary/30 hover:from-[#fff8ef] hover:to-[#fff0d9]'
                : !isHi
                  ? 'border-secondary/[0.08] bg-gradient-to-b from-[#f8fbff]/90 to-white hover:border-primary/25 hover:from-[#f0f7ff] hover:to-[#fffbf5]'
                  : ''

            return (
              <div
                key={key}
                title={isHi ? 'Deadline or school event' : undefined}
                className={[
                  'flex min-h-[2.75rem] flex-col items-center justify-center rounded-xl border px-0.5 py-1.5 transition sm:min-h-[3rem] sm:py-2',
                  isHi
                    ? 'border-secondary/30 bg-gradient-to-b from-secondary/20 via-secondary/[0.12] to-primary/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]'
                    : weekendBase,
                  isToday && !isHi
                    ? 'border-primary/50 bg-gradient-to-b from-[#fff8ef] to-[#ffe8c8]/90 ring-2 ring-primary/40'
                    : '',
                  isToday && isHi ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-[#fff8ef]' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'font-heading text-[13px] tabular-nums sm:text-sm',
                    isHi
                      ? 'font-bold text-secondary'
                      : isWeekend && !isToday
                        ? 'font-semibold text-secondary'
                        : 'font-semibold text-secondary/90',
                  ].join(' ')}
                >
                  {d}
                </span>
                {isHi ? (
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(250,168,83,0.25)]"
                    aria-hidden
                  />
                ) : (
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" aria-hidden />
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-secondary/10 pt-3 text-[11px] text-secondary/65">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/5 px-2 py-0.5">
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-secondary/40 to-secondary/70" aria-hidden />
            Mon–Fri tint
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-secondary">
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-[#e89235]" aria-hidden />
            Weekend tint
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_2px_rgba(250,168,83,0.35)]" aria-hidden />
            Deadline or event
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2 py-0.5">
            <span
              className="h-2 w-2 rounded-full bg-white ring-2 ring-primary ring-offset-1 ring-offset-amber-100"
              aria-hidden
            />
            Today
          </span>
        </p>
      </div>
    </div>
  )
}
