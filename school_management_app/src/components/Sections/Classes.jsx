import { forwardRef } from 'react'
import { FaLaptopCode, FaRobot} from 'react-icons/fa'

import { FaArrowRight } from "react-icons/fa";

const CORE_CLASS_OFFERINGS = [
  { id: 'digital-literacy', title: 'Digital Literacy', age: '5-19 years', summary: 'Computer basics, productivity tools, and safe online habits.', icon: FaLaptopCode },
  { id: 'python', title: 'Python Programming', age: '10-19 years', summary: 'From beginner coding to app and automation projects.', icon: FaLaptopCode },
  { id: 'robotics', title: 'Robotics Engineering', age: '8-19 years', summary: 'Build, program, and test robots in practical team projects.', icon: FaRobot },
  { id: 'visual-programming', title: 'Visual Programming', age: '5-12 years', summary: 'Block-based coding that develops logic and sequencing skills.', icon: FaLaptopCode },
  { id: 'game-design', title: 'Game Design Studio', age: '9-19 years', summary: 'Design and build interactive games while learning core coding concepts.', icon: FaLaptopCode },
  { id: 'web-development', title: 'Web Development', age: '12-19 years', summary: 'Create modern websites with HTML, CSS, and JavaScript.', icon: FaLaptopCode },
  { id: 'cybersecurity', title: 'Cybersecurity', age: '12-19 years', summary: 'Learn digital safety, threat awareness, and responsible security practices.', icon: FaLaptopCode },
  { id: 'ai', title: 'Artificial Intelligence', age: '12-19 years', summary: 'Explore machine learning basics through child-friendly projects.', icon: FaRobot },
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
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Comprehensive programs designed for ages 5-19 to build future-ready skills
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
                <p className="text-sm text-[#faa853] font-semibold mb-3">Ages {course.age}</p>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">{course.summary}</p>
                <button
                  onClick={onRegisterClick}
                  className="text-[#faa853] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all"
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