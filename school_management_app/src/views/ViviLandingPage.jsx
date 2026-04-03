import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isDemoMode, supabase } from '../lib/supabase'
import PaymentRegistrationModal from '../components/PaymentRegistrationModal'
import SiteNavbar from '../components/SiteNavbar'
import ViviFooter from '../components/ViviFooter'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { CULTURE_POINTS, FACILITIES, PROGRAM_TRACKS, SCHOOL_IMAGES, SCHOOL_PROFILE } from '../content/siteProfile'
import heroAsset from '../assets/hero.png'
import assetHowToStart from '../assets/school/how-to-start-a-kids-coding-camp.jpg'
import assetImages5 from '../assets/school/images (5).jpg'
import assetIStock128 from '../assets/school/iStock-1288615417.jpg'
import assetIStock825 from '../assets/school/iStock-825187856-b-scaled.jpg'
import assetMG3836 from '../assets/school/MG_3836-scaled.jpg'
import assetSocial from '../assets/school/social_image.webp'
import team1 from '../assets/school/team-1.jpg'
import team2 from '../assets/school/team-2.jpg'
import team3 from '../assets/school/team-3.jpg'

const ASSET_IMAGES = {
  hero: assetMG3836,
  lab: assetIStock825,
  classA: assetImages5,
  classB: assetIStock128,
  classC: assetHowToStart,
  social: assetSocial,
}

const DEFAULT_HERO = {
  hero_title: SCHOOL_PROFILE.heroTitle,
  hero_text: SCHOOL_PROFILE.heroSubtitle,
  hero_image_url: ASSET_IMAGES.hero,
}

const FACILITY_ICON = {
  projects: '💡',
  mentor: '👩‍🏫',
  community: '🤝',
  innovation: '🤖',
}

const FACILITY_IMAGE_BY_ID = {
  projects: ASSET_IMAGES.classA,
  mentor: ASSET_IMAGES.classB,
  community: ASSET_IMAGES.social,
  innovation: ASSET_IMAGES.lab,
}

const slideButtonClass =
  'h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--anvil-cyan)]/40'

const SCREENSHOT_IMAGES = {
  teacher: team1,
  student: '/media/Screenshots/student.png',
  parent: '/media/Screenshots/parent.png',
  news: '/media/Screenshots/news.png',
}

const TESTIMONIALS = [
  {
    name: 'Parent',
    text: 'Clear progress tracking and supportive tutors. My child is excited to learn.',
    img: SCREENSHOT_IMAGES.parent,
  },
  {
    name: 'Student',
    text: 'I built my first game and learned how to debug. Now I want to build more.',
    img: SCREENSHOT_IMAGES.student,
  },
  {
    name: 'Guardian',
    text: 'Great environment and practical learning. The portfolio projects are impressive.',
    img: SCREENSHOT_IMAGES.teacher,
  },
]

const TEAM = [
  { name: 'Ms. Nawa', role: 'Lead Instructor', img: team1 },
  { name: 'Mr. Zulu', role: 'Robotics Mentor', img: team2 },
  { name: 'Mrs. Chanda', role: 'Web Development Coach', img: team3 },
]

const FOOTER_GALLERY_IMAGES = [
  assetMG3836,
  assetIStock825,
  assetImages5,
  assetIStock128,
  assetHowToStart,
  assetSocial,
]

function getTrackImage(trackId) {
  if (trackId === 'python' || trackId === 'python2' || trackId === 'web') return ASSET_IMAGES.classB
  if (trackId === 'robotics' || trackId === 'ai') return ASSET_IMAGES.lab
  return ASSET_IMAGES.classA
}

