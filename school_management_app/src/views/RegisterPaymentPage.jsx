import RegistrationPaymentForm from '../components/RegistrationPaymentForm'
import SiteNavbar from '../components/SiteNavbar'

export default function RegisterPaymentPage() {
  return (
    <div className="vivi-page min-h-screen" style={{ background: 'var(--app-bg-page)' }}>
      <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-brand)]">Signed in</p>
        <h1 className="vivi-heading mt-2 text-3xl tracking-tight text-slate-900">Register student + payment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submit enrollment details and initial payment. Records are stored per your school&apos;s Supabase rules.
        </p>
        <div className="vivi-card mt-8 p-6">
          <RegistrationPaymentForm />
        </div>
      </main>
    </div>
  )
}
