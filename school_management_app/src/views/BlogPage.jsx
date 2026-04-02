import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'

const POSTS = [
  {
    id: 'p1',
    title: 'How debugging becomes a superpower',
    date: '2026-03-01',
    tag: 'Learning',
    excerpt: 'Learn why reading errors is more important than memorizing solutions — and how we practice it daily.',
  },
  {
    id: 'p2',
    title: 'Projects that keep students motivated',
    date: '2026-03-18',
    tag: 'Projects',
    excerpt: 'A guide to building small wins: from first loop to a complete mini-app students feel proud of.',
  },
  {
    id: 'p3',
    title: 'What parents should look for in feedback',
    date: '2026-04-01',
    tag: 'Parents',
    excerpt: 'Clear feedback patterns help learners improve every week. Here are the signals we focus on.',
  },
]

export default function BlogPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return POSTS
    return POSTS.filter((p) => `${p.title} ${p.tag} ${p.excerpt}`.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="min-h-screen bg-[var(--app-bg-page)] text-[var(--app-text-primary)]">
      <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Blog</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Resources for students and parents — learning tips, project ideas, and feedback best practices.
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2"
            placeholder="Search blog…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">{p.tag}</p>
              <h2 className="mt-2 text-lg font-black text-slate-900">{p.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{p.excerpt}</p>
              <p className="mt-4 text-xs text-slate-500">
                {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <button
                type="button"
                className="mt-4 rounded-xl px-4 py-2 text-sm font-bold text-white shadow hover:brightness-110"
                style={{ background: 'var(--app-brand)' }}
                onClick={() => alert('Demo blog page — wire to real posts when Supabase is connected.')}
              >
                Read more
              </button>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-sm text-slate-600">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-slate-900">Mandakh Coding School</p>
          <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

