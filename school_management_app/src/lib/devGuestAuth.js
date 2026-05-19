/** Stable UUIDs so dashboard code referencing user.id stays consistent in one session. */
export const DEV_GUEST_IDS = {
  student: 'a0000000-0000-4000-8000-000000000001',
  parent: 'a0000000-0000-4000-8000-000000000002',
  admin: 'a0000000-0000-4000-8000-000000000003',
  finance: 'a0000000-0000-4000-8000-000000000004',
}

/**
 * When `npm run dev` only: browse to /dashboard/student|parent|finance|admin with no login —
 * uses demo data already wired via `isDemoMode` in dashboard views.
 */
export function devGuestRoleFromPath(pathname) {
  if (!pathname.startsWith('/dashboard/')) return null
  if (pathname.startsWith('/dashboard/student')) return 'student'
  if (pathname.startsWith('/dashboard/parent')) return 'parent'
  if (pathname.startsWith('/dashboard/finance')) return 'finance'
  if (pathname.startsWith('/dashboard/admin')) return 'admin'
  return null
}

export function createDevGuestAuth(role) {
  if (!DEV_GUEST_IDS[role]) return null
  const id = DEV_GUEST_IDS[role]
  const now = new Date().toISOString()
  const email = `preview.${role}@dev.anvilcodingacademy.com`
  return {
    user: {
      id,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: now,
      phone: '',
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: {},
      user_metadata: { role },
      identities: [],
      created_at: now,
      updated_at: now,
    },
    profile: {
      id,
      role,
      full_name:
        role === 'student'
          ? 'Preview Student'
          : role === 'parent'
            ? 'Preview Parent'
            : role === 'finance'
              ? 'Preview Finance'
              : 'Preview Admin',
      email,
    },
    isDemoMode: true,
  }
}
