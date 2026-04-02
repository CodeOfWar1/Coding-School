-- Run in Supabase SQL editor if not using migration runner
alter table coding_submissions add column if not exists feedback text;

alter table landing_content add column if not exists hero_image_url text;
alter table landing_content add column if not exists hero_image_url_secondary text;

comment on column coding_submissions.feedback is 'Instructor feedback shown to student and parent';
