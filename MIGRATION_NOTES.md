# Django to React/Supabase Migration Notes

## Scope

- Migrated role-based system flows (HOD, Staff, Student, Parent) into `frontend`.
- Replaced Django auth/session routing with Supabase Auth and role-based route guards.
- Replaced SQLite ORM models with Supabase PostgreSQL schema and RLS.
- Added UI preview mode for frontend-only testing without live DB credentials.

## Legacy Paths

- Django project settings and routing references are preserved in:
  - `legacy-django/school_management_system`

## Active Paths

- App source: `frontend/src`
- Database schema and policies: `frontend/supabase/schema.sql`
- Conversion coverage UI: `frontend/src/pages/ConversionCoveragePage.jsx` (`/conversion-coverage`)

## Operational Reminder

Any new backend logic should be implemented through Supabase (SQL, RLS, Storage, RPC/Edge Functions), not Django URLs/views.

## school_management_app Conversion Status

- Django templates are consolidated into React dashboard modules per role.
- Core converted areas: authentication, course/subject/session management, attendance create/update, leave apply/approve, feedback + replies, notifications, result workflows, and news/comments.
- Some legacy single-purpose template pages are intentionally merged into richer dashboard sections for better UX.
