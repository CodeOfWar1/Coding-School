import { emptyLandingContent } from '../content/landingSiteDefaults'

export function parseJsonArray(raw, fallback) {
  if (raw == null) return fallback
  if (Array.isArray(raw)) return raw.length ? raw : fallback
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) && p.length ? p : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

function sanitizeGalleryItems(items, fallback) {
  const list = Array.isArray(items) ? items : fallback
  const cleaned = list
    .map((row) => ({
      title: String(row?.title ?? '').trim() || 'Untitled',
      image_url: String(row?.image_url ?? '').trim(),
    }))
    .filter((row) => row.image_url)
  return cleaned.length ? cleaned : fallback
}

function sanitizePartnerItems(items, fallback) {
  const list = Array.isArray(items) ? items : fallback
  const cleaned = list
    .map((row) => {
      const logo_url = String(row?.logo_url ?? '').trim()
      const file = row?.file ? String(row.file).trim() : ''
      return {
        name: String(row?.name ?? '').trim() || 'Partner',
        logo_url,
        file: file || undefined,
        activity_summary: String(row?.activity_summary ?? '').trim(),
      }
    })
    .filter((row) => row.logo_url || row.file)
  return cleaned.length ? cleaned : fallback
}

/**
 * Merge a Supabase `landing_content` row with defaults for public pages and admin state.
 */
export function mergeLandingSiteRow(dbRow) {
  const base = emptyLandingContent()
  if (!dbRow || typeof dbRow !== 'object') return base

  const gallery_items = sanitizeGalleryItems(parseJsonArray(dbRow.gallery_items, base.gallery_items), base.gallery_items)
  const partners_items = sanitizePartnerItems(parseJsonArray(dbRow.partners_items, base.partners_items), base.partners_items)

  return {
    ...base,
    ...dbRow,
    hero_title: dbRow.hero_title ?? base.hero_title,
    hero_text: dbRow.hero_text ?? base.hero_text,
    hero_image_url: dbRow.hero_image_url ?? base.hero_image_url,
    hero_image_url_secondary: dbRow.hero_image_url_secondary ?? base.hero_image_url_secondary,
    gallery_eyebrow: dbRow.gallery_eyebrow ?? base.gallery_eyebrow,
    gallery_heading: dbRow.gallery_heading ?? base.gallery_heading,
    gallery_subtitle: dbRow.gallery_subtitle ?? base.gallery_subtitle,
    gallery_items,
    partners_intro: dbRow.partners_intro ?? base.partners_intro,
    partners_page_title: dbRow.partners_page_title ?? base.partners_page_title,
    partners_page_subtitle: dbRow.partners_page_subtitle ?? base.partners_page_subtitle,
    partners_items,
    about_eyebrow: dbRow.about_eyebrow ?? base.about_eyebrow,
    about_heading: dbRow.about_heading ?? base.about_heading,
    about_lead: dbRow.about_lead ?? base.about_lead,
    about_image_url: dbRow.about_image_url ?? base.about_image_url,
    announcement_banner: dbRow.announcement_banner ?? base.announcement_banner,
    contact_email_display: dbRow.contact_email_display ?? base.contact_email_display,
    contact_phone_display: dbRow.contact_phone_display ?? base.contact_phone_display,
  }
}

/** Payload for Supabase upsert (single-row CMS id = 1). */
export function buildLandingUpsertPayload(content) {
  const merged = mergeLandingSiteRow(content)
  return {
    id: 1,
    hero_title: merged.hero_title || null,
    hero_text: merged.hero_text || null,
    hero_image_url: merged.hero_image_url || null,
    hero_image_url_secondary: merged.hero_image_url_secondary || null,
    gallery_eyebrow: merged.gallery_eyebrow || null,
    gallery_heading: merged.gallery_heading || null,
    gallery_subtitle: merged.gallery_subtitle || null,
    gallery_items: merged.gallery_items,
    partners_intro: merged.partners_intro || null,
    partners_page_title: merged.partners_page_title || null,
    partners_page_subtitle: merged.partners_page_subtitle || null,
    partners_items: merged.partners_items,
    about_eyebrow: merged.about_eyebrow || null,
    about_heading: merged.about_heading || null,
    about_lead: merged.about_lead || null,
    about_image_url: merged.about_image_url || null,
    announcement_banner: merged.announcement_banner || null,
    contact_email_display: merged.contact_email_display || null,
    contact_phone_display: merged.contact_phone_display || null,
  }
}
