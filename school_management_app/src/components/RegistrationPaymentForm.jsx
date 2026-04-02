import { useState } from 'react'
import { isDemoMode, supabase } from '../lib/supabase'

/**
 * Shared registration + payment form (full page or modal).
 * @param {{ onSuccess?: () => void, className?: string }} props
 */
export default function RegistrationPaymentForm({ onSuccess, className = '' }) {
  const [form, setForm] = useState({
    studentName: '',
    parentName: '',
    parentEmail: '',
    amount: '',
    method: 'card',
  })
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setValue = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isDemoMode) {
        setReceipt({ receipt_number: `RCPT-${Date.now()}`, generated_at: new Date().toISOString() })
        onSuccess?.()
        return
      }
      const { data: registration, error: rErr } = await supabase
        .from('public_registrations')
        .insert({ student_name: form.studentName, parent_name: form.parentName, parent_email: form.parentEmail })
        .select('*')
        .single()
      if (rErr) return setError(rErr.message)
      const { data: payment, error: pErr } = await supabase
        .from('payments')
        .insert({
          registration_id: registration.id,
          amount: Number(form.amount),
          method: form.method,
          status: 'verified',
        })
        .select('*')
        .single()
      if (pErr) return setError(pErr.message)
      const { data: rec, error: recErr } = await supabase
        .from('receipts')
        .insert({ payment_id: payment.id, receipt_number: `RCPT-${Date.now()}`, receipt_url: '' })
        .select('*')
        .single()
      if (recErr) return setError(recErr.message)
      setReceipt(rec)
      onSuccess?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Student name
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-2"
              placeholder="Full name"
              value={form.studentName}
              onChange={(e) => setValue('studentName', e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Parent / guardian name
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-2"
              placeholder="Full name"
              value={form.parentName}
              onChange={(e) => setValue('parentName', e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
            Contact email
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-2"
              placeholder="parent@email.com"
              type="email"
              value={form.parentEmail}
              onChange={(e) => setValue('parentEmail', e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Amount (USD)
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-2"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setValue('amount', e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Method
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-2"
              value={form.method}
              onChange={(e) => setValue('method', e.target.value)}
            >
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Processing…' : 'Submit payment'}
        </button>
      </form>

      {receipt && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-950 shadow-inner">
          <p className="font-bold text-emerald-900">Receipt generated</p>
          <p className="mt-1 text-sm">
            <span className="text-emerald-800/80">No.</span> {receipt.receipt_number}
          </p>
          {receipt.generated_at && (
            <p className="text-sm text-emerald-800/90">
              {new Date(receipt.generated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
