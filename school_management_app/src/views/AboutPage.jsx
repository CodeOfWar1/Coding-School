import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'

const FEATURES = [
  {
    k: 'Real projects',
    v: 'We teach by building. Every lesson ends with a small working outcome.',
  },
  {
    k: 'Structured feedback',
    v: 'You get clear feedback on what to keep and what to improve next.',
  },
  {
    k: 'Debugging mindset',
    v: 'We train students to read errors, reason step-by-step, and iterate.',
  },
  {
    k: 'Supportive community',
    v: 'Small cohorts, respectful learning, and motivation that lasts.',
  },
]

export default function AboutPage() {
  const [active, setActive] = useState('Real projects')
  const feature = useMemo(() => FEATURES.find((f) => f.k === active) ?? FEATURES[0], [active])

  return (
    <div className="min-h-screen bg-[var(--app-bg-page)] text-[var(--app-text-primary)]">
      <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">About Mandakh</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Mandakh is a coding school built around clarity: strong fundamentals, real-world projects, and feedback
            that helps students improve every week.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Our approach</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick a focus area to see what it means in practice.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button
                  type="button"
                  key={f.k}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active === f.k
                      ? 'border-transparent bg-sky-600 text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                  onClick={() => setActive(f.k)}
                >
                  {f.k}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">{feature.k}</p>
              <p className="mt-2 text-sm text-slate-700">{feature.v}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
            <ol className="mt-3 space-y-3">
              {[
                ['1. Learn', 'Short teaching + live examples.'],
                ['2. Build', 'Students implement small parts and combine them.'],
                ['3. Submit', 'Code submissions go into the portal for review.'],
                ['4. Improve', 'Feedback updates help the next attempt get better.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                    <span
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{ background: 'var(--app-brand)' }}
                    >
                    {title.split('.')[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-sm font-semibold">Ready to start?</p>
              <p className="mt-1 text-sm text-white/80">Sign in and use “Register + Pay” on the homepage.</p>
            </div>
          </div>
        </section>
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

