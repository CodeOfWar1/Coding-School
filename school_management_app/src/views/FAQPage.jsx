import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'

const FAQS = [
  {
    q: 'What age groups do you teach?',
    a: 'We work with school students of different levels. In demo mode you can preview the UI without needing real course enrollment.',
  },
  {
    q: 'How do students submit work?',
    a: 'Assignments appear in the Student portal. Students submit code, and instructors grade through Admin tools.',
  },
  {
    q: 'Can parents track progress?',
    a: 'Yes. Parents can select a linked child and view grades, skill balance, schedule highlights, payments, and receipts.',
  },
  {
    q: 'Where do events appear?',
    a: 'Admins publish event dates. Students and parents see them highlighted in their Schedule calendars.',
  },
  {
    q: 'Is messaging available?',
    a: 'Admin can create announcements in the Messages tab for now. The UI is ready for Supabase-based messaging later.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState(FAQS[0]?.q ?? '')
  const items = useMemo(() => FAQS, [])

  return (
    <div className="min-h-screen bg-[var(--app-bg-page)] text-[var(--app-text-primary)]">
      <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">FAQ</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Quick answers about programs, portals, grading, and events.</p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((it) => {
            const isOpen = open === it.q
            return (
              <section key={it.q} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? '' : it.q)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <h2 className="text-base font-bold text-slate-900">{it.q}</h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && <p className="mt-3 text-sm text-slate-600">{it.a}</p>}
              </section>
            )
          })}
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

