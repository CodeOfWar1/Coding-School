const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const placeholder = !url || !key || url.includes('YOUR_PROJECT_ID') || key.includes('YOUR_SUPABASE_ANON_KEY')
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || placeholder

function mockBuilder() {
  const b = {
    select: () => b,
    insert: () => b,
    update: () => b,
    upsert: () => b,
    delete: () => b,
    eq: () => b,
    in: () => b,
    order: () => b,
    limit: () => b,
    then: (resolve) => Promise.resolve({ data: [], error: null }).then(resolve),
    async single() {
      return { data: { id: 1, receipt_number: `RCPT-${Date.now()}`, generated_at: new Date().toISOString() }, error: null }
    },
    async maybeSingle() {
      return { data: null, error: null }
    },
  }
  return b
}

const demoClient = {
  auth: {
    async signInWithPassword() {
      return { data: { user: { id: 'demo-user' } }, error: null }
    },
    async signOut() {
      return { error: null }
    },
    async getSession() {
      return { data: { session: null }, error: null }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    async updateUser() {
      return { data: null, error: null }
    },
  },
  from: () => mockBuilder(),
}

export const supabase = isDemoMode
  ? demoClient
  : (await import('@supabase/supabase-js')).createClient(url, key)
