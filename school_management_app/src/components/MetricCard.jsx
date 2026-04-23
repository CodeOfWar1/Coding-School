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

  return (
    <div
      style={motion ? { animationDelay: `${animationDelayMs}ms` } : undefined}
      className={`group relative overflow-hidden rounded-2xl shadow-lg ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-2 hover:ring-white/25 focus-within:ring-2 focus-within:ring-white/25 ${color} ring-white/10 ${motion ? 'animate-metric-card' : ''}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 45%, rgba(0,0,0,0.08) 100%)',
        }}
      />
      <div className="relative flex items-start justify-between gap-3 p-5 text-white">
        <div className="min-w-0 flex-1">
          <p className="text-4xl font-black tabular-nums tracking-tight drop-shadow-sm">{value}</p>
          <p className="mt-1 text-sm font-bold uppercase tracking-wide text-white/95">{title}</p>
          {subtitle && <p className="mt-2 text-xs leading-relaxed text-white/80">{subtitle}</p>}
        </div>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner backdrop-blur-sm ring-1 ring-white/30"
          aria-hidden
        >
          {icon}
        </span>
      </div>
      {interactive ? (
        <button
          type="button"
          onClick={onMoreInfo}
          className="relative w-full cursor-pointer border-t border-white/15 bg-black/15 py-3 text-center text-sm font-semibold text-white transition hover:bg-black/25 active:bg-black/30"
        >
          {foot}
          <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
        </button>
      ) : (
        <div className="relative w-full border-t border-white/15 bg-black/10 py-3 text-center text-sm font-semibold text-white/90">
          {foot}
        </div>
      )}
    </div>
  )
}
