import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import RegisterModal from '../components/RegisterModal'
import SiteNavbar from '../components/SiteNavbar'
import ViviFooter from '../components/ViviFooter'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { FACILITIES, NEWSLETTER_CONTENT, SCHOOL_PROFILE } from '../content/siteProfile'
import { FOOTER_GALLERY_IMAGES, PARTNER_LOGOS, PROGRAM_CARD_IMAGES, SCHOOL_MEDIA_IMAGES } from '../content/schoolMedia'
import heroAsset from '../assets/hero.png'

const ASSET_IMAGES = {
  hero: SCHOOL_MEDIA_IMAGES.hero,
  lab: SCHOOL_MEDIA_IMAGES.lab,
  classA: SCHOOL_MEDIA_IMAGES.classA,
  classB: SCHOOL_MEDIA_IMAGES.classB,
  classC: SCHOOL_MEDIA_IMAGES.classC,
  social: SCHOOL_MEDIA_IMAGES.social,
}

const DEFAULT_HERO = {
  hero_title: SCHOOL_PROFILE.heroTitle,
  hero_text: SCHOOL_PROFILE.heroSubtitle,
  hero_image_url: ASSET_IMAGES.hero,
}

const FACILITY_IMAGE_BY_ID = {
  projects: SCHOOL_MEDIA_IMAGES.projectBased,
  mentor: ASSET_IMAGES.classB,
  community: ASSET_IMAGES.social,
  innovation: ASSET_IMAGES.lab,
}

const slideButtonClass =
  'h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--anvil-cyan)]/40'

const TESTIMONIALS = [
  {
    name: 'Parent',
    text: 'Clear progress tracking and supportive tutors. My child is excited to learn.',
  },
  {
    name: 'Student',
    text: 'I built my first game and learned how to debug. Now I want to build more.',
  },
  {
    name: 'Guardian',
    text: 'Great environment and practical learning. The portfolio projects are impressive.',
  },
]

const TEAM = [
  { name: 'Ms. Nawa', role: 'Lead Instructor', img: SCHOOL_MEDIA_IMAGES.team1 },
  { name: 'Mr. Zulu', role: 'Robotics Mentor', img: SCHOOL_MEDIA_IMAGES.team2 },
  { name: 'Mrs. Chanda', role: 'Web Development Coach', img: SCHOOL_MEDIA_IMAGES.team3 },
  { name: 'Tapiwa', role: 'Web Development', img: SCHOOL_MEDIA_IMAGES.team3 },
  { name: 'Sivogwani', role: 'Robotics / Python', img: SCHOOL_MEDIA_IMAGES.team2 },
  { name: 'Mwango', role: 'Digital Literacy', img: SCHOOL_MEDIA_IMAGES.team1 },
]

const CORE_CLASS_OFFERINGS = [
  { id: 'digital-literacy', title: 'Digital Literacy', age: '5-19 years', summary: 'Computer basics, productivity tools, and safe online habits.' },
  { id: 'python', title: 'Python', age: '10-19 years', summary: 'From beginner coding to app and automation projects.' },
  { id: 'robotics', title: 'Robotics', age: '8-19 years', summary: 'Build, program, and test robots in practical team projects.' },
  { id: 'visual-programming', title: 'Visual Programming', age: '5-12 years', summary: 'Block-based coding that develops logic and sequencing skills.' },
  { id: 'game-design', title: 'Game Design', age: '9-19 years', summary: 'Design and build interactive games while learning core coding concepts.' },
  { id: 'web-development', title: 'Web Development', age: '12-19 years', summary: 'Create modern websites with HTML, CSS, and JavaScript.' },
  { id: 'cybersecurity', title: 'Cybersecurity', age: '12-19 years', summary: 'Learn digital safety, threat awareness, and responsible security practices.' },
  { id: 'ai', title: 'Artificial Intelligence', age: '12-19 years', summary: 'Explore machine learning basics through child-friendly projects.' },
]

const GALLERY_SHOWCASE = [
  { title: 'Coding Projects', text: 'Students showcasing websites, apps, and coding challenges.', img: SCHOOL_MEDIA_IMAGES.hero },
  { title: 'Robotics Build Day', text: 'Hands-on robotics labs and collaborative prototype sessions.', img: SCHOOL_MEDIA_IMAGES.lab },
  { title: 'Girls Tech Cohort', text: 'Three-month girls training program with graduation certificates.', img: SCHOOL_MEDIA_IMAGES.classA },
  { title: 'Community Outreach', text: 'Parent engagement, digital literacy talks, and youth workshops.', img: SCHOOL_MEDIA_IMAGES.social },
  { title: 'Game Design Studio', text: 'Creative storytelling and interactive game development.', img: SCHOOL_MEDIA_IMAGES.classB },
  { title: 'Classroom Events', text: 'Hack-day activities, showcases, and celebration events.', img: SCHOOL_MEDIA_IMAGES.classC },
]

