import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNavbar from '../components/SiteNavbar'

const PROGRAMS = [
  {
    id: 'foundations',
    title: 'Foundations',
    level: 'Beginner',
    desc: 'Build confidence with loops, conditions, and problem-solving basics.',
    bullets: ['Python essentials', 'Kid-safe projects', 'Weekly checkpoints'],
    color: 'from-sky-600 to-indigo-600',
  },
  {
    id: 'builder',
    title: 'Project Builder',
    level: 'Intermediate',
    desc: 'Turn ideas into real apps with debugging habits and clean structure.',
    bullets: ['Capstone mini-apps', 'Code reviews', 'Feedback & iteration'],
    color: 'from-indigo-600 to-violet-600',
  },
  {
    id: 'challenge',
    title: 'Challenge Track',
    level: 'Advanced',
    desc: 'Practice for interviews and competitions with tests and performance.',
    bullets: ['Testing mindset', 'Performance basics', 'Stretch assignments'],
    color: 'from-emerald-600 to-teal-600',
  },
]

export default function ProgramsPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PROGRAMS
    return PROGRAMS.filter((p) => {
      const hay = `${p.title} ${p.level} ${p.desc} ${p.bullets.join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query])

  return (
    <div className="min-h-screen bg-[var(--app-bg-page)] text-[var(--app-text-primary)]">
      <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Programs</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Choose a track that matches your learner&apos;s level. We focus on real projects, strong debugging, and
            consistent feedback.
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2"
            placeholder="Search programs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {filtered.map((p) => (
            <section key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`rounded-xl bg-gradient-to-br ${p.color} p-1`}>
                <div className="rounded-xl bg-white/95 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{p.level}</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">{p.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-700">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex rounded-xl bg-[var(--app-brand)] px-4 py-2.5 text-sm font-bold text-white shadow hover:brightness-110"
                    >
                      Sign in to enroll
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

