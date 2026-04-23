import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'
import {
  ACADEMIC_OFFERINGS_TABLE,
  CLIENT2_COURSES,
  COMMUNITY_PARTNERSHIPS,
  CULTURE_POINTS,
  FACULTY_AND_ENVIRONMENT,
  MILESTONES,
  OVERVIEW_FACTS,
  PARTNERSHIP_OBJECTIVES,
  PROFILE_INTRO,
  SCHOOL_IMAGES,
  SCHOOL_PROFILE,
  SIGNATURE_PROGRAMS,
  STUDENT_SUCCESS,
  VALUE_DIFFERENTIATORS,
  WHY_CHOOSE_ANVIL,
} from '../content/siteProfile'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ViviFooter from '../components/ViviFooter'
import { FOOTER_GALLERY_IMAGES, SCHOOL_MEDIA_IMAGES } from '../content/schoolMedia'

const FEATURES = [
  {
    k: 'Real projects',
    v: SCHOOL_PROFILE.aboutBody,
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

const ABOUT_STORY_BLOCKS = [
  {
    title: 'Project-based classrooms',
    text: 'Students learn by building websites, robotics prototypes, and practical coding projects with mentor guidance.',
    image: SCHOOL_MEDIA_IMAGES.classA,
  },
  {
    title: 'Creative technology exposure',
    text: 'Learners combine coding with design thinking, communication, and collaboration to solve meaningful challenges.',
    image: SCHOOL_MEDIA_IMAGES.classC,
  },
  {
    title: 'Community and confidence',
    text: 'Our environment helps students present their work, support peers, and grow confidence in their technical abilities.',
    image: SCHOOL_MEDIA_IMAGES.social,
  },
]

export default function AboutPage() {
  const [active, setActive] = useState('Real projects')
  const feature = useMemo(() => FEATURES.find((f) => f.k === active) ?? FEATURES[0], [active])
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)] text-[var(--app-text-primary)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />
        <header className="vivi-page-header">
          <div className="relative h-[220px]">
            <img src={SCHOOL_IMAGES.lab} alt="About" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">About Us</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">
          <section className="mb-10 rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="scroll-reveal scroll-reveal--left">
                  <p className="inline-flex rounded-full bg-[var(--vivi-light)] px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-red)]">
                    About Us
                  </p>
                  <h2 className="vivi-heading mt-3 text-3xl text-[var(--anvil-red)]">Mission, inclusivity, and community impact</h2>
                </div>
                <div className="mt-4 space-y-3 scroll-reveal scroll-reveal--right">
                  <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">{SCHOOL_PROFILE.mission}</p>
                  <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">
                    We are passionate about helping every learner grow through practical tech education, mentorship, and
                    meaningful project work.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">
                    Inclusivity is non-negotiable: our programs welcome all cultures, backgrounds, and learning styles
                    without bias.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">
                    We also run community engagement activities, including a three-month girls training program with
                    certification and graduation.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[...CULTURE_POINTS, 'All programs serve learners aged 5–19 years.'].slice(0, 5).map((pt, idx) => (
                    <div
                      key={pt}
                      className="scroll-reveal scroll-reveal--zoom rounded-xl bg-white/80 p-4 text-sm text-[var(--vivi-muted)] transition hover:-translate-y-0.5"
                      style={{ '--reveal-delay': `${idx * 60}ms` }}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--anvil-red)]">Community</p>
                      <p className="mt-2 font-semibold text-[var(--anvil-red)]">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="scroll-reveal scroll-reveal--right overflow-hidden rounded-xl bg-[var(--anvil-card-faint)] p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative overflow-hidden rounded-xl">
                      <img src={SCHOOL_MEDIA_IMAGES.hero} alt="Coding class in session" className="h-44 w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.35)] via-transparent to-transparent" />
                    </div>
                    <div className="relative overflow-hidden rounded-xl">
                      <img src={SCHOOL_MEDIA_IMAGES.classB} alt="Students learning together" className="h-44 w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.25)] via-transparent to-transparent" />
                    </div>
                    <div className="relative overflow-hidden rounded-xl sm:col-span-2">
                      <img
                        src={SCHOOL_MEDIA_IMAGES.classA}
                        alt="Girls training cohort — certification and graduation"
                        className="h-52 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.32)] via-transparent to-transparent" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { k: 'Ages', v: '5–19 years' },
                      { k: 'Inclusion', v: 'All backgrounds' },
                      { k: 'Community', v: 'Certified programs' },
                    ].map((it) => (
                      <div key={it.k} className="rounded-xl bg-white/90 p-4 text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--anvil-red)]">{it.k}</p>
                        <p className="mt-2 text-sm font-extrabold text-[var(--anvil-red)]">{it.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Profile</p>
            <h1 className="vivi-heading mt-2 text-3xl tracking-tight text-slate-900">{SCHOOL_PROFILE.name}</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-700">{PROFILE_INTRO.lead}</p>
            <p className="mt-2 max-w-3xl text-sm text-slate-700">{PROFILE_INTRO.about}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--anvil-card-faint)] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Focus</p>
                <p className="mt-2 text-sm font-semibold text-[var(--anvil-navy)]">{SCHOOL_PROFILE.focusAges}</p>
                <p className="mt-1 text-xs text-slate-600">Ages</p>
              </div>
              <div className="rounded-xl bg-[var(--anvil-card-faint)] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Pricing</p>
                <p className="mt-2 text-sm font-semibold text-[var(--anvil-navy)]">{SCHOOL_PROFILE.pricing.perCourse}</p>
                <p className="mt-1 text-xs text-slate-600">Pay {SCHOOL_PROFILE.pricing.paymentOptions.join(', ')}</p>
              </div>
              <div className="rounded-xl bg-[var(--anvil-card-faint)] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Duration</p>
                <p className="mt-2 text-sm font-semibold text-[var(--anvil-navy)]">{SCHOOL_PROFILE.pricing.duration}</p>
                <p className="mt-1 text-xs text-slate-600">Per course</p>
              </div>
            </div>
          </section>

          <section className="mb-10 rounded-2xl bg-[var(--anvil-card-faint)] p-5 sm:p-7">
            <div className="mb-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Campus Life</p>
              <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">Learning moments around the academy</h2>
            </div>
            <div className="space-y-4">
              {ABOUT_STORY_BLOCKS.map((story, idx) => (
                <article key={story.title} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className={`grid items-center gap-0 md:grid-cols-2 ${idx % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                    <div className="h-56 md:h-full">
                      <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-red)]">Story {idx + 1}</p>
                      <h3 className="mt-2 text-xl font-black text-[var(--anvil-navy)]">{story.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{story.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-10 overflow-hidden rounded-2xl bg-[var(--anvil-card-faint)] p-5 sm:p-7">
            <div className="mb-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Our Team</p>
              <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">Meet the team</h2>
              <p className="mt-2 text-sm text-[var(--vivi-muted)]">Mentors and staff supporting learners across every program.</p>
            </div>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img src={SCHOOL_MEDIA_IMAGES.meetTheTeam} alt="Meet the team" className="h-[320px] w-full object-cover sm:h-[420px]" />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
          <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{PROFILE_INTRO.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {SCHOOL_PROFILE.aboutLead}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button
                  type="button"
                  key={f.k}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active === f.k
                      ? 'border-transparent bg-[var(--vivi-primary)] text-white'
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
            <div className="mt-4 rounded-xl border border-[#f5d8d1] bg-[var(--vivi-light)] p-4">
              <p className="text-sm font-bold text-[var(--vivi-dark)]">Mission & Vision</p>
              <p className="mt-2 text-sm text-slate-700"><strong>Mission:</strong> {SCHOOL_PROFILE.mission}</p>
              <p className="mt-1 text-sm text-slate-700"><strong>Vision:</strong> {SCHOOL_PROFILE.vision}</p>
            </div>
          </div>

          <div className="scroll-reveal scroll-reveal--zoom vivi-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { k: 'Founded', v: OVERVIEW_FACTS.foundedWhere },
                { k: 'Audience', v: OVERVIEW_FACTS.audience },
                { k: 'Facility', v: OVERVIEW_FACTS.facilitySqFt },
                { k: 'Goal', v: OVERVIEW_FACTS.goal },
              ].map((it) => (
                <div key={it.k} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{it.k}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{it.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Facility highlights</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {OVERVIEW_FACTS.facilityPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Academic offerings</h2>
              <p className="mt-2 text-sm text-slate-600">Age-appropriate pathways from foundations to advanced innovation.</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Focus</th>
                      <th className="px-4 py-3">Skills</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ACADEMIC_OFFERINGS_TABLE.map((row) => (
                      <tr key={row.age}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.age}</td>
                        <td className="px-4 py-3 text-slate-700">{row.focus}</td>
                        <td className="px-4 py-3 text-slate-700">{row.skills}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="scroll-reveal scroll-reveal--zoom vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
              <p className="mt-2 text-sm text-slate-600">Key moments since launch.</p>
              <ol className="mt-4 space-y-3">
                {MILESTONES.map((m) => (
                  <li key={m.year} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--anvil-cyan)]" aria-hidden />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.year}</p>
                      <p className="mt-1 text-sm text-slate-700">{m.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Unique differentiators</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                {VALUE_DIFFERENTIATORS.why.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Curriculum trends</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {VALUE_DIFFERENTIATORS.trends.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="scroll-reveal scroll-reveal--zoom vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Faculty & learning environment</h2>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">Faculty excellence</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {FACULTY_AND_ENVIRONMENT.faculty.map((f) => (
                      <li key={f.label}>
                        <strong>{f.label}:</strong> {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">Facilities</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {FACULTY_AND_ENVIRONMENT.facilities.map((f) => (
                      <li key={f.label}>
                        <strong>{f.label}:</strong> {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Student success & outcomes</h2>
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Highlights</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {STUDENT_SUCCESS.achievements.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-900">Progress tracking</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {STUDENT_SUCCESS.progress.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="scroll-reveal scroll-reveal--zoom vivi-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">Signature programs</h2>
              <div className="mt-3 space-y-3">
                {SIGNATURE_PROGRAMS.map((p) => (
                  <div key={p.title} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold text-slate-900">{p.title}</p>
                    <p className="mt-2 text-sm text-slate-700">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-10 scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">Community engagement & partnerships</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {COMMUNITY_PARTNERSHIPS.map((p) => (
                <div key={p.name} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="mt-2 text-sm text-slate-700">{p.text}</p>
                </div>
              ))}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Partnership objectives</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {PARTNERSHIP_OBJECTIVES.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="scroll-reveal scroll-reveal--up rounded-xl bg-[var(--anvil-card-faint)] p-5">
              <h2 className="text-lg font-semibold text-slate-900">Our Focus</h2>
              <p className="mt-2 text-sm text-slate-700">
                We focus on children and teenagers aged {SCHOOL_PROFILE.focusAges}, with age-appropriate programs that
                progressively build skills from beginner to advanced levels.
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Our mission is to empower the next generation with problem-solving, creativity, innovation, and confidence
                through hands-on technology education.
              </p>
            </div>
            <div className="scroll-reveal scroll-reveal--zoom rounded-xl bg-[var(--anvil-card-faint)] p-5">
              <h2 className="text-lg font-semibold text-slate-900">Why Choose Anvil</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                {WHY_CHOOSE_ANVIL.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-10 rounded-xl bg-[var(--anvil-card-faint)] p-5">
            <h2 className="text-lg font-semibold text-slate-900">Course Pathway Snapshot</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {CLIENT2_COURSES.slice(0, 6).map((c) => (
                <article key={c.title} className="rounded-xl bg-white p-4">
                  <h3 className="text-sm font-black text-[var(--anvil-navy)]">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-700">{c.text}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

