import { forwardRef } from 'react'
import { FaLinkedin, FaTwitter, FaInstagram, FaEnvelope, FaStar, FaQuoteLeft, FaArrowRight } from 'react-icons/fa'
import { SCHOOL_MEDIA_IMAGES } from '../../content/schoolMedia'

const TEAM = [
  { 
    name: 'Ms. Nawa', 
    role: 'Lead Instructor', 
    specialty: 'Full Stack Development',
    experience: '8+ years',
    bio: 'Passionate about teaching coding with real-world projects and mentorship. Expert in JavaScript, React, and Node.js.',
    quote: "Teaching isn't just my job, it's my passion. Every student has the potential to be extraordinary.",
    img: SCHOOL_MEDIA_IMAGES.team1,
    email: 'nawa@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
  { 
    name: 'Mr. Zulu', 
    role: 'Robotics Mentor', 
    specialty: 'Robotics & AI',
    experience: '6+ years',
    bio: 'Expert in robotics engineering and competitive programming. Leads robotics workshops and competitions.',
    quote: "Robotics is the future, and I'm here to help students build it one circuit at a time.",
    img: SCHOOL_MEDIA_IMAGES.team2,
    email: 'zulu@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
  { 
    name: 'Mrs. Chanda', 
    role: 'Web Development Coach', 
    specialty: 'Frontend & UI/UX',
    experience: '7+ years',
    bio: 'Specializes in creating engaging web experiences and teaching best practices in modern web development.',
    quote: "Great design and clean code go hand in hand. I teach students both.",
    img: SCHOOL_MEDIA_IMAGES.team3,
    email: 'chanda@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
  { 
    name: 'Tapiwa', 
    role: 'Web Development Expert', 
    specialty: 'Backend & APIs',
    experience: '5+ years',
    bio: 'Expert in building scalable backend systems and RESTful APIs using Python and Django.',
    quote: "The backend is where the magic happens. I love showing students how it all works.",
    img: SCHOOL_MEDIA_IMAGES.team3,
    email: 'tapiwa@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
  { 
    name: 'Sivogwani', 
    role: 'Robotics Specialist', 
    specialty: 'Embedded Systems',
    experience: '5+ years',
    bio: 'Passionate about IoT and robotics, guiding students in hands-on projects with Arduino and Raspberry Pi.',
    quote: "Hands-on learning is the best learning. Let's build something amazing together.",
    img: SCHOOL_MEDIA_IMAGES.team2,
    email: 'sivogwani@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
  { 
    name: 'Mwango', 
    role: 'Digital Literacy Coordinator', 
    specialty: 'Digital Skills & Safety',
    experience: '4+ years',
    bio: 'Dedicated to empowering young learners with essential digital skills and online safety practices.',
    quote: "Digital literacy is a superpower. Every child deserves to have it.",
    img: SCHOOL_MEDIA_IMAGES.team1,
    email: 'mwango@anviltech.com',
    social: { linkedin: '#', twitter: '#', instagram: '#' }
  },
]

const Team = forwardRef((_, ref) => {
  return (
    <section id="team" ref={ref} className="py-5 md:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-[#faa853]/10 mb-4 animate-fade-in">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853]">
              Meet the Team
            </p>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            Expert Educators & Mentors
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Our diverse team brings together industry expertise, teaching excellence, and genuine passion for student success
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM.map((member, idx) => (
            <div
              key={member.name}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Card Container */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image Section */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Social Links - Appear on Hover */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                    <a 
                      href={member.social.linkedin} 
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2d3f5d] hover:bg-[#faa853] hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaLinkedin className="text-lg" />
                    </a>
                    <a 
                      href={member.social.twitter} 
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2d3f5d] hover:bg-[#faa853] hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaTwitter className="text-lg" />
                    </a>
                    <a 
                      href={member.social.instagram} 
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2d3f5d] hover:bg-[#faa853] hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaInstagram className="text-lg" />
                    </a>
                    <a 
                      href={`mailto:${member.email}`} 
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2d3f5d] hover:bg-[#faa853] hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaEnvelope className="text-lg" />
                    </a>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#2d3f5d] mb-1 group-hover:text-[#faa853] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-[#faa853] font-semibold text-sm mb-2">
                    {member.role}
                  </p>
                  
                  {/* Specialty Badge */}
                  <div className="inline-block px-3 py-1 rounded-full bg-[#faa853]/10 text-[#faa853] text-xs font-semibold mb-3">
                    {member.specialty}
                  </div>
                  
                  {/* Experience */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <FaStar className="text-[#faa853] text-xs" />
                    <span className="text-xs text-gray-600">{member.experience} of experience</span>
                  </div>
                  
                  {/* Bio */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#faa853]/5 to-transparent rounded-bl-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

Team.displayName = 'Team'
export default Team