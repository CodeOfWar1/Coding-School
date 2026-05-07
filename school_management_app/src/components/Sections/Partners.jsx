import { forwardRef } from 'react'
import { FaHandshake } from 'react-icons/fa'

const PARTNER_LOGOS = [
  { name: 'Best Buddies Academy', file: 'Best_Buddies_Academy.png' },
  { name: 'Pestalozzi Academy', file: 'pestalozzi Academy.jpeg' },
  { name: 'Rose Garden School', file: 'Rose_Garden_School.png' },
  { name: 'TLL Academy and Learning Ladder', file: 'TLL_Academy_and_Learning_Ladder.png' },
]

const Partners = forwardRef((_, ref) => {
  return (
    <section id="partners" ref={ref} className="py-16 md:py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3 animate-fade-in">
            Our Partners
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            Trusted By Leading Schools
          </h2>
          <p className="site-body max-w-3xl mx-auto animate-fade-in animation-delay-200">
            We collaborate with mission-driven institutions to expand access to world-class digital learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
          {PARTNER_LOGOS.map((partner) => (
            <article
              key={partner.file}
              className="group bg-white rounded-2xl border border-[#2d3f5d]/10 p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-24 md:h-28 flex items-center justify-center mb-4">
                <img
                  src={`/media/partner logos/${partner.file}`}
                  alt={`${partner.name} logo`}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-[#2d3f5d] group-hover:text-[#faa853] transition-colors">
                <FaHandshake className="text-sm" />
                <p className="text-base font-semibold text-center">{partner.name}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
})

Partners.displayName = 'Partners'
export default Partners
