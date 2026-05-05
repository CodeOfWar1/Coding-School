import { FaBullseye, FaEye, FaLaptopCode } from 'react-icons/fa'
import { CLIENT2_COURSES, MISSION_VISION_VALUES } from '../../content/siteProfile'
import { COURSE_CARD_ICONS } from './aboutConstants'

export default function AboutMidSections() {
  return (
    <>
      <section className="grid md:grid-cols-2 gap-6">
        <article
          data-reveal
          className="bg-gradient-to-br from-white to-[#f8fbff] rounded-2xl shadow-sm p-6 md:p-8 border border-[#2d3f5d]/10 scroll-reveal scroll-reveal--left hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-[#faa853]/20 text-[#faa853] flex items-center justify-center mb-4">
            <FaBullseye />
          </div>
          <h3 className="text-2xl font-black text-[#2d3f5d] mb-3">Our Mission</h3>
          <p className="text-gray-600 leading-relaxed">
            Our mission is to empower the next generation with problem-solving skills, creativity, innovation, and confidence through practical presentations, hands-on technology education.
          </p>
        </article>

        <article
          data-reveal
          className="bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] rounded-2xl shadow-sm p-6 md:p-8 border border-[#2d3f5d]/10 scroll-reveal scroll-reveal--right hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 text-[#faa853] flex items-center justify-center mb-4">
            <FaEye />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Our Vision</h3>
          <p className="text-white/85 leading-relaxed">{MISSION_VISION_VALUES.vision}</p>
        </article>
      </section>

      <section data-reveal className="bg-gradient-to-r from-[#fff8ef] to-[#fff3e1] rounded-2xl shadow-sm p-6 md:p-8 border border-[#faa853]/20 scroll-reveal">
        <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-4">Our Focus</h3>
        <p className="text-gray-600 leading-relaxed">
          We focus on children and teenagers between the ages of <span className="font-semibold text-[#faa853]">5-19 years</span>, offering age-appropriate programs that build skills progressively from beginner to advanced levels.
        </p>
      </section>

      <section
        data-reveal
        className="rounded-2xl border border-[#2d3f5d]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef] shadow-md p-6 md:p-8 scroll-reveal"
      >
        <div className="mb-6 md:mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#faa853] mb-2">Programs</p>
          <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-2">Our Courses</h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Structured tracks from digital foundations to advanced builds—each course blends guided lessons with hands-on projects.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {CLIENT2_COURSES.map((course, index) => {
            const Icon = COURSE_CARD_ICONS[index] ?? FaLaptopCode
            return (
              <article
                key={course.title}
                data-reveal
                className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-white/90 shadow-sm scroll-reveal transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#faa853]/35 hover:shadow-lg ${index % 2 === 0 ? 'scroll-reveal--left' : 'scroll-reveal--right'}`}
              >
                <div
                  className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b from-[#faa853] via-[#f28c38] to-[#2d3f5d] opacity-90"
                  aria-hidden
                />
                <div className="relative p-5 md:p-6 pl-6 md:pl-7">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] text-[#faa853] shadow-md ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <Icon className="text-xl" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-[#faa853]/15 px-2 text-xs font-black tabular-nums text-[#2d3f5d]">
                          {index + 1}
                        </span>
                        <h4 className="text-base md:text-lg font-bold text-[#2d3f5d] leading-snug">{course.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{course.text}</p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