export default function ViviLandingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [hero, setHero] = useState(DEFAULT_HERO)
  const [slide, setSlide] = useState(0)
  const [heroNonce, setHeroNonce] = useState(0)

  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false

    ;(async () => {
      const { data } = await supabase.from('landing_content').select('*').eq('id', 1).maybeSingle()
      if (cancelled || !data) return
      setHero({
        hero_title: data.hero_title || DEFAULT_HERO.hero_title,
        hero_text: data.hero_text || DEFAULT_HERO.hero_text,
        hero_image_url: data.hero_image_url || DEFAULT_HERO.hero_image_url,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const heroSlides = useMemo(
    () => [
      {
        title: hero.hero_title,
        text: hero.hero_text,
        image: ASSET_IMAGES.hero,
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
    const id = window.setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5200)
    return () => window.clearInterval(id)
  }, [heroSlides.length])

  useEffect(() => {
    // Forces a remount so the hero text animation replays on each slide change.
    const t = window.setTimeout(() => setHeroNonce((n) => n + 1), 0)
    return () => window.clearTimeout(t)
  }, [slide])

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)]">
      <PaymentRegistrationModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" onRegisterPay={() => setPaymentOpen(true)} sticky showRegisterPay />

        {/* Carousel Start (vivi/index.html) */}
        <section className="relative h-[560px] lg:h-[640px] overflow-hidden">
        {heroSlides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === slide ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={idx !== slide}
          >
            <img src={s.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.45)]" />
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
            <div key={heroNonce} className="max-w-xl">
              <p
                className="vivi-hero-anim-down text-xs font-bold uppercase tracking-[0.25em] text-[var(--anvil-cyan-bright)]"
                style={{ '--hero-delay': '40ms' }}
              >
                {SCHOOL_PROFILE.tagline}
              </p>
              <h1
                className="vivi-heading vivi-hero-anim-down mt-3 text-4xl leading-tight text-white sm:text-5xl lg:text-6xl"
                style={{ '--hero-delay': '110ms' }}
              >
                {heroSlides[slide]?.title}
              </h1>
              <p
                className="vivi-hero-anim-left mt-4 text-base leading-relaxed text-white/90"
                style={{ '--hero-delay': '180ms' }}
              >
                {heroSlides[slide]?.text}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="vivi-btn vivi-hero-anim-left rounded-full bg-[var(--anvil-cyan)] px-7 py-3 text-sm font-bold text-[var(--anvil-navy-deep)] shadow-lg transition hover:brightness-105"
                  style={{ '--hero-delay': '240ms' }}
                >
                  {heroSlides[slide]?.primaryCta}
                </Link>
                <Link
                  to="/programs"
                  className="vivi-btn vivi-hero-anim-right rounded-full border-2 border-white/80 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  style={{ '--hero-delay': '280ms' }}
                >
                  {heroSlides[slide]?.secondaryCta}
                </Link>
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
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-navy)]">Learning built around real outcomes</h2>
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
                  <h3 className="text-lg font-bold text-[var(--anvil-navy)]">{f.title}</h3>
                  <p className="mt-2 text-sm text-[var(--vivi-muted)]">{f.text}</p>
                </div>
              </article>
            ))}
          </div>
          </div>
        </section>

        {/* About Start */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="scroll-reveal scroll-reveal--left">
                <p className="inline-flex rounded-full bg-[var(--vivi-light)] px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">
                  About Us
                </p>
                <h2 className="vivi-heading mt-3 text-3xl text-[var(--anvil-navy)]">About Our Work &amp; Cultural Activities</h2>
              </div>
              <div className="mt-4 scroll-reveal scroll-reveal--right">
                <p className="text-sm leading-relaxed text-[var(--vivi-muted)]">{SCHOOL_PROFILE.aboutLead}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--vivi-muted)]">{SCHOOL_PROFILE.aboutBody}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {CULTURE_POINTS.slice(0, 4).map((pt, idx) => (
                  <div
                    key={pt}
                    className="scroll-reveal scroll-reveal--zoom rounded-xl bg-white/80 p-4 text-sm text-[var(--vivi-muted)] transition hover:-translate-y-0.5"
                    style={{ '--reveal-delay': `${idx * 60}ms` }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--anvil-royal)]">Culture</p>
                    <p className="mt-2 font-semibold text-[var(--anvil-navy)]">{pt}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 scroll-reveal scroll-reveal--up">
                <Link to="/about" className="vivi-btn vivi-btn-primary rounded-full inline-flex px-7 py-3 text-sm font-bold">
                  Read More
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="scroll-reveal scroll-reveal--right overflow-hidden rounded-xl bg-[var(--anvil-card-faint)] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={ASSET_IMAGES.hero} alt="Learning" className="h-44 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.35)] via-transparent to-transparent" />
                  </div>
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={ASSET_IMAGES.classB} alt="Community" className="h-44 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.25)] via-transparent to-transparent" />
                  </div>
                  <div className="relative overflow-hidden rounded-xl sm:col-span-2">
                    <img src={ASSET_IMAGES.lab} alt="Robotics" className="h-52 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,55,65,0.32)] via-transparent to-transparent" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: 'Ages', v: '5–19' },
                    { k: 'Focus', v: 'Projects' },
                    { k: 'Support', v: 'Mentorship' },
                  ].map((it) => (
                    <div key={it.k} className="rounded-xl bg-white/90 p-4 text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--anvil-royal)]">{it.k}</p>
                      <p className="mt-2 text-sm font-extrabold text-[var(--anvil-navy)]">{it.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
        </section>

        {/* Call To Action Start */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="overflow-hidden bg-[var(--anvil-card-faint)]">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-white">
                <img
                  src={ASSET_IMAGES.classC}
                  alt="Our teacher"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[rgba(16,55,65,0.25)]" />
              </div>
              <div className="bg-[var(--anvil-card-faint)] p-8 lg:p-10">
                <div className="scroll-reveal scroll-reveal--zoom">
                  <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Our Teacher</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--vivi-muted)]">
                    Professional &amp; competent educators. We create a supportive learning environment where every student can build confidence and reach their full potential.
                  </p>
                  <Link
                    to="/programs"
                    className="vivi-btn vivi-btn-primary mt-6 rounded-full inline-flex px-7 py-3 text-sm font-bold"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Classes Start */}
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-royal)]">School Classes</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-navy)]">Programs for ages 5–19</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Structured mentorship, hands-on projects, and confidence-building learning.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_TRACKS.slice(0, 6).map((t, idx) => (
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
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-royal)]">{t.level}</p>
                    <h3 className="mt-1 text-lg font-black text-[var(--anvil-navy)]">{t.title}</h3>
                    <p className="mt-2 text-sm text-[var(--vivi-muted)]">{t.desc}</p>
                    <p className="mt-4 text-xs font-bold text-[var(--anvil-teal)]">Recommended age: {t.age}</p>
                    <div className="mt-4">
                      <Link
                        to="/login"
                        className="vivi-btn vivi-btn-primary inline-flex w-full justify-center rounded-full px-4 py-2.5 text-sm font-bold text-white shadow"
                      >
                        Sign in to enroll
                      </Link>
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
        <section className="py-14">
          <div className="px-4 sm:px-6">
          <div className="overflow-hidden bg-[var(--anvil-card-faint)]">
            <div className="grid lg:grid-cols-2">
              <div className="bg-[var(--anvil-card-faint)] p-8 lg:p-10">
                <div className="scroll-reveal scroll-reveal--left">
                  <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Make Appointment</h2>
                  <p className="mt-3 text-sm text-[var(--vivi-muted)]">
                    Send a quick note and we’ll guide your enrollment.
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
                    Submit
                  </button>
                </form>
              </div>
              <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-white">
                <img
                  src={ASSET_IMAGES.lab}
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
            <div className="rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--anvil-royal)]">Popular Teachers</p>
            <h2 className="vivi-heading mt-2 text-3xl text-[var(--anvil-navy)]">Meet our mentors</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Experienced educators who guide every milestone—from beginner confidence to advanced portfolio projects.
            </p>
          </div>

              <div className="grid gap-6 md:grid-cols-3">
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
                        <p className="text-lg font-black text-[var(--anvil-navy)]">{t.name}</p>
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

        {/* Testimonial Start */}
        <section className="py-14 bg-[var(--anvil-light)]/60">
          <div className="px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Our Clients Say!</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              Feedback from parents, guardians, and learners.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <article
                key={t.name}
                className="scroll-reveal scroll-reveal--zoom rounded-xl bg-[var(--anvil-card-faint)] p-6"
                style={{ '--reveal-delay': `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-[var(--anvil-navy)]">{t.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--anvil-cyan-bright)]">Feedback</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--vivi-muted)]">“{t.text}”</p>
              </article>
            ))}
          </div>
          </div>
        </section>

        {/* Photo Gallery (vivi footer preview) */}
        <section className="py-12">
          <div className="px-4 sm:px-6">
          <div className="rounded-xl bg-[var(--anvil-card-faint)] p-6 sm:p-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="vivi-heading text-3xl text-[var(--anvil-navy)]">Photo Gallery</h2>
            <p className="mt-3 text-sm text-[var(--vivi-muted)]">
              A glimpse of learning spaces and community moments.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FOOTER_GALLERY_IMAGES.map((src, idx) => (
              <div
                key={idx}
                className="scroll-reveal scroll-reveal--up overflow-hidden rounded-xl bg-white/70"
                style={{ '--reveal-delay': `${idx * 60}ms` }}
              >
                <img
                  src={src}
                  alt=""
                  className="h-44 w-full object-cover sm:h-48"
                />
              </div>
            ))}
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