/** Home “About” teaser — images + short value lines (mirrors academy pillars). */
const ABOUT_TEASER_VALUES = [
  {
    title: 'Hands-on learning',
    text: 'Projects, not just slides — build real skills from day one.',
    img: SCHOOL_MEDIA_IMAGES.hero,
  },
  {
    title: 'Mentorship',
    text: 'Coaches who guide, encourage, and celebrate progress.',
    img: SCHOOL_MEDIA_IMAGES.classB,
  },
  {
    title: 'Inclusive community',
    text: 'Welcoming every background; we grow better together.',
    img: SCHOOL_MEDIA_IMAGES.social,
  },
  {
    title: 'Innovation & robotics',
    text: 'Robotics, code, and creative problem-solving for ages 5–19.',
    img: SCHOOL_MEDIA_IMAGES.lab,
  },
]

const INITIAL_PARENT_FEEDBACK = [
  { name: 'Parent - Grade 6', text: 'The project-based lessons helped my child become confident with technology.' },
  { name: 'Guardian - Teen Program', text: 'Communication is clear, and we can see strong improvement every term.' },
]

function getTrackImage(trackId) {
  const imageByTrack = {
    'digital-literacy': PROGRAM_CARD_IMAGES.digitalLiteracy,
    python: PROGRAM_CARD_IMAGES.python,
    robotics: PROGRAM_CARD_IMAGES.robotics,
    'visual-programming': PROGRAM_CARD_IMAGES.visualProgramming,
    'game-design': PROGRAM_CARD_IMAGES.gameDesign,
    'web-development': PROGRAM_CARD_IMAGES.webDevelopment,
    cybersecurity: PROGRAM_CARD_IMAGES.cybersecurity,
    ai: PROGRAM_CARD_IMAGES.ai,
  }
  return imageByTrack[trackId] ?? ASSET_IMAGES.classA
}

