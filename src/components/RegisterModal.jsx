import { useEffect, useMemo, useState } from 'react'

export default function RegisterModal({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    learnerName: '',
    age: '',
    guardianName: '',
    phone: '',
    email: '',
    program: 'Digital Literacy',
    note: '',
  })

  const programOptions = useMemo(
    () => [
      'Digital Literacy',
      'Python',
      'Robotics',
      'Visual Programming',
      'Game Design',
      'Web Development',
      'Cybersecurity',
      'Artificial Intelligence',
    ],
    [],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setSubmitted(false)
  }, [open])

  if (!open) return null

  const setValue = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-[var(--anvil-royal)]/20 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <div className="shrink-0 bg-gradient-to-br from-[var(--anvil-royal)] via-[var(--anvil-cyan)] to-[var(--anvil-royal-deep)] px-6 pb-7 pt-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/75">Student enrollment</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">Register</h2>
              <p className="mt-2 max-w-lg text-base text-white/90">
                This registration form is for enrollment. For in-person meetings and inquiries, use the appointment section.
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25">
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-lg font-extrabold text-emerald-900">Registration received</p>
              <p className="mt-2 text-sm text-emerald-900/80">
                We’ll contact you shortly using the details provided. You can also reach us directly using the contact page.
              </p>
              <button type="button" className="btn-theme-primary mt-5 w-full px-5 py-3 text-sm" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Learner name
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    value={form.learnerName}
                    onChange={(e) => setValue('learnerName', e.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Age (5–19)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    type="number"
                    min="5"
                    max="19"
                    value={form.age}
                    onChange={(e) => setValue('age', e.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Program
                  <select
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    value={form.program}
                    onChange={(e) => setValue('program', e.target.value)}
                  >
                    {programOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Guardian name
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    value={form.guardianName}
                    onChange={(e) => setValue('guardianName', e.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    value={form.phone}
                    onChange={(e) => setValue('phone', e.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Email
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    type="email"
                    value={form.email}
                    onChange={(e) => setValue('email', e.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Note (optional)
                  <textarea
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--anvil-cyan)] focus:ring-2 focus:ring-[var(--anvil-cyan)]/20"
                    rows={4}
                    value={form.note}
                    onChange={(e) => setValue('note', e.target.value)}
                  />
                </label>
              </div>

              <button type="submit" className="btn-theme-primary w-full px-5 py-3 text-sm shadow-md">
                Submit registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

