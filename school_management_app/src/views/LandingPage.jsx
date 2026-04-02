import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isDemoMode, supabase } from '../lib/supabase'
import PaymentRegistrationModal from '../components/PaymentRegistrationModal'
import SiteNavbar from '../components/SiteNavbar'

const SCHOOL_IMG_PRIMARY = '/media/school/images.jpg'
const SCHOOL_IMG_SECONDARY = '/media/school/download.jpg'

const DEFAULT = {
  hero_title: 'Learn to code. Submit tasks. Track progress.',
  hero_text:
    'A full portal for students, parents, finance staff, and admins — with secure login, role-based dashboards, payments, receipts, coding tasks, and deadlines.',
  hero_image_url: SCHOOL_IMG_PRIMARY,
}

const PARTNERS = [
  {
    name: 'Community partners',
    text: 'Local organizations that support student learning, events, and mentorship.',
    image: SCHOOL_IMG_PRIMARY,
    alt: 'School community partnership',
  },
  {
    name: 'Industry & education',
    text: 'Teams that help shape our curriculum, workshops, and career pathways.',
    image: SCHOOL_IMG_SECONDARY,
    alt: 'Education and industry collaboration',
  },
]

export default function LandingPage() {
  const [hero, setHero] = useState(DEFAULT)
  const [paymentOpen, setPaymentOpen] = useState(false)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.from('landing_content').select('*').eq('id', 1).maybeSingle()
      if (!cancelled && data) {
        setHero({
          hero_title: data.hero_title || DEFAULT.hero_title,
          hero_text: data.hero_text || DEFAULT.hero_text,
          hero_image_url: data.hero_image_url || DEFAULT.hero_image_url,
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--app-bg-hero)] text-white">
      <PaymentRegistrationModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <div className="relative min-h-[90vh] overflow-hidden">
        <img
          src={hero.hero_image_url}
          alt="School hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'var(--app-bg-hero-overlay)' }} />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'var(--app-hero-gradient)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
          <SiteNavbar variant="hero" onRegisterPay={() => setPaymentOpen(true)} sticky />

          <section className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16 lg:mt-14">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-[3.25rem]">{hero.hero_title}</h1>
              <p className="mt-6 max-w-xl text-lg text-white/85">{hero.hero_text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOpen(true)}
                  className="rounded-xl bg-[var(--app-accent)] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-fuchsia-900/30 hover:brightness-110"
                >
                  Get started
                </button>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold backdrop-blur hover:bg-white/20"
                >
                  View dashboards
                </Link>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'Tasks', v: 'Assignments + code submissions' },
                  { k: 'Payments', v: 'Receipts + history tracking' },
                  { k: 'RBAC', v: 'Role-based access control' },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15"
                  >
                    <p className="text-sm font-bold">{x.k}</p>
                    <p className="mt-1 text-xs text-white/75">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                <div className="grid gap-0 sm:grid-cols-2">
                  <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[200px]">
                    <img
                      src={SCHOOL_IMG_PRIMARY}
                      alt="Campus and learning"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <div className="relative aspect-[4/3] border-t border-white/10 sm:border-t-0 sm:border-l sm:aspect-auto sm:min-h-[200px]">
                    <img
                      src={SCHOOL_IMG_SECONDARY}
                      alt="Students and programs"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold">What you get</h2>
                  <ul className="mt-4 space-y-3 text-sm text-white/88">
                    <li><strong>Students</strong>: tasks, submissions, grades, feedback, calendar</li>
                    <li><strong>Parents</strong>: per-child progress, tasks, payments, receipts</li>
                    <li><strong>Finance</strong>: verify transactions, filter reporting, receipts</li>
                    <li><strong>Admin</strong>: users/roles, tasks, grading, landing content</li>
                  </ul>
                  <p className="mt-5 rounded-lg bg-slate-950/35 px-3 py-2 text-xs text-white/65">
                    Backend: Supabase (PostgreSQL + Auth + Storage).
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="border-t border-white/10 bg-[var(--app-bg-section-dark)] py-[var(--space-16)]">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Partners</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black text-white">Partners of the school</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            We work with organizations that share our mission — quality coding education, inclusion, and pathways into
            tech. Interested in collaborating? Reach out through our registration or office channels.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {PARTNERS.map((p) => (
              <article
                key={p.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 shadow-xl transition hover:border-sky-500/40 hover:shadow-sky-900/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white drop-shadow-md">{p.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-300">{p.text}</p>
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(true)}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-sky-400 hover:text-sky-300"
                  >
                    Enroll & pay →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-[var(--space-16)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">How Mandakh works</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-600">
                Students learn by building. Parents get clear progress visibility. Admin and finance teams
                keep everything structured and trackable.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  ['Step 1', 'Join a program track'],
                  ['Step 2', 'Submit code after each assignment'],
                  ['Step 3', 'Grades and feedback update the portal'],
                  ['Step 4', 'Schedule and events stay in sync'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-700">{k}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Quick program snapshot</h3>
              <p className="mt-2 text-sm text-slate-600">Pick a track level and start building right away.</p>
              <div className="mt-5 grid gap-4">
                {[
                  { t: 'Foundations', d: 'Loops, conditions, and starter projects.' },
                  { t: 'Project Builder', d: 'Mini apps, debugging, and feedback cycles.' },
                  { t: 'Challenge Track', d: 'Testing mindset and advanced assignments.' },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-sky-500/30">
                    <p className="text-sm font-black text-slate-900">{x.t}</p>
                    <p className="mt-1 text-sm text-slate-600">{x.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setPaymentOpen(true)}
                  className="app-btn-primary"
                >
                  Register + Pay
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Registration requires a signed-in account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-bg-page)] py-[var(--space-16)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Trusted by families</h2>
              <p className="mt-3 text-sm text-slate-600">
                Clear feedback, real progress, and a schedule that stays up-to-date.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ['Weekly feedback', 'Clear next steps after every submission.'],
                  ['Modern learning', 'Project-based tasks in the portal.'],
                  ['Admin visibility', 'Track graded scores and activity.'],
                  ['Event sync', 'Calendar highlights for students and parents.'],
                ].map(([t, d]) => (
                  <div key={t} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
                    <p className="text-sm font-bold text-slate-900">{t}</p>
                    <p className="mt-1 text-sm text-slate-600">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Resources</h2>
              <p className="mt-3 text-sm text-slate-600">Blog highlights and answers to common questions.</p>
              <div className="mt-5 grid gap-4">
                <button
                  type="button"
                  onClick={() => window.location.assign('/blog')}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5"
                >
                  <p className="text-sm font-black text-slate-900">Latest blog posts</p>
                  <p className="mt-1 text-sm text-slate-600">Debugging mindset, project motivation, and parent guidance.</p>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign('/faq')}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5"
                >
                  <p className="text-sm font-black text-slate-900">FAQ</p>
                  <p className="mt-1 text-sm text-slate-600">Programs, submissions, grading, events, and messaging.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--app-bg-hero-deep)] text-[var(--app-text-on-dark)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/media/Logo.png" alt="" className="h-10 w-10 rounded-lg bg-white/10 p-0.5 ring-1 ring-white/20" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">Mandakh</p>
                  <p className="text-lg font-black tracking-tight text-white">Coding School</p>
                </div>
              </div>
              <p className="mt-3 max-w-xs text-sm text-slate-400">
                Built for students, parents, finance teams, and admin staff — with a portal that stays in sync.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Programs</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <Link to="/programs" className="block hover:text-white">Foundations</Link>
                <Link to="/programs" className="block hover:text-white">Project Builder</Link>
                <Link to="/programs" className="block hover:text-white">Challenge Track</Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Company</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <Link to="/about" className="block hover:text-white">About</Link>
                <Link to="/blog" className="block hover:text-white">Blog</Link>
                <Link to="/faq" className="block hover:text-white">FAQ</Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>Support: support@mandakh.local</p>
                <p>Phone: +1 (000) 000-0000</p>
                <p className="pt-2 text-xs text-slate-500">© {new Date().getFullYear()} Mandakh Coding School</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
