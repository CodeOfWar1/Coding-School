-- Extend `landing_content` for admin-managed gallery, partners, and marketing fields.
-- Run in Supabase SQL Editor on your project (adjust table name if different).

alter table public.landing_content add column if not exists gallery_eyebrow text;
alter table public.landing_content add column if not exists gallery_heading text;
alter table public.landing_content add column if not exists gallery_subtitle text;
alter table public.landing_content add column if not exists gallery_items jsonb default '[]'::jsonb;
alter table public.landing_content add column if not exists partners_intro text;
alter table public.landing_content add column if not exists partners_page_title text;
alter table public.landing_content add column if not exists partners_page_subtitle text;
alter table public.landing_content add column if not exists partners_items jsonb default '[]'::jsonb;
alter table public.landing_content add column if not exists about_eyebrow text;
alter table public.landing_content add column if not exists about_heading text;
alter table public.landing_content add column if not exists about_lead text;
alter table public.landing_content add column if not exists about_image_url text;
alter table public.landing_content add column if not exists announcement_banner text;
alter table public.landing_content add column if not exists contact_email_display text;
alter table public.landing_content add column if not exists contact_phone_display text;

-- Optional: ensure anonymous users can read landing content for the public site (adjust to your RLS model).
-- create policy "landing_content_select_public" on public.landing_content for select using (true);
