/** Landing-aligned metric tile — navy/orange/cream (matches About / Programs sections). */
function accentFromColorProp(color = '') {
  const c = String(color)
  if (c.includes('blue')) return 'from-[#2d3f5d] to-[#1a2542]'
  if (c.includes('green')) return 'from-emerald-600 to-teal-700'
  if (c.includes('orange')) return 'from-[#faa853] to-[#f28c38]'
  if (c.includes('red')) return 'from-rose-600 to-red-700'
  if (c.includes('slate')) return 'from-[#2d3f5d] to-[#3f5780]'
  if (c.includes('indigo')) return 'from-[#2d3f5d] to-[#1a2542]'
  if (c.includes('amber')) return 'from-[#faa853] to-[#e89235]'
  return 'from-[#2d3f5d] to-[#1a2542]'
}

export default function MetricCard({
  color,
  value,
  title,
  icon,
  foot = 'More info',
  subtitle,
  onMoreInfo,
  animationDelayMs = 0,
  motion = true,
}) {
  const interactive = typeof onMoreInfo === 'function'
  const accent = accentFromColorProp(color)

  return (
    <div
      style={motion ? { animationDelay: `${animationDelayMs}ms` } : undefined}
      className={`group relative overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-[0_16px_48px_-20px_rgba(45,63,93,0.14)] ring-1 ring-secondary/10 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_22px_50px_-16px_rgba(45,63,93,0.18)] hover:ring-primary/10 ${motion ? 'animate-fade-in-up' : ''}`}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-black tabular-nums tracking-tight text-secondary md:text-4xl">{value}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{title}</p>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-gray-600">{subtitle}</p>}
        </div>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-xl text-primary shadow-md ring-1 ring-white/20"
          aria-hidden
        >
          {icon}
        </span>
      </div>
      {interactive ? (
        <button
          type="button"
          onClick={onMoreInfo}
          className="relative w-full cursor-pointer border-t border-secondary/10 bg-gradient-to-r from-[#f8fbff]/90 to-[#fff8ef]/80 py-3 text-center text-sm font-semibold text-secondary transition hover:from-[#fff8ef] hover:to-[#f8fbff] hover:text-primary"
        >
          {foot}
          <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
        </button>
      ) : (
        <div className="relative w-full border-t border-secondary/10 bg-[#f8fbff]/60 py-3 text-center text-sm font-semibold text-gray-600">
          {foot}
        </div>
      )}
    </div>
  )
}
