import { SCHOOL_MEDIA_IMAGES } from './schoolMedia'
import { LANDING_PARTNER_LOGOS, landingPartnerLogoSrc, LANDING_PARTNERS_INTRO } from './landingPartners'
import { SCHOOL_PROFILE } from './siteProfile'

/** Landing gallery strip — mirrors legacy `Gallery.jsx` defaults. */
export const DEFAULT_GALLERY_ITEMS = [
  { title: 'Coding Projects', image_url: SCHOOL_MEDIA_IMAGES.hero },
  { title: 'Robotics Build Day', image_url: SCHOOL_MEDIA_IMAGES.lab },
  { title: 'Girls Tech Cohort', image_url: SCHOOL_MEDIA_IMAGES.classA },
  { title: 'Community Outreach', image_url: SCHOOL_MEDIA_IMAGES.social },
  { title: 'Game Design Studio', image_url: SCHOOL_MEDIA_IMAGES.classB },
  { title: 'Classroom Events', image_url: SCHOOL_MEDIA_IMAGES.classC },
]

export const DEFAULT_PARTNERS_ITEMS = LANDING_PARTNER_LOGOS.map((p) => ({
  name: p.name,
  logo_url: landingPartnerLogoSrc(p.file),
  /** Short blurb for the full partners page / admin CMS */
  activity_summary: '',
}))

/**
 * Initial shape for `landing_content` row in admin and public merge.
 * DB may omit keys; UI fills from this template.
 */
export function emptyLandingContent() {
  return {
    hero_title: '',
    hero_text: '',
    hero_image_url: '',
    hero_image_url_secondary: '',
    gallery_eyebrow: 'Moments',
    gallery_heading: 'Our Learning Journey',
    gallery_subtitle: 'Capturing the excitement, creativity, and growth at Anvil Tech Academy',
    gallery_items: DEFAULT_GALLERY_ITEMS,
    partners_intro: LANDING_PARTNERS_INTRO,
    partners_page_title: 'Our partners',
    partners_page_subtitle: `Schools and organizations that work with ${SCHOOL_PROFILE.name} to bring coding and digital skills to more learners.`,
    partners_items: DEFAULT_PARTNERS_ITEMS,
    about_eyebrow: 'About Us',
    about_heading: 'Shaping Future Tech Leaders',
    about_lead: SCHOOL_PROFILE.aboutLead,
    about_image_url: SCHOOL_MEDIA_IMAGES.hero,
    announcement_banner: '',
    contact_email_display: SCHOOL_PROFILE.contact?.email ?? '',
    contact_phone_display: SCHOOL_PROFILE.contact?.phone ?? '',
  }
}
