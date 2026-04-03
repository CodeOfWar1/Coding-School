import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isDemoMode, supabase } from '../lib/supabase'
import PaymentRegistrationModal from '../components/PaymentRegistrationModal'
import SiteNavbar from '../components/SiteNavbar'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  ACADEMIC_OFFERINGS_TABLE,
  COMMUNITY_PARTNERSHIPS,
  COURSE_BROCHURE_COLUMNS,
  CULTURE_POINTS,
  FACILITIES,
  FACULTY_AND_ENVIRONMENT,
  MILESTONES,
  MISSION_VISION_VALUES,
  OVERVIEW_FACTS,
  PARTNERSHIP_OBJECTIVES,
  PROFILE_INTRO,
  PROGRAM_TRACKS,
  SIGNATURE_PROGRAMS,
  SCHOOL_IMAGES,
  SCHOOL_PROFILE,
  STUDENT_SUCCESS,
  VALUE_DIFFERENTIATORS,
} from '../content/siteProfile'

const CODE_SNIPPET = `<h1>Welcome to Anvil Coding Academy</h1>
<nav class="hero">
  <ul>
    <li>Python</li>
    <li>Robotics</li>
    <li>Web</li>
  </ul>
</nav>`

const DEFAULT = {
  hero_title: SCHOOL_PROFILE.heroTitle,
  hero_text: SCHOOL_PROFILE.heroSubtitle,
  hero_image_url: SCHOOL_IMAGES.hero,
}


const FACILITY_IMAGE_BY_ID = {
  projects: SCHOOL_IMAGES.classA,
  mentor: SCHOOL_IMAGES.classB,
  community: SCHOOL_IMAGES.classC,
  innovation: SCHOOL_IMAGES.lab,
}

const GALLERY_IMAGES = [
  SCHOOL_IMAGES.hero,
  SCHOOL_IMAGES.lab,
  SCHOOL_IMAGES.classA,
  SCHOOL_IMAGES.classB,
  SCHOOL_IMAGES.classC,
]

