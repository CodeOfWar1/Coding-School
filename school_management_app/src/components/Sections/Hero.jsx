import { forwardRef, useState, useEffect } from 'react'
import { FaArrowRight, FaChevronDown } from 'react-icons/fa'
import { SCHOOL_PROFILE } from '../../content/siteProfile'

/**
 * Files live in `public/media/Hero` (built as `/media/Hero/...`, respecting `base` in vite.config).
 * Bump default or set `VITE_HERO_IMAGE_REVISION` in `.env` after replacing JPEGs so browsers fetch new bytes.
 */
const HERO_IMAGE_REVISION_FALLBACK = '9'

/** Strongest vertical crop for graduation-style hero shots (Hero1 / Hero3 / Hero4). */
const HERO_TOP_ANCHOR_FILES = new Set(['Hero1.jpeg', 'Hero3.jpeg', 'Hero4.jpeg'])

/**
 * Hero1 & Hero4: past `center top`, shift the bitmap down slightly so more of the upper photo shows.
 * (Percent is relative to the img element height.)
 */
const HERO_EXTRA_TRANSLATE_Y = {
  'Hero1.jpeg': '11%',
  'Hero4.jpeg': '14%',
}

function slideImageStyle(slide) {
  const style = {}
  if (HERO_TOP_ANCHOR_FILES.has(slide.file)) {
    style.objectPosition = 'center top'
  } else {
    style.objectPosition = `50% ${slide.objectY ?? 15}%`
  }
  const ty = HERO_EXTRA_TRANSLATE_Y[slide.file]
  if (ty) {
    style.transform = `translateY(${ty})`
  }
  return style
}

function heroImagePublicUrl(fileName) {
  const baseRaw = import.meta.env.BASE_URL || '/'
  const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
  const rev =
    import.meta.env.VITE_HERO_IMAGE_REVISION ?? HERO_IMAGE_REVISION_FALLBACK
  const qs = rev !== '' && rev != null ? `?v=${encodeURIComponent(String(rev))}` : ''
  return `${base}media/Hero/${encodeURI(fileName)}${qs}`
}

const Hero = forwardRef(({ scrollToSection, onRegisterClick }, ref) => {
  const [slide, setSlide] = useState(0)

  /**
   * `objectY` = vertical % when not top-anchored.
   * `titleMobile` / `textMobile` = shorter copy for small screens only (`md:` and up use full strings).
   */
  const slides = [
    {
      title: SCHOOL_PROFILE.heroTitle,
      titleMobile: 'The Best Coding School',
      text: SCHOOL_PROFILE.heroSubtitle,
      textMobile: 'Digital skills for young learners in a tech-first world.',
      file: 'Hero1.jpeg',
    },
    {
      title: 'Make A Brighter Future For Your Child',
      titleMobile: 'A Brighter Future For Your Child',
      text: SCHOOL_PROFILE.description,
      textMobile: 'Coding, robotics & AI — ages 5 to 19.',
      file: 'Hero2.jpeg',
      objectY: 15,
    },
    {
      title: 'Build Skills For The Future',
      titleMobile: 'Build Skills For The Future',
      text: 'Hands-on learning experiences that grow creativity, confidence, and practical technology skills.',
      textMobile: 'Hands-on tech that builds creativity and confidence.',
      file: 'Hero3.jpeg',
    },
    {
      title: 'Learn, Create, And Innovate',
      titleMobile: 'Learn, Create, Innovate',
      text: 'From coding to robotics, we help young learners turn ideas into meaningful projects.',
      textMobile: 'From coding to robotics — ideas into real projects.',
      file: 'Hero4.jpeg',
    },
    {
      title: 'Where Young Innovators Thrive',
      titleMobile: 'Young Innovators Thrive Here',
      text: 'A vibrant environment where students explore technology, teamwork, and problem-solving every day.',
      textMobile: 'Tech, teamwork and problem-solving — every day.',
      file: 'Hero7.jpeg',
      objectY: 14,
    },
  ]

  const taglineMobile = 'Powering innovators & the future.'

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="home" ref={ref} className="relative h-screen overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${idx === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
            }`}
        >
          <img
            src={heroImagePublicUrl(s.file)}
            alt=""
            className="h-full w-full object-cover"
            style={slideImageStyle(s)}
          />
          {/* Site theme: navy wash over hero (matches nav/footer secondary) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/55 to-secondary/22" />
        </div>
      ))}

      {/* Bottom-left copy: sharp shadows instead of a box — smaller width = less overlap */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-6 sm:pb-8 md:pb-10 lg:pb-12 pt-28 md:pt-32">
        <div className="pointer-events-auto max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-md animate-slide-in-up text-left sm:max-w-lg lg:max-w-xl">
            <div className="mb-5 inline-block rounded-full bg-primary/35 px-3 py-1.5 backdrop-blur-[2px] md:mb-6 md:px-4 md:py-2">
              <p className="text-xs font-bold text-primary [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.35)] md:hidden">
                {taglineMobile}
              </p>
              <p className="hidden text-sm font-bold text-primary [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.35)] md:block">
                {SCHOOL_PROFILE.tagline}
              </p>
            </div>

            {slides.map((s, idx) => (
              <div key={idx} className={idx === slide ? 'block' : 'hidden'}>
                <h1 className="mb-5 font-display text-3xl font-black leading-snug tracking-normal text-white sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.85),_0_6px_28px_rgb(0_0_0_/_0.55)]">
                  <span className="md:hidden">{s.titleMobile ?? s.title}</span>
                  <span className="hidden md:inline">{s.title}</span>
                </h1>
                <p className="mb-8 text-base leading-relaxed text-white/95 [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.9),_0_4px_20px_rgb(0_0_0_/_0.45)]">
                  <span className="md:hidden">{s.textMobile ?? s.text}</span>
                  <span className="hidden md:inline">{s.text}</span>
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => scrollToSection('classes')}
                className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/30 transition-all hover:scale-105 hover:bg-primary/90 md:px-8 md:py-4"
              >
                Explore Classes
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onRegisterClick}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-secondary shadow-lg shadow-black/25 transition-all hover:scale-105 hover:bg-gray-100 md:px-8 md:py-4"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 animate-bounce sm:bottom-12">
        <button
          type="button"
          onClick={() => scrollToSection('about')}
          className="text-white/70 hover:text-white transition-colors"
        >
          <FaChevronDown className="text-2xl" />
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => setSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === slide ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </section>
  )
})

Hero.displayName = 'Hero'
export default Hero