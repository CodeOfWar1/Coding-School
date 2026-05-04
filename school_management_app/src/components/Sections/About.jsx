import { forwardRef } from 'react'
import { FaUsers, FaChalkboardTeacher, FaBriefcase, FaHandshake, FaArrowRight } from 'react-icons/fa'
import { SCHOOL_PROFILE } from '../../content/siteProfile'
import { SCHOOL_MEDIA_IMAGES } from '../../content/schoolMedia'

const About = forwardRef(({ scrollToSection }, ref) => {
  const stats = [
    { icon: FaUsers, value: '500+', label: 'Students', color: 'text-[#faa853]' },
    { icon: FaChalkboardTeacher, value: '10+', label: 'Experts', color: 'text-[#faa853]' },
    { icon: FaBriefcase, value: '8', label: 'Programs', color: 'text-[#faa853]' },
    { icon: FaHandshake, value: '20+', label: 'Partners', color: 'text-[#faa853]' },
  ]

  return (
    <section id="about" ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3 animate-fade-in">
            About Us
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            Shaping Future Tech Leaders
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto animate-fade-in animation-delay-200">
            {SCHOOL_PROFILE.aboutLead}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative animate-fade-in-left">
            <img
              src={SCHOOL_MEDIA_IMAGES.hero}
              alt="Students learning"
              className="rounded-2xl w-full object-cover shadow-lg"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-[#faa853] rounded-2xl p-4 md:p-6 shadow-xl animate-scale-in">
              <p className="text-white font-black text-2xl md:text-3xl">5+</p>
              <p className="text-white/90 text-xs md:text-sm">Years of Excellence</p>
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in-right">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div key={idx} className="p-3 md:p-4 text-center group hover:bg-gray-50 rounded-xl transition-all duration-300">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#faa853]/10 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
                      <Icon className="text-[#faa853] text-lg md:text-xl" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-[#2d3f5d] mb-1">{stat.value}</h3>
                    <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
                  </div>
                )
              })}
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              Programs for learners aged <span className="text-[#faa853] font-bold">5–19</span> — project-based tech education with heart.
            </p>
            
            <button
              onClick={() => scrollToSection('classes')}
              className="inline-flex items-center gap-2 text-[#faa853] font-semibold hover:gap-3 transition-all group"
            >
              Explore our programs 
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})

About.displayName = 'About'
export default About