export default function LandingPage() {
  const [hero, setHero] = useState(DEFAULT)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -8% 0px', threshold: 0.06 })

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
      ; (async () => {
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

  useEffect(() => {
    if (!isDemoMode) return
    const raw = localStorage.getItem('landing_content_override')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      const t = window.setTimeout(() => setHero((prev) => ({ ...prev, ...parsed })), 0)
      return () => window.clearTimeout(t)
    } catch {
      // ignore invalid local demo data
    }
  }, [])

  const heroSlides = useMemo(
    () => [
      {
        title: hero.hero_title,
        text: hero.hero_text,
        image: hero.hero_image_url || SCHOOL_IMAGES.hero,
        cta: 'Learn more',
      },
      {
        title: 'Welcome to Anvil Coding Academy',
        text: SCHOOL_PROFILE.description,
        image: SCHOOL_IMAGES.classB,
        cta: 'Our programs',
      },
      {
        title: 'Hands-on technology education',
        text: PROFILE_INTRO.lead,
        image: SCHOOL_IMAGES.classA,
        cta: 'About us',
      },
    ],
    [hero],
  )

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5500)
    return () => window.clearInterval(id)
  }, [heroSlides.length])

  return (
    <div ref={revealRef} className="vivi-page min-h-screen">
      <PaymentRegistrationModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <SiteNavbar variant="light" onRegisterPay={() => setPaymentOpen(true)} sticky />

      {/* Hero — geometric overlay + code atmosphere */}
      <section className="relative overflow-hidden">
        <div className="anvil-hero-wrap relative h-[520px] lg:h-[600px]">
          <div className="anvil-hero-shapes" aria-hidden>
            <div className="anvil-shape anvil-shape-a" />
            <div className="anvil-shape anvil-shape-b" />
          </div>
          <pre className="anvil-hero-code" aria-hidden>
            {CODE_SNIPPET}
          </pre>
          {heroSlides.map((s, idx) => (
            <div
              key={s.title}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === slide ? 'z-[3] opacity-100' : 'z-[3] opacity-0'}`}
            >
              <img src={s.image} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 z-[4] flex items-center">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
              <div className="max-w-xl">
                {heroSlides.map((s, idx) => (
                  <div key={s.title} className={idx === slide ? 'block' : 'hidden'}>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--anvil-cyan-bright)]">
                      {SCHOOL_PROFILE.tagline}
                    </p>
                    <h1 className="vivi-heading mt-3 text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">{s.title}</h1>
                    <p className="mt-4 text-base leading-relaxed text-white/90">{s.text}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to="/about"
                        className="vivi-btn rounded-full bg-[var(--anvil-cyan)] px-7 py-3 text-sm font-bold text-[var(--anvil-navy-deep)] shadow-lg transition hover:brightness-105"
                      >
                        {s.cta}
                      </Link>
                      <Link
                        to="/programs"
                        className="vivi-btn rounded-full border-2 border-white/80 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                      >
                        View classes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden justify-center lg:flex">
                <div className="anvil-diamond-frame">
                  <img src={SCHOOL_IMAGES.classC} alt="Students learning with technology" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-5 right-5 z-[5] flex gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === slide ? 'w-10 bg-[var(--anvil-cyan)]' : 'w-8 bg-white/50'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Introduction — light gray band + split typography */}
      <section className="scroll-reveal border-b border-[var(--anvil-periwinkle)] bg-[var(--anvil-slate)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <p className="font-mono text-sm font-bold text-[var(--anvil-royal)]">&lt;h2&gt;{PROFILE_INTRO.title}&lt;/h2&gt;</p>
              <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-navy)] md:text-4xl">{PROFILE_INTRO.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--vivi-muted)]">{PROFILE_INTRO.lead}</p>
            </div>
            <div className="lg:col-span-8">
              <p className="text-base font-medium text-[var(--anvil-navy)]">{PROFILE_INTRO.about}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {PROFILE_INTRO.specialties.map((line) => (
                  <li
                    key={line}
                    className="rounded-2xl border border-[var(--anvil-royal)]/15 bg-white p-4 text-sm text-[var(--vivi-muted)] shadow-sm transition hover:border-[var(--anvil-cyan)]/40 hover:shadow-md"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Overview — navy editorial strip */}
      <section className="scroll-reveal bg-[var(--anvil-navy)] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="anvil-editorial gap-10 md:gap-14">
            <div className="hidden md:block">
              <span className="anvil-vertical-label">Overview</span>
            </div>
            <div>
              <h2 className="vivi-heading text-3xl text-white md:hidden">Overview</h2>
              <p className="mt-2 text-sm uppercase tracking-widest text-[var(--anvil-cyan-bright)]">{OVERVIEW_FACTS.foundedWhere}</p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/90">{OVERVIEW_FACTS.visionShort}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">Audience</p>
                  <p className="mt-2 text-sm text-white/85">{OVERVIEW_FACTS.audience}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">Campus</p>
                  <p className="mt-2 text-sm text-white/85">{OVERVIEW_FACTS.facilitySqFt} of learning space.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">Goal</p>
                  <p className="mt-2 text-sm text-white/85">{OVERVIEW_FACTS.goal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brochure — three columns */}
      <section className="scroll-reveal relative overflow-hidden bg-white py-16 md:py-24">
        <div className="anvil-deco-lines hidden md:flex" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} />
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-royal)]">Academic offerings</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-navy)] md:text-4xl">Our courses by track</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">Nine pathways across three learning bands—aligned with our brochure.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {COURSE_BROCHURE_COLUMNS.map((col) => (
              <div
                key={col.tone}
                className={`relative overflow-hidden rounded-3xl p-2 shadow-xl ${col.tone === 'white'
                  ? 'anvil-course-col-white ring-1 ring-black/5'
                  : col.tone === 'royal'
                    ? 'anvil-course-col-royal'
                    : 'anvil-course-col-periwinkle ring-1 ring-[var(--anvil-royal)]/10'
                  }`}
              >
                <div className="space-y-4 p-4">
                  {col.courses.map((c) => (
                    <article key={c.title} className={`anvil-course-card ${col.tone === 'royal' ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-[2px]`}>
                      <h3 className="text-lg font-black leading-snug">{c.title}</h3>
                      <p className="anvil-age-pill mt-2">For ages {c.ages}</p>
                      <p className={`mt-3 text-sm leading-relaxed ${col.tone === 'royal' ? 'text-white/90' : 'text-[var(--vivi-muted)]'}`}>{c.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / vision / values */}
      <section className="scroll-reveal bg-gradient-to-br from-[var(--anvil-periwinkle-soft)] via-white to-[var(--anvil-slate)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Mission, vision &amp; values</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--vivi-muted)]">{MISSION_VISION_VALUES.mission}</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--vivi-muted)]">{MISSION_VISION_VALUES.vision}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MISSION_VISION_VALUES.values.map((v) => (
                <div key={v.title} className="rounded-2xl border-l-4 border-[var(--anvil-cyan)] bg-white p-4 shadow-sm">
                  <p className="font-bold text-[var(--anvil-navy)]">{v.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--vivi-muted)]">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="scroll-reveal py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="vivi-heading text-center text-3xl text-[var(--anvil-navy)]">Milestones</h2>
          <div className="mx-auto mt-12 max-w-3xl space-y-8">
            {MILESTONES.map((m, idx) => (
              <div
                key={m.year}
                className="scroll-reveal flex gap-4"
                style={{ '--reveal-delay': `${idx * 80}ms` }}
              >
                <div className="anvil-timeline-dot" />
                <div>
                  <p className="font-mono text-sm font-bold text-[var(--anvil-royal)]">{m.year}</p>
                  <p className="mt-1 text-sm text-[var(--vivi-muted)]">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic table — card grid */}
      <section className="scroll-reveal bg-[var(--anvil-navy)] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-sm text-[var(--anvil-cyan-bright)]">&lt;h2&gt;Academic Offerings&lt;/h2&gt;</p>
              <h2 className="vivi-heading text-3xl text-white">Programs by age band</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ACADEMIC_OFFERINGS_TABLE.map((row) => (
              <div key={row.age} className="scroll-reveal rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">{row.age}</p>
                <p className="mt-2 text-lg font-bold">{row.focus}</p>
                <p className="mt-3 text-sm text-white/80">{row.skills}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <p className="text-sm font-bold text-[var(--anvil-cyan-bright)]">Signature programs</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {SIGNATURE_PROGRAMS.map((s, idx) => (
                <div
                  key={s.title}
                  className="scroll-reveal rounded-2xl bg-white/10 p-5"
                  style={{ '--reveal-delay': `${idx * 70}ms` }}
                >
                  <p className="font-bold">{s.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/85">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators — zig-zag */}
      <section className="scroll-reveal py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="vivi-heading text-center text-3xl text-[var(--anvil-navy)]">Why Anvil</h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div
              className="scroll-reveal rounded-3xl bg-[var(--anvil-slate)] p-8"
              style={{ '--reveal-delay': '60ms' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-royal)]">Value differentiators</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--vivi-muted)]">
                {VALUE_DIFFERENTIATORS.why.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-[var(--anvil-cyan)]">▹</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="scroll-reveal rounded-3xl border-2 border-[var(--anvil-cyan)]/30 bg-white p-8 shadow-lg"
              style={{ '--reveal-delay': '140ms' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-teal)]">Adapting to tech trends</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--vivi-muted)]">
                {VALUE_DIFFERENTIATORS.trends.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-[var(--anvil-royal)]">◆</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty + environment */}
      <section className="scroll-reveal bg-gradient-to-b from-white to-[var(--anvil-periwinkle-soft)] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img src={SCHOOL_IMAGES.lab} alt="Computer lab" className="h-full min-h-[280px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--anvil-navy)]/80 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-bold text-white">Faculty &amp; learning environment</p>
            </div>
            <div>
              <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Excellence on campus</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Faculty</p>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--vivi-muted)]">
                    {FACULTY_AND_ENVIRONMENT.faculty.map((f) => (
                      <li key={f.label}>
                        <strong className="text-[var(--anvil-navy)]">{f.label}:</strong> {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Facilities</p>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--vivi-muted)]">
                    {FACULTY_AND_ENVIRONMENT.facilities.map((f) => (
                      <li key={f.label}>
                        <strong className="text-[var(--anvil-navy)]">{f.label}:</strong> {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--anvil-royal)]/25 bg-white/60 p-4 text-xs text-[var(--vivi-muted)]">
                <strong className="text-[var(--anvil-navy)]">Campus snapshot:</strong> {OVERVIEW_FACTS.facilityPoints.join(' ')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student success */}
      <section className="scroll-reveal bg-[var(--anvil-navy-deep)] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-[var(--anvil-cyan-bright)]">06</p>
              <h2 className="vivi-heading mt-2 text-3xl text-white">Student success &amp; outcomes</h2>
              <p className="mt-4 text-sm text-white/75">Achievements and how families stay informed.</p>
            </div>
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">Highlights</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                {STUDENT_SUCCESS.achievements.map((a, idx) => (
                  <li
                    key={a}
                    className="scroll-reveal"
                    style={{ '--reveal-delay': `${idx * 70}ms` }}
                  >
                    • {a}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs font-bold uppercase tracking-wider text-[var(--anvil-cyan-bright)]">Progress tracking</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                {STUDENT_SUCCESS.progress.map((a, idx) => (
                  <li
                    key={a}
                    className="scroll-reveal"
                    style={{ '--reveal-delay': `${idx * 70 + 60}ms` }}
                  >
                    • {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section className="scroll-reveal py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="vivi-heading text-center text-3xl text-[var(--anvil-navy)]">Community &amp; partnerships</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--vivi-muted)]">
            Strategic alliances that strengthen access, inclusion, and real-world learning.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {COMMUNITY_PARTNERSHIPS.map((p) => (
              <div key={p.name} className="scroll-reveal rounded-2xl border border-[var(--anvil-royal)]/15 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <p className="font-bold text-[var(--anvil-navy)]">{p.name}</p>
                <p className="mt-2 text-sm text-[var(--vivi-muted)]">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-[var(--anvil-slate)] p-6">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-[var(--anvil-royal)]">Shared objectives</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--vivi-muted)]">
              {PARTNERSHIP_OBJECTIVES.map((o) => (
                <li key={o}>✓ {o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="scroll-reveal border-y border-[var(--anvil-periwinkle)] bg-[var(--anvil-light)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-royal)]">School facilities</p>
          <h2 className="vivi-heading mx-auto mt-2 max-w-2xl text-center text-3xl text-[var(--anvil-navy)]">Built for builders</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((item, idx) => (
              <article
                key={item.id}
                className="scroll-reveal group relative rounded-2xl bg-white p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                style={{ '--reveal-delay': `${idx * 60}ms` }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--anvil-periwinkle-soft)] text-2xl transition group-hover:scale-110">
                  {FACILITY_ICON[item.id] ?? '⭐'}
                </div>
                <img
                  src={FACILITY_IMAGE_BY_ID[item.id]}
                  alt={`${item.title} image`}
                  className="mx-auto mt-4 h-20 w-20 rounded-2xl object-cover ring-1 ring-[var(--anvil-royal)]/10 bg-white/60 transition group-hover:scale-105"
                />
                <h3 className="mt-4 font-bold text-[var(--anvil-navy)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--vivi-muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing + quick program list */}
      <section className="scroll-reveal py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--anvil-royal-deep)] to-[var(--anvil-teal)] p-[1px] shadow-2xl">
            <div className="rounded-[calc(1.5rem-1px)] bg-white p-8 md:p-12">
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Tuition &amp; payment flexibility</h2>
                  <p className="mt-4 text-4xl font-black text-[var(--anvil-royal)]">{SCHOOL_PROFILE.pricing.perCourse}</p>
                  <p className="mt-2 text-sm text-[var(--vivi-muted)]">
                    Pay in installments: {SCHOOL_PROFILE.pricing.paymentOptions.join(' · ')}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(true)}
                    className="vivi-btn mt-8 rounded-full bg-[var(--anvil-cyan)] px-8 py-3 text-sm font-bold text-[var(--anvil-navy-deep)] shadow-lg transition hover:brightness-105"
                  >
                    Register + pay
                  </button>
                  <p className="mt-3 text-xs text-[var(--vivi-muted)]">Account sign-in required for registration.</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Also explore</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {PROGRAM_TRACKS.slice(0, 6).map((x) => (
                      <div key={x.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-[var(--anvil-cyan)]/50">
                        <p className="text-sm font-bold text-[var(--anvil-navy)]">{x.title}</p>
                        <p className="text-xs text-[var(--anvil-teal)]">{x.age}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="scroll-reveal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid overflow-hidden rounded-3xl shadow-xl lg:grid-cols-2">
            <div className="relative min-h-[300px]">
              <img src={SCHOOL_IMAGES.hero} alt="Students" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[var(--anvil-navy)]/25" />
            </div>
            <div className="flex flex-col justify-center bg-[var(--anvil-periwinkle-soft)] p-10">
              <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Meet our future innovators</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--vivi-muted)]">
                From first steps in Scratch to full-stack projects—mentors guide every milestone.
              </p>
              <Link
                to="/programs"
                className="vivi-btn mt-6 inline-flex w-fit rounded-full bg-[var(--anvil-royal)] px-8 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                Explore programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Culture strip */}
      <section className="scroll-reveal py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {CULTURE_POINTS.map((v, idx) => (
              <span
                key={idx}
                className="scroll-reveal rounded-full border border-[var(--anvil-royal)]/20 bg-white px-4 py-2 text-xs font-semibold text-[var(--anvil-navy)] shadow-sm"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment */}
      <section className="scroll-reveal bg-[var(--anvil-slate)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Book an appointment</h2>
              <p className="mt-2 text-sm text-[var(--vivi-muted)]">We’ll recommend a course, schedule, and next steps.</p>
              <form
                className="mt-6 grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Thanks! We will contact you shortly.')
                }}
              >
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Guardian name" required />
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Guardian email" type="email" required />
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Learner name" required />
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Learner age" required />
                <textarea className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Message" rows={4} />
                <button
                  type="submit"
                  className="vivi-btn sm:col-span-2 w-full rounded-full bg-[var(--anvil-royal)] py-3 text-sm font-bold text-white"
                >
                  Submit
                </button>
              </form>
            </div>
            <div className="relative min-h-[320px]">
              <img src={SCHOOL_IMAGES.classA} alt="Learning environment" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="scroll-reveal py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Families &amp; learners</h2>
            <p className="mt-2 text-sm text-[var(--vivi-muted)]">What our community values most.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              { name: 'Parent', text: 'Clear progress tracking and supportive tutors. My child is excited to learn.', accent: 'from-[var(--anvil-royal)]/10' },
              { name: 'Student', text: 'I built my first game and learned how to debug. I want to build more.', accent: 'from-[var(--anvil-cyan)]/15' },
              { name: 'Guardian', text: 'Practical learning and impressive portfolio projects—in a safe environment.', accent: 'from-[var(--anvil-teal)]/15' },
            ].map((t) => (
              <div
                key={t.name}
                className={`scroll-reveal rounded-2xl bg-gradient-to-br ${t.accent} to-white p-6 shadow-lg ring-1 ring-black/5`}
              >
                <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">“{t.text}”</p>
                <p className="mt-4 text-sm font-bold text-[var(--anvil-navy)]">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners visual */}
      <section className="scroll-reveal bg-[var(--anvil-navy)] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-cyan-bright)]">Partners</p>
          <h2 className="vivi-heading mx-auto mt-2 max-w-2xl text-center text-3xl text-white">Industry &amp; schools</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { name: 'Lusaka International School', text: 'STEAM alignment and learner support.', img: SCHOOL_IMAGES.hero },
              { name: 'Trinade Technologies', text: 'Mentorship and real-world project pathways.', img: SCHOOL_IMAGES.lab },
              { name: 'Family Development Initiatives', text: 'Community impact and access programs.', img: SCHOOL_IMAGES.classB },
            ].map((p) => (
              <article key={p.name} className="scroll-reveal group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={p.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--anvil-navy-deep)] to-transparent opacity-90" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-lg font-bold text-white">{p.name}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-white/80">{p.text}</p>
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(true)}
                    className="mt-3 text-sm font-semibold text-[var(--anvil-cyan-bright)] hover:underline"
                  >
                    Enroll →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="scroll-reveal py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-3xl bg-[var(--anvil-periwinkle-soft)] p-8 md:grid-cols-3 md:text-center">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Address</p>
              <p className="mt-1 text-sm text-[var(--vivi-muted)]">{SCHOOL_PROFILE.contact.address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Phone</p>
              <p className="mt-1 text-sm text-[var(--vivi-muted)]">{SCHOOL_PROFILE.contact.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[var(--anvil-royal)]">Email</p>
              <p className="mt-1 text-sm text-[var(--vivi-muted)]">{SCHOOL_PROFILE.contact.email}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="vivi-footer mt-6">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/media/Logo.png" alt="" className="h-10 w-10 rounded-lg bg-white/10 p-0.5 ring-1 ring-white/20" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">Anvil</p>
                  <p className="text-lg font-black tracking-tight text-white">{SCHOOL_PROFILE.name}</p>
                </div>
              </div>
              <p className="mt-3 max-w-xs text-sm text-white/70">{SCHOOL_PROFILE.tagline}</p>
              <p className="mt-3 text-sm text-white/65">{SCHOOL_PROFILE.description}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Quick links</p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <Link to="/about" className="block hover:text-[var(--anvil-cyan-bright)]">
                  About
                </Link>
                <Link to="/programs" className="block hover:text-[var(--anvil-cyan-bright)]">
                  Classes
                </Link>
                <Link to="/faq" className="block hover:text-[var(--anvil-cyan-bright)]">
                  FAQ
                </Link>
                <Link to="/contact" className="block hover:text-[var(--anvil-cyan-bright)]">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Gallery</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {GALLERY_IMAGES.map((src, idx) => (
                  <img key={idx} src={src} alt="" className="h-16 w-full rounded-lg object-cover ring-1 ring-white/10" />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Newsletter</p>
              <p className="mt-3 text-sm text-white/70">Course launches and holiday bootcamps.</p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Thanks for subscribing!')
                }}
              >
                <input
                  className="w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none"
                  placeholder="Your email"
                  type="email"
                  required
                />
                <button
                  type="submit"
                  className="vivi-btn shrink-0 rounded-full bg-[var(--anvil-cyan)] px-5 py-3 text-sm font-bold text-[var(--anvil-navy-deep)]"
                >
                  Join
                </button>
              </form>
              <p className="mt-6 text-xs text-white/50">
                © {new Date().getFullYear()} {SCHOOL_PROFILE.name}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