export default function ViviLandingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [hero, setHero] = useState(DEFAULT_HERO)
  const [slide, setSlide] = useState(0)
  const [feedbackList, setFeedbackList] = useState(INITIAL_PARENT_FEEDBACK)
  const [feedbackForm, setFeedbackForm] = useState({ name: '', message: '' })

  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06, once: false })

  useEffect(() => {
    setHero(DEFAULT_HERO)
  }, [])

  const heroSlides = useMemo(
    () => [
      {
        title: hero.hero_title,
        text: hero.hero_text,
        image: SCHOOL_MEDIA_IMAGES.bookAppointment,
        objectPosition: 'center 25%',
        primaryCta: 'Learn More',
        secondaryCta: 'Our Classes',
      },
      {
        title: 'Make A Brighter Future For Your Child',
        text: SCHOOL_PROFILE.description,
        image: ASSET_IMAGES.lab,
        primaryCta: 'Our Classes',
        secondaryCta: 'Book Appointment',
      },
    ],
    [hero],
  )

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 9000)
    return () => window.clearInterval(id)
  }, [heroSlides.length])

  return (
    <div ref={revealRef} className="vivi-page anvil-dynamic-bg min-h-screen bg-[var(--vivi-light)]">
      <RegisterModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-[0_18px_55px_rgba(26,50,82,0.14)] ring-1 ring-[color:color-mix(in_srgb,var(--anvil-cyan)_24%,white)]">
        <SiteNavbar variant="light" onRegisterPay={() => setPaymentOpen(true)} sticky showRegisterPay />

        {/* Carousel Start (vivi/index.html) */}
        <section className="relative h-[560px] overflow-hidden lg:h-[640px]">
        {heroSlides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${idx === slide ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            aria-hidden={idx !== slide}
          >
            <img
              src={s.image}
              alt=""
              style={{ objectPosition: s.objectPosition ?? 'center' }}
              className={`h-full w-full object-cover transition-transform duration-[9000ms] ease-out ${
                idx === slide ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-[rgba(16,34,52,0.46)]" />
          </div>
        ))}

        <img
          src={heroAsset}
          alt=""
          aria-hidden
          className="absolute right-[-80px] top-1/2 hidden h-[360px] w-[360px] -translate-y-1/2 opacity-10 blur-[1px] lg:block"
        />
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--anvil-cyan-bright)]">{SCHOOL_PROFILE.tagline}</p>

              <div className="relative mt-3 min-h-[11rem] sm:min-h-[12.5rem]">
                {heroSlides.map((s, idx) => (
                  <div
                    key={idx}
                    aria-hidden={idx !== slide}
                    className={`transition-opacity duration-[1200ms] ease-in-out ${
                      idx === slide ? 'relative z-10 opacity-100' : 'pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0'
                    }`}
                  >
                    <h1
                      className="vivi-heading text-4xl leading-tight !text-white sm:text-5xl lg:text-6xl"
                    >
                      {s.title}
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-white/90">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="vivi-btn rounded-full bg-[var(--anvil-cyan)] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-105 sm:px-7"
                >
                  Learn more
                </Link>
                <Link
                  to="/programs"
                  className="vivi-btn rounded-full border-2 border-white/80 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:px-7"
                >
                  Our classes
                </Link>
                <button
                  type="button"
                  onClick={() => setPaymentOpen(true)}
                  className="vivi-btn rounded-full border-2 border-white/90 bg-white px-6 py-3 text-sm font-bold text-[var(--anvil-navy)] shadow-md transition hover:bg-white/95 sm:px-7"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlide(idx)}
              className={`${slideButtonClass} ${idx === slide ? 'w-10 bg-[var(--anvil-cyan)]' : 'w-8 bg-white/50'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        </section>

        {/* Facilities Start */}
        <section className="py-14 bg-[var(--anvil-light)]/60">
          <div className="px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-royal)]">School Facilities</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">Learning built around real outcomes</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              A modern environment for coding, robotics, mentorship, and inclusive growth.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((f, idx) => (
              <article
                key={f.id}
                className="scroll-reveal scroll-reveal--up group overflow-hidden rounded-xl bg-[var(--anvil-card-faint)] transition hover:-translate-y-0.5"
                style={{ '--reveal-delay': `${idx * 70}ms` }}
              >
                <div className="relative">
                  <img
                    src={FACILITY_IMAGE_BY_ID[f.id]}
                    alt=""
                    className="h-36 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.55)] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[var(--anvil-red)]">{f.title}</h3>
                  <p className="mt-2 text-sm text-[var(--vivi-muted)]">{f.text}</p>
                </div>
              </article>
            ))}
          </div>
          </div>
        </section>

        {/* About teaser — visual values + link to full About page */}
        <section className="py-12 sm:py-14">
          <div className="px-4 sm:px-6">
            <div className="big-card-motion overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--anvil-royal)_12%,white)] bg-gradient-to-br from-[var(--anvil-card-faint)] via-white to-[var(--vivi-light)] p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-red)]">About us</p>
                  <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)] sm:text-4xl">Anvil Coding Academy</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--vivi-muted)]">{SCHOOL_PROFILE.aboutLead}</p>
                  <p className="mt-3 text-sm font-semibold text-[var(--anvil-navy)]">
                    Programs for learners aged <span className="text-[var(--anvil-red)]">5–19</span> — project-based tech
                    education with heart.
                  </p>
                  <Link
                    to="/about"
                    className="btn-theme-primary mt-6 inline-flex rounded-full px-8 py-3 text-sm shadow-md"
                  >
                    Read our full story
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {ABOUT_TEASER_VALUES.map((v, idx) => (
                    <article
                      key={v.title}
                      className="scroll-reveal scroll-reveal--up group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/60"
                      style={{ '--reveal-delay': `${idx * 75}ms` }}
                    >
                      <div className="relative h-28 sm:h-32">
                        <img src={v.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,42,68,0.85)] via-[rgba(31,42,68,0.35)] to-transparent" />
                        <p className="absolute bottom-2 left-3 right-3 text-sm font-black text-white drop-shadow-sm">{v.title}</p>
                      </div>
                      <p className="p-3 text-xs leading-snug text-[var(--vivi-muted)] sm:p-3.5 sm:text-sm">{v.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Start */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="big-card-motion overflow-hidden bg-[var(--anvil-card-faint)]">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-white">
                <img
                  src={SCHOOL_MEDIA_IMAGES.chooseNextStep}
                  alt="Our teacher"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[rgba(16,55,65,0.25)]" />
              </div>
              <div className="big-card-motion bg-[var(--anvil-card-faint)] p-8 lg:p-10">
                <div className="scroll-reveal scroll-reveal--zoom">
                  <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Choose the right next step</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--vivi-muted)]">
                    Register is strictly for student enrollment. Book an Appointment is only for inquiries, direct meetings, or in-person school visits.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setPaymentOpen(true)} className="vivi-btn vivi-btn-primary rounded-full px-7 py-3 text-sm font-bold text-white">
                      Register (Student Enrollment)
                    </button>
                    <a href="#appointment" className="vivi-btn rounded-full border border-[var(--anvil-red)] px-7 py-3 text-sm font-bold text-[var(--anvil-red)] transition hover:bg-red-50">
                      Book an Appointment
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Classes Start */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="big-card-motion rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-red)]">School Classes</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">Programs for ages 5-19 years</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Clear, structured pathways across all core offerings.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CORE_CLASS_OFFERINGS.map((t, idx) => (
              <article
                key={t.id}
                className="scroll-reveal scroll-reveal--up classes-item overflow-hidden rounded-xl bg-[var(--anvil-card-faint)] transition hover:-translate-y-0.5"
                style={{ '--reveal-delay': `${idx * 70}ms` }}
              >
                <div className="px-4 pt-6 pb-2">
                  <div className="mx-auto w-40 max-w-[90%] rounded-xl bg-white p-2">
                    <img
                      src={getTrackImage(t.id)}
                      alt={t.title}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="-mt-8 rounded-t-xl bg-white px-5 pb-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-red)]">Program</p>
                    <h3 className="mt-1 text-lg font-black text-[var(--anvil-red)]">{t.title}</h3>
                    <p className="mt-2 text-sm text-[var(--vivi-muted)]">{t.summary}</p>
                    <p className="mt-4 text-xs font-bold text-[var(--anvil-teal)]">Target age group: {t.age}</p>
                    <div className="mt-4">
                      <button type="button" onClick={() => setPaymentOpen(true)} className="vivi-btn vivi-btn-primary inline-flex w-full justify-center rounded-full px-4 py-2.5 text-sm font-bold text-white shadow">
                        Register for this class
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
          </div>
        </section>

        {/* Appointment Start */}
        <section id="appointment" className="py-14">
          <div className="px-4 sm:px-6">
          <div className="big-card-motion overflow-hidden bg-[var(--anvil-card-faint)]">
            <div className="grid lg:grid-cols-2">
              <div className="big-card-motion bg-[var(--anvil-card-faint)] p-8 lg:p-10">
                <div className="scroll-reveal scroll-reveal--left">
                  <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Book an Appointment</h2>
                  <p className="mt-3 text-sm text-[var(--vivi-muted)]">
                    Use this form only for physical meetings, school visits, or direct consultation. It is separate from student registration.
                  </p>
                </div>
                <form
                  className="mt-6 grid gap-3 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    alert('Thanks! We will contact you shortly.')
                  }}
                >
                  <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Guardian name" required />
                  <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Guardian email" type="email" required />
                  <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Learner name" required />
                  <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Learner age" required />
                  <textarea className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Message" rows={4} />
                  <button type="submit" className="vivi-btn vivi-btn-primary sm:col-span-2 w-full rounded-full px-6 py-3 text-sm font-bold text-white">
                    Book in-person appointment
                  </button>
                </form>
              </div>
              <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-white">
                <img
                  src={SCHOOL_MEDIA_IMAGES.bookAppointment}
                  alt="Appointment"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Team Start (Popular Teachers) */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
            <div className="big-card-motion rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-red)]">Popular Teachers</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">Meet our mentors</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Scalable mentor roster mapped clearly to subject areas.
            </p>
          </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {TEAM.map((t, idx) => (
                  <article
                    key={t.name}
                    className="scroll-reveal scroll-reveal--up relative"
                    style={{ '--reveal-delay': `${idx * 70}ms` }}
                  >
                    <div className="relative mx-auto w-11/12">
                      <div className="mx-auto w-3/4 overflow-hidden rounded-xl bg-white p-2">
                        <img src={t.img} alt={t.name} className="aspect-square w-full rounded-xl object-cover" />
                      </div>

                      <div className="-mt-10 bg-[var(--anvil-card-faint)] p-4 pt-12 text-center">
                        <p className="text-lg font-black text-[var(--anvil-red)]">{t.name}</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--vivi-muted)]">{t.role}</p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          {['f', 't', 'ig'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--anvil-royal)] text-sm font-black text-white shadow-sm ring-1 ring-white/20 transition hover:brightness-110"
                              aria-label="Social link"
                              onClick={() => alert('Demo social link')}
                            >
                              {k === 'ig' ? 'ig' : k}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials + Parent Feedback Start */}
        <section className="py-14 bg-[var(--anvil-light)]/60">
          <div className="px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Parent feedback</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Parents can share comments and read feedback from other families.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[...TESTIMONIALS, ...feedbackList].map((t, idx) => (
              <article
                key={`${t.name}-${idx}`}
                className="scroll-reveal scroll-reveal--zoom rounded-xl bg-[var(--anvil-card-faint)] p-6"
                style={{ '--reveal-delay': `${idx * 80}ms` }}
              >
                <div>
                  <p className="text-sm font-bold text-[var(--anvil-red)]">{t.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-cyan-bright)]">Feedback</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--vivi-muted)]">“{t.text}”</p>
              </article>
            ))}
          </div>
          <form
            className="mt-8 grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              const name = feedbackForm.name.trim()
              const message = feedbackForm.message.trim()
              if (!name || !message) return
              setFeedbackList((prev) => [{ name, text: message }, ...prev].slice(0, 8))
              setFeedbackForm({ name: '', message: '' })
            }}
          >
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              placeholder="Parent or guardian name"
              value={feedbackForm.name}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              placeholder="Share your feedback"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, message: e.target.value }))}
            />
            <button type="submit" className="vivi-btn vivi-btn-primary sm:col-span-3 rounded-full px-6 py-3 text-sm font-bold text-white">
              Submit feedback
            </button>
          </form>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-12">
          <div className="px-4 sm:px-6">
          <div className="big-card-motion rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Activity Gallery</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Engaging visuals from student activities, events, classes, and community programs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY_SHOWCASE.map((item, idx) => (
              <div
                key={item.title}
                className="scroll-reveal scroll-reveal--up overflow-hidden rounded-xl bg-white/70"
                style={{ '--reveal-delay': `${idx * 60}ms` }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-44 w-full object-cover sm:h-48"
                />
                <div className="p-4">
                  <p className="text-sm font-bold text-[var(--anvil-red)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--vivi-muted)]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/gallery" className="vivi-btn vivi-btn-primary inline-flex rounded-full px-7 py-3 text-sm font-bold text-white">
              View full gallery
            </Link>
          </div>
          </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-12">
          <div className="px-4 sm:px-6">
            <div className="big-card-motion rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Partners</h2>
                <p className="mt-3 text-sm text-[var(--vivi-muted)]">
                  Schools and institutions collaborating with our learning programs.
                </p>
              </div>
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                {PARTNER_LOGOS.map((partner, idx) => (
                  <article
                    key={partner.name}
                    className="scroll-reveal scroll-reveal--up group flex flex-col items-center justify-center gap-3 p-2 sm:p-3 transition duration-300 hover:-translate-y-0.5"
                    style={{ '--reveal-delay': `${idx * 80}ms` }}
                  >
                    <div className="flex w-full items-center justify-center">
                      <img
                        src={partner.src}
                        alt={partner.name}
                        className="h-20 w-full object-contain transition duration-300 group-hover:scale-[1.04] sm:h-24 lg:h-28"
                      />
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--anvil-red)] sm:text-[11px]">
                      {partner.name}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter teaser + quick links */}
        <section className="pb-12">
          <div className="px-4 sm:px-6">
            <div className="big-card-motion overflow-hidden rounded-2xl border border-red-100/80 bg-gradient-to-br from-white via-white to-[var(--anvil-card-faint)] p-6 shadow-sm sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-(--anvil-red)">Stay in the loop</p>
                  <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-red)]">{NEWSLETTER_CONTENT.headline}</h2>
                  <p className="mt-3 max-w-xl text-sm text-[var(--vivi-muted)]">{NEWSLETTER_CONTENT.lead}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {NEWSLETTER_CONTENT.topics.map((t) => (
                      <span
                        key={t.label}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--anvil-red)] shadow-sm ring-1 ring-red-100/60"
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[var(--vivi-muted)]">{NEWSLETTER_CONTENT.cadence}</p>
                  <div className="mt-6">
                    <Link
                      to="/newsletter"
                      className="vivi-btn vivi-btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white"
                    >
                      Newsletter & subscribe
                    </Link>
                  </div>
                </div>
                <div className="big-card-motion rounded-xl bg-[var(--anvil-card-faint)] p-6 ring-1 ring-slate-200/60">
                  <h3 className="vivi-heading text-lg text-[var(--anvil-red)]">Quick links</h3>
                  <div className="mt-4 grid gap-2 text-sm">
                    {[
                      { to: '/about', label: 'About Us' },
                      { to: '/programs', label: 'Classes' },
                      { to: '/newsletter', label: 'Newsletter' },
                      { to: '/contact', label: 'Contact' },
                      { to: '/faq', label: 'FAQs' },
                    ].map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="rounded-lg bg-white px-4 py-2 font-semibold text-[var(--anvil-red)] transition hover:bg-red-50"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Start */}
        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

