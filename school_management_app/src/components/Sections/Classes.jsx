import { forwardRef } from 'react'
import { FaCalendarAlt, FaClipboardCheck, FaLaptopCode, FaRobot } from 'react-icons/fa'
import { ACADEMIC_CALENDAR_2026 } from '../../content/siteProfile'

import { FaArrowRight } from "react-icons/fa";

const CORE_CLASS_OFFERINGS = [
  { id: 'scratch-jr', title: 'Programming in Scratch Jr', age: '5-7 years', summary: 'A playful first dive into algorithms and coding logic.', icon: FaLaptopCode },
  { id: 'technology-literacy', title: 'Technology Literacy', age: '7-9 years', summary: 'Digital tools, communication skills, and online safety basics.', icon: FaLaptopCode },
  { id: 'scratch', title: 'Programming in Scratch', age: '9-10 years', summary: 'Build games and cartoons while learning programming fundamentals.', icon: FaLaptopCode },
  { id: 'web-development', title: 'Web Development Level 1', age: '15-18 years', summary: 'Create dynamic web pages with HTML, CSS, and JavaScript.', icon: FaLaptopCode },
  { id: 'python-level-1', title: 'Python Level 1', age: '12-13 years', summary: 'Learn Python basics, chatbot logic, and creative Turtle graphics.', icon: FaLaptopCode },
  { id: 'python-level-2', title: 'Python Level 2', age: '14-17 years', summary: 'Advance into app development, backend skills, and machine learning.', icon: FaLaptopCode },
  { id: 'game-design', title: 'Programming in Game Design', age: '10-11 years', summary: 'Create interactive game experiences with Roblox Studio and Lua.', icon: FaLaptopCode },
  { id: 'robotics', title: 'Robotics', age: '9-11 years', summary: 'Design, build, and program robots through practical projects.', icon: FaRobot },
  { id: 'graphic-design', title: 'Graphic Design', age: '9-14 years', summary: 'Learn design tools to craft visuals that communicate clearly.', icon: FaLaptopCode },
]

const Classes = forwardRef(({ onRegisterClick }, ref) => {
  return (
    <section id="classes" ref={ref} className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3 animate-fade-in">
            Our Programs
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            Choose Your Learning Path
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Comprehensive programs designed for ages 5-18 to build future-ready skills
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {CORE_CLASS_OFFERINGS.map((course, idx) => {
            const Icon = course.icon
            return (
              <div
                key={course.id}
                className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#faa853]/10 flex items-center justify-center mb-6 group-hover:bg-[#faa853] transition-all duration-300">
                  <Icon className="text-2xl text-[#faa853] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#2d3f5d] mb-2">{course.title}</h3>
                <p className="text-base md:text-lg text-[#faa853] font-semibold mb-3">Ages {course.age}</p>
                <p className="text-gray-600 leading-relaxed mb-4 text-base md:text-lg">{course.summary}</p>
                <button
                  onClick={onRegisterClick}
                  className="text-base md:text-lg text-[#faa853] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Enroll Now <FaArrowRight className="text-sm" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-14 md:mt-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-2">
            School Calendar
          </p>
          <h3 className="text-2xl md:text-4xl font-black text-[#2d3f5d]">
            2026 Academic Year Roadmap
          </h3>
        </div>

        <div className="calendar-section-enter calendar-ambient mt-6 md:mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef4ff] via-[#fff9f1] to-[#f4f7ff] p-6 md:p-8 lg:p-10 shadow-xl">
          <div className="calendar-orb pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#2d3f5d]/10 blur-3xl" />
          <div className="calendar-orb calendar-orb--slow pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#faa853]/20 blur-3xl" />

          <div className="relative">
            <div className="mb-8 md:mb-10 rounded-2xl bg-gradient-to-r from-[#2d3f5d] to-[#3f5780] p-5 md:p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#2d3f5d] shadow-sm">
                  <FaCalendarAlt className="text-[#faa853]" />
                  Academic Handbook
                </span>
                <span className="inline-flex items-center rounded-full bg-[#faa853] px-3 py-1.5 text-sm font-bold text-[#2d3f5d]">
                  {ACADEMIC_CALENDAR_2026.year}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3">
                {ACADEMIC_CALENDAR_2026.title}
              </h3>
              <p className="text-base md:text-lg text-white/90 mb-4 max-w-4xl">
                {ACADEMIC_CALENDAR_2026.intro}
              </p>
              <div className="rounded-xl bg-white/95 px-4 py-3">
                <p className="text-base md:text-lg text-[#2d3f5d] font-semibold">
                  Weekend Class Policy: {ACADEMIC_CALENDAR_2026.weekendPolicy}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {ACADEMIC_CALENDAR_2026.eventsByMonth.map((block, index) => (
              <div
                key={block.month}
                className="calendar-month-card group relative overflow-hidden rounded-2xl bg-white p-5 md:p-6 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <span className="calendar-card-sheen" aria-hidden />
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[#faa853]/20 blur-2xl transition-all duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#faa853] via-[#ffd19d] to-[#2d3f5d]" />

                <div className="relative mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-lg md:text-xl font-black text-[#2d3f5d] flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#faa853] group-hover:scale-125 transition-transform" />
                    {block.month} 2026
                  </h4>
                  <span className="rounded-full bg-[#2d3f5d]/8 px-3 py-1 text-xs md:text-sm font-bold text-[#2d3f5d]">
                    {block.events.length} event{block.events.length > 1 ? 's' : ''}
                  </span>
                </div>

                <ul className="space-y-3 relative">
                  {block.events.map((event) => (
                    <li
                      key={event}
                      className="rounded-xl bg-[#f8faff] px-3.5 py-3 text-base md:text-lg text-gray-700 leading-relaxed flex items-start gap-2.5 group-hover:bg-[#f4f8ff] transition-colors"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2d3f5d]/50 shrink-0" />
                      <span className="font-medium">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#fff3e7] to-[#fffaf5] p-5 md:p-6 shadow-md">
              <h4 className="text-lg md:text-xl font-bold text-[#2d3f5d] mb-3 flex items-center gap-2">
                <FaClipboardCheck className="text-[#faa853]" />
                Key Academic Policies
              </h4>
              <ul className="space-y-2.5">
              {ACADEMIC_CALENDAR_2026.keyPolicies.map((item) => (
                <li key={item} className="text-base md:text-lg text-gray-700 flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#faa853] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

Classes.displayName = 'Classes'
export default Classes