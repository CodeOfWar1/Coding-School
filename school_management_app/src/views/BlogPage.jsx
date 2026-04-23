import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'
import { SCHOOL_IMAGES, SCHOOL_PROFILE } from '../content/siteProfile'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ViviFooter from '../components/ViviFooter'
import { FOOTER_GALLERY_IMAGES } from '../content/schoolMedia'

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

  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)] text-[var(--app-text-primary)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />
        <header className="vivi-page-header">
          <div className="relative h-[220px]">
            <img src={SCHOOL_IMAGES.hero} alt="Blog" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">Blog</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-4 sm:px-6">
        <div className="mb-6">
          <h1 className="vivi-heading text-3xl tracking-tight text-slate-900">Blog</h1>
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
          {filtered.map((p, idx) => (
            <article
              key={p.id}
              className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ '--reveal-delay': `${idx * 70}ms` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">{p.tag}</p>
              <h2 className="mt-2 text-lg font-black text-slate-900">{p.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{p.excerpt}</p>
              <p className="mt-4 text-xs text-slate-500">
                {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <button
                type="button"
                className="vivi-btn vivi-btn-primary mt-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow"
                onClick={() => alert('Demo blog page — wire to real posts when Supabase is connected.')}
              >
                Read more
              </button>
            </article>
          ))}
        </div>
        </main>
        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

