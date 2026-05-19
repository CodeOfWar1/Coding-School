import { supabase } from './supabase'

/**
 * Upload to Supabase Storage. Requires a public bucket (e.g. `site-media`) and policies
 * allowing authenticated uploads for admins. Set `VITE_SUPABASE_SITE_BUCKET` to override bucket name.
 *
 * @returns {{ publicUrl: string } | { error: string }}
 */
export async function uploadSiteMediaFile(file, folder = 'cms') {
  const bucket = import.meta.env.VITE_SUPABASE_SITE_BUCKET || 'site-media'
  if (!file?.name) return { error: 'No file selected.' }

  const ext = file.name.includes('.') ? file.name.split('.').pop().slice(0, 8) : 'bin'
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '') || 'cms'
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (upErr) {
    return {
      error:
        upErr.message ||
        'Upload failed. Create a public bucket `site-media`, set policies, or paste an image URL under `/media/...` instead.',
    }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  const publicUrl = data?.publicUrl
  if (!publicUrl) return { error: 'Could not resolve public URL for uploaded file.' }
  return { publicUrl }
}
