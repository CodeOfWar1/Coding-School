import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import RegistrationPaymentForm from './RegistrationPaymentForm'

export default function PaymentRegistrationModal({ open, onClose }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <div className="shrink-0 bg-gradient-to-br from-sky-600 via-indigo-600 to-fuchsia-600 px-6 pb-8 pt-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/75">Enrollment</p>
              <h2 id="payment-modal-title" className="mt-1 text-2xl font-black tracking-tight">
                Register & pay
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/85">
                Secure intake for student registration and initial payment. You must be signed in to submit — this
                links the record to your school account.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {!user ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-800">Sign in required</p>
              <p className="mt-2 text-sm text-slate-600">
                Creating a registration and payment record requires an active session. Please sign in with your school
                account, then open this dialog again from the landing page.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  to="/login"
                  className="inline-flex justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-sky-500"
                  onClick={onClose}
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-xs text-slate-500">
                Prefer a full page?{' '}
                <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500" onClick={onClose}>
                  Open registration page
                </Link>
              </p>
              <RegistrationPaymentForm />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
