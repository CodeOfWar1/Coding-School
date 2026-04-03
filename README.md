<<<<<<< HEAD
# School Management System (React + Tailwind + Supabase)

This project is now frontend-first and runs from `school_management_app` as a React + Tailwind app.
The old Django codebase is retained only as legacy reference.

## Main App (Current)

- Frontend: `school_management_app`
- Converted system config folder: `school_management_system` (JS config modules)
- Legacy Django reference files: `legacy-django/school_management_system_original`
- Active UI source: `school_management_app/src`

## Quick Start (Root)

```bash
npm run install:app
npm run dev
```

This starts the React app from the root project without running Python.

## Run Frontend

```bash
cd school_management_app
npm install
npm run dev
```

## Supabase Setup

Supabase integration can be added on top of this converted React app when needed.

## Migration Note

The old Django runtime config under `school_management_system` and old Django app files are superseded by the React stack. Reference copies are kept under `legacy-django`.
Do not use `python manage.py runserver` for the migrated UI workflow.
=======
# Coding-School
>>>>>>> 29d19ffe6c0f003e902eaf4b686913134ea7cabd
