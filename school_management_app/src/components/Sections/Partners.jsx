import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import PartnersGrid from '../partners/PartnersGrid'
import { useLandingSiteContent } from '../../hooks/useLandingSiteContent'

const Partners = forwardRef((_, ref) => {
  const { data: site } = useLandingSiteContent()

  return (
    <section id="partners" ref={ref} className="py-16 md:py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-14">
          <div data-reveal className="scroll-reveal">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3">Our Partners</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4">Trusted By Leading Schools</h2>
            <p className="site-body max-w-3xl mx-auto">{site.partners_intro}</p>
          </div>
        </div>

        <div data-reveal className="scroll-reveal">
          <PartnersGrid partners={site.partners_items} />
        </div>

        <div data-reveal className="flex flex-wrap items-center justify-center gap-4 mt-10 md:mt-12 scroll-reveal">
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2d3f5d] text-white text-sm font-semibold hover:bg-[#1a2542] transition-all shadow-sm"
          >
            Learn more about our partners
            <FaArrowRight className="text-xs" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
})

Partners.displayName = 'Partners'
export default Partners
