import { forwardRef, useState, useEffect } from 'react'
import { FaArrowRight, FaChevronDown } from 'react-icons/fa'
import { SCHOOL_PROFILE } from '../../content/siteProfile'
import { SCHOOL_MEDIA_IMAGES } from '../../content/schoolMedia'

const Hero = forwardRef(({ scrollToSection, onRegisterClick }, ref) => {
  const [slide, setSlide] = useState(0)
  
  const slides = [
    {
      title: SCHOOL_PROFILE.heroTitle,
      text: SCHOOL_PROFILE.heroSubtitle,
      image: SCHOOL_MEDIA_IMAGES.bookAppointment,
    },
    {
      title: 'Make A Brighter Future For Your Child',
      text: SCHOOL_PROFILE.description,
      image: SCHOOL_MEDIA_IMAGES.lab,
    },
  ]

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
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            idx === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
          }`}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d3f5d]/80 to-[#2d3f5d]/40" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl animate-slide-in-up">
            <div className="inline-block px-4 py-2 rounded-full bg-[#faa853]/20 backdrop-blur-sm mb-6">
              <p className="text-sm font-bold text-[#faa853]">{SCHOOL_PROFILE.tagline}</p>
            </div>
            
            {slides.map((s, idx) => (
              <div key={idx} className={idx === slide ? 'block' : 'hidden'}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                  {s.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
                  {s.text}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => scrollToSection('classes')}
                className="group px-6 md:px-8 py-3 md:py-4 rounded-full bg-[#faa853] text-white font-bold text-sm hover:bg-[#faa853]/90 transition-all hover:scale-105 flex items-center gap-2"
              >
                Explore Classes
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onRegisterClick}
                className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-white text-[#2d3f5d] font-bold text-sm hover:bg-gray-100 transition-all hover:scale-105"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button onClick={() => scrollToSection('about')} className="text-white/70 hover:text-white transition-colors">
          <FaChevronDown className="text-2xl" />
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === slide ? 'w-8 bg-[#faa853]' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
})

Hero.displayName = 'Hero'
export default Hero