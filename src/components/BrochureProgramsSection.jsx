import { COURSE_BROCHURE_COLUMNS, PROGRAM_TRACKS } from '../content/siteProfile'

// Brochure-style 3-column program layout (white / royal / periwinkle).
// Matches the visual rhythm from your brochure screenshots: heading + "For ages" + description.
export default function BrochureProgramsSection({ query = '' }) {
  const q = query.trim().toLowerCase()

  const columns = COURSE_BROCHURE_COLUMNS
    .map((col) => {
      if (!q) return col
      const courses = col.courses.filter((c) => {
        const hay = `${c.title} ${c.ages} ${c.desc}`.toLowerCase()
        return hay.includes(q)
      })
      return { ...col, courses }
    })
    .filter((col) => col.courses.length)

  const tracksByTitle = new Map(PROGRAM_TRACKS.map((t) => [t.title.toLowerCase(), t]))

  return (
    <div className="relative">
      <div className="anvil-deco-lines hidden md:flex" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} />
        ))}
      </div>

      <div className="grid gap-0 divide-y divide-black/0 lg:grid-cols-3 lg:divide-y-0 lg:divide-x lg:divide-black/5">
        {columns.map((col) => {
          const columnCls =
            col.tone === 'white'
              ? 'anvil-course-col-white'
              : col.tone === 'royal'
                ? 'anvil-course-col-royal'
                : 'anvil-course-col-periwinkle'

          return (
            <div
              key={col.tone}
              className={`${columnCls} relative p-6 md:p-8 lg:p-10`}
              style={{ minHeight: 520 }}
            >
              <div className="space-y-12">
                {col.courses.map((c) => {
                  // Keep ages/desc aligned with PROGRAM_TRACKS if titles match.
                  const fallback = tracksByTitle.get(c.title.toLowerCase())
                  const ages = fallback?.age ?? c.ages
                  const desc = fallback?.desc ?? c.desc

                  return (
                    <article key={c.title} className="scroll-reveal scroll-reveal--up">
                      <h3 className="text-xl font-black leading-snug md:text-2xl">{c.title}</h3>
                      <p className="anvil-age-pill mt-2">For ages {ages}</p>
                      <p
                        className={`mt-3 text-base leading-relaxed ${
                          col.tone === 'royal' ? 'text-white/85' : 'text-[var(--vivi-muted)]'
                        }`}
                      >
                        {desc}
                      </p>
                    </article>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

