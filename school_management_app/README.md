# Coding School App (React + Tailwind + Supabase)

This app includes:
- Landing page
- Student registration + initial payment + auto receipt
- Role-based login and dashboards (`student`, `parent`, `finance`, `admin`)
- Task/submission/progress/deadline flow for students
- Parent payment/receipt monitoring
- Finance payment verification/report filtering
- Admin user/task/landing-content management

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Supabase

- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- For UI-only demo without DB, keep `VITE_DEMO_MODE=true`
- Apply DB schema from `supabase/schema.sql`
