import { forwardRef } from 'react'
import { FaLaptopCode, FaRobot} from 'react-icons/fa'

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
      </div>
    </section>
  )
})

Classes.displayName = 'Classes'
export default Classes