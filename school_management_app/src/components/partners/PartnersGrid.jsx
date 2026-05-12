import { FaHandshake } from 'react-icons/fa'
import { LANDING_PARTNER_LOGOS, landingPartnerLogoSrc } from '../../content/landingPartners'

export default function PartnersGrid({ logos = LANDING_PARTNER_LOGOS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
      {logos.map((partner) => (
        <article
          key={partner.file}
          className="group bg-white rounded-2xl border border-[#2d3f5d]/10 p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="h-24 md:h-28 flex items-center justify-center mb-4">
            <img
              src={landingPartnerLogoSrc(partner.file)}
              alt={`${partner.name} logo`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-[#2d3f5d] group-hover:text-[#faa853] transition-colors">
            <FaHandshake className="text-sm shrink-0" aria-hidden />
            <p className="text-base font-semibold text-center">{partner.name}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
