import { FaHandshake } from 'react-icons/fa'
import { LANDING_PARTNER_LOGOS, landingPartnerLogoSrc } from '../../content/landingPartners'

/** Supports CMS rows `{ name, logo_url, activity_summary }` or legacy `{ name, file }`. */
export function resolvePartnerLogo(partner) {
  if (partner.logo_url) return partner.logo_url
  if (partner.file) return landingPartnerLogoSrc(partner.file)
  return ''
}

export default function PartnersGrid({ partners, showActivity = false }) {
  const fallback = LANDING_PARTNER_LOGOS.map((p) => ({
    name: p.name,
    logo_url: landingPartnerLogoSrc(p.file),
    activity_summary: '',
  }))
  const list = partners?.length ? partners : fallback

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
      {list.map((partner, idx) => {
        const src = resolvePartnerLogo(partner)
        const key = `${partner.name}-${idx}`
        return (
          <article
            key={key}
            className="group bg-white rounded-2xl border border-[#2d3f5d]/10 p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-24 md:h-28 flex items-center justify-center mb-4">
              <img src={src} alt={`${partner.name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center gap-2 text-[#2d3f5d] group-hover:text-[#faa853] transition-colors">
              <FaHandshake className="text-sm shrink-0" aria-hidden />
              <p className="text-base font-semibold text-center">{partner.name}</p>
            </div>
            {showActivity && partner.activity_summary ? (
              <p className="mt-4 text-sm leading-relaxed text-gray-600 text-center border-t border-gray-100 pt-4">{partner.activity_summary}</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
