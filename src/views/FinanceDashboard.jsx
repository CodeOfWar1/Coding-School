import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import { commonOptions } from '../components/charts'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

const NAV_BASE = [
  { id: 'dash', label: 'Overview', icon: '🏠' },
  { id: 'pay', label: 'Payments', icon: '💳' },
  { id: 'rec', label: 'Receipts', icon: '🧾' },
  { id: 'rep', label: 'Reports', icon: '📊' },
  { id: 'msg', label: 'Messages', icon: '✉️', badge: 0 },
]

const SECTION_TITLE = {
  dash: 'Overview',
  pay: 'Payments',
  rec: 'Receipts',
  rep: 'Reports',
  msg: 'Messages',
}

function monthKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export default function FinanceDashboard() {
  const { isDemoMode, user } = useAuth()
  const { unreadCount, markRead, read: financeMsgRead } = useMessageInbox(user?.id, 'finance')
  const [payments, setPayments] = useState([])
  const [activeSection, setActiveSection] = useState('dash')
  const [filter, setFilter] = useState({ q: '', date: '' })
  const [toast, setToast] = useState(null)
  const messages = listMessagesForRole('finance')

  const load = useCallback(async () => {
    if (isDemoMode) {
      const now = Date.now()
      setPayments([
        {
          id: 1,
          amount: 300,
          status: 'verified',
          created_at: new Date(now - 86400000 * 75).toISOString(),
          profiles: { full_name: 'Student A' },
          receipts: [{ receipt_number: 'RCPT-1001', receipt_url: '' }],
        },
        {
          id: 2,
          amount: 450,
          status: 'verified',
          created_at: new Date(now - 86400000 * 40).toISOString(),
          profiles: { full_name: 'Student B' },
          receipts: [{ receipt_number: 'RCPT-1002', receipt_url: '' }],
        },
        {
          id: 3,
          amount: 275,
          status: 'pending',
          created_at: new Date(now - 86400000 * 12).toISOString(),
          profiles: { full_name: 'Student C' },
          receipts: [],
        },
        {
          id: 4,
          amount: 500,
          status: 'pending',
          created_at: new Date(now - 86400000 * 3).toISOString(),
          profiles: { full_name: 'Student A' },
          receipts: [{ receipt_number: 'RCPT-1003', receipt_url: '' }],
        },
        {
          id: 5,
          amount: 320,
          status: 'verified',
          created_at: new Date(now - 86400000).toISOString(),
          profiles: { full_name: 'Student D' },
          receipts: [{ receipt_number: 'RCPT-1004', receipt_url: '' }],
        },
      ])
      return
    }
    const { data } = await supabase
      .from('payments')
      .select('*, profiles!payments_student_id_fkey(full_name), receipts(*)')
      .order('created_at', { ascending: false })
    setPayments(data ?? [])
  }, [isDemoMode])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => clearTimeout(id)
  }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        const byName = (p.profiles?.full_name ?? '')
          .toLowerCase()
          .includes((filter.q ?? '').toLowerCase().trim())
        const byDate = filter.date ? String(p.created_at).startsWith(filter.date) : true
        return byName && byDate
      }),
    [payments, filter],
  )

  const markVerified = async (id) => {
    if (!isDemoMode) await supabase.from('payments').update({ status: 'verified' }).eq('id', id)
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'verified' } : p)))
    setToast('Payment marked verified.')
  }

  const verifiedList = useMemo(() => payments.filter((p) => p.status === 'verified'), [payments])
  const pendingList = useMemo(() => payments.filter((p) => p.status !== 'verified'), [payments])

  const amountVerified = verifiedList.reduce((s, p) => s + Number(p.amount || 0), 0)
  const amountPending = pendingList.reduce((s, p) => s + Number(p.amount || 0), 0)
  const amountTotal = amountVerified + amountPending

  const monthlyTotals = useMemo(() => {
    const map = new Map()
    for (const p of payments) {
      const k = monthKey(p.created_at)
      map.set(k, (map.get(k) ?? 0) + Number(p.amount || 0))
    }
    const keys = [...map.keys()].sort()
    return { keys, values: keys.map((k) => map.get(k)) }
  }, [payments])

  const statusCountBar = useMemo(
    () => ({
      labels: ['Verified', 'Pending review'],
      datasets: [
        {
          label: 'Number of payments',
          data: [verifiedList.length, pendingList.length],
          backgroundColor: ['#16a34a', '#ea580c'],
        },
      ],
    }),
    [verifiedList.length, pendingList.length],
  )

  const amountSplitDoughnut = useMemo(
    () => ({
      labels: ['Verified amount', 'Pending amount'],
      datasets: [
        {
          data: [amountVerified, amountPending],
          backgroundColor: ['#15803d', '#fb923c'],
          borderWidth: 0,
        },
      ],
    }),
    [amountVerified, amountPending],
  )

  const cashFlowLine = useMemo(
    () => ({
      labels: monthlyTotals.keys.map(formatMonthLabel),
      datasets: [
        {
          label: 'Recorded payments ($)',
          data: monthlyTotals.values,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    }),
    [monthlyTotals],
  )

  const allReceipts = useMemo(() => {
    const rows = []
    for (const p of payments) {
      const name = p.profiles?.full_name ?? 'Unknown'
      const rs = p.receipts?.length ? p.receipts : [{ receipt_number: '—', receipt_url: '' }]
      for (const r of rs) {
        rows.push({
          paymentId: p.id,
          receipt_number: r.receipt_number,
          receipt_url: r.receipt_url,
          amount: p.amount,
          student: name,
          created_at: p.created_at,
          status: p.status,
        })
      }
    }
    return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [payments])

  const jump = (id) => setActiveSection(id)

  const navItems = useMemo(() => {
    return NAV_BASE.map((n) => (n.id === 'msg' ? { ...n, badge: unreadCount } : { ...n, badge: undefined }))
  }, [unreadCount])

  return (
    <AppShellLayout
      navItems={navItems}
      activeNavId={activeSection}
      onNavSelect={setActiveSection}
      roleLabel="Finance"
      pageTitle={SECTION_TITLE[activeSection] ?? 'Finance'}
      breadcrumbLast="Finance"
      messageCount={unreadCount}
      onMessagesClick={() => setActiveSection('msg')}
    >
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
          {toast}
        </div>
      )}

      {activeSection === 'dash' && (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Overview metrics are tied to the same payment records below. Use the sidebar to open lists and reports.
          </p>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              color="bg-blue-600"
              value={payments.length}
              title="Total payments"
              icon="📥"
              animationDelayMs={0}
              subtitle="All records in the system"
              foot="Open list"
              onMoreInfo={() => {
                jump('pay')
                setToast('Filtered payment list — use search and date.')
              }}
            />
            <MetricCard
              color="bg-green-600"
              value={verifiedList.length}
              title="Verified"
              icon="✓"
              animationDelayMs={80}
              subtitle={`$${amountVerified.toFixed(0)} confirmed`}
              foot="Review reports"
              onMoreInfo={() => {
                jump('rep')
                setToast('Charts reflect verified vs pending amounts.')
              }}
            />
            <MetricCard
              color="bg-orange-500"
              value={pendingList.length}
              title="Pending"
              icon="⏳"
              animationDelayMs={160}
              subtitle={`$${amountPending.toFixed(0)} awaiting verification`}
              foot="Verify in Payments"
              onMoreInfo={() => {
                jump('pay')
                setToast('Pending items are highlighted in the payments list.')
              }}
            />
            <MetricCard
              color="bg-slate-700"
              value={`$${amountTotal.toFixed(0)}`}
              title="Total amount"
              icon="$"
              animationDelayMs={240}
              subtitle="Verified + pending (same rollup as charts)"
              foot="Monthly trend"
              onMoreInfo={() => {
                jump('rep')
                setToast('Line chart: sum of payment amounts by month.')
              }}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Volume by status</h2>
              <p className="mb-3 text-xs text-slate-500">Count of payment records — not dollar amounts.</p>
              <div className="h-56">
                <Bar
                  data={statusCountBar}
                  options={{
                    ...commonOptions,
                    plugins: { ...commonOptions.plugins, legend: { display: false } },
                  }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Money split</h2>
              <p className="mb-3 text-xs text-slate-500">Dollar totals: verified vs still pending.</p>
              <div className="mx-auto h-56 max-w-xs">
                <Doughnut
                  data={amountSplitDoughnut}
                  options={{ ...commonOptions, cutout: '52%' }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Cash-in by month</h2>
            <p className="mb-3 text-xs text-slate-500">
              Sum of all payment amounts (verified + pending) grouped by calendar month.
            </p>
            {monthlyTotals.keys.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No payments to chart yet.</p>
            ) : (
              <div className="h-64">
                <Line
                  data={cashFlowLine}
                  options={{
                    ...commonOptions,
                    scales: {
                      y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {activeSection === 'pay' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                jump('dash')
                setToast('Back to overview charts.')
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Overview
            </button>
            <button
              type="button"
              onClick={() => jump('rec')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Receipts
            </button>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-slate-200 p-2.5 text-sm shadow-sm"
              placeholder="Filter by student name…"
              value={filter.q}
              onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-200 p-2.5 text-sm shadow-sm"
              type="date"
              value={filter.date}
              onChange={(e) => setFilter((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Receipt / status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 ${p.status !== 'verified' ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{p.profiles?.full_name ?? 'Unknown'}</td>
                    <td className="px-4 py-3">${Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-2 text-slate-700">{p.receipts?.[0]?.receipt_number ?? '—'}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.status === 'verified' ? 'bg-emerald-100 text-emerald-900' : 'bg-orange-100 text-orange-900'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status !== 'verified' && (
                        <button
                          type="button"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          onClick={() => markVerified(p.id)}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-8 text-center text-slate-500">No payments match your filters.</p>
            )}
          </div>
        </>
      )}

      {activeSection === 'rec' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            One row per receipt linked to a payment. Rows without a receipt number show &quot;—&quot;.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt #</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Payment status</th>
                </tr>
              </thead>
              <tbody>
                {allReceipts.map((r, idx) => (
                  <tr key={`${r.paymentId}-${r.receipt_number}-${idx}`} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">{r.receipt_number}</td>
                    <td className="px-4 py-3">{r.student}</td>
                    <td className="px-4 py-3">${Number(r.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allReceipts.length === 0 && (
              <p className="p-8 text-center text-slate-500">No receipt data.</p>
            )}
          </div>
        </div>
      )}

      {activeSection === 'rep' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Same metrics as the dashboard, shown larger for reporting. Numbers match the payment table.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Payment counts</h3>
                <p className="mb-2 text-xs text-slate-500">Number of payment records by verification status.</p>
              <div className="h-72">
                <Bar data={statusCountBar} options={commonOptions} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Amount mix</h3>
                <p className="mb-2 text-xs text-slate-500">Total dollars split between verified and pending review.</p>
              <div className="mx-auto h-72 max-w-sm">
                <Doughnut data={amountSplitDoughnut} options={{ ...commonOptions, cutout: '45%' }} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">Monthly cash-in</h3>
              <p className="mb-2 text-xs text-slate-500">Sum of all payments (verified + pending) grouped by month.</p>
            <div className="h-80">
              {monthlyTotals.keys.length === 0 ? (
                <p className="py-16 text-center text-slate-500">No data.</p>
              ) : (
                <Line
                  data={cashFlowLine}
                  options={{
                    ...commonOptions,
                    scales: {
                      y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'msg' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
          <p className="mt-2 text-sm text-slate-600">
            Finance desk notifications.
          </p>
          <div className="mt-4 space-y-3">
            {messages.map((m) => (
              <article key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {m.target} · {new Date(m.created_at).toLocaleString()}
                </p>
                <p className="mt-1 font-semibold text-slate-900">{m.title}</p>
                <p className="mt-2 text-sm text-slate-700">{m.body}</p>
              </article>
            ))}
            {messages.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                No announcements yet.
              </p>
            )}
          </div>
          <div
            className={`mt-4 rounded-xl border p-4 transition ${
              financeMsgRead
                ? 'border-slate-200 bg-slate-50'
                : 'border-sky-200 bg-sky-50/80 ring-2 ring-sky-200/50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Office</p>
                <p className="font-semibold text-slate-900">Daily settlement summary</p>
                <p className="mt-2 text-sm text-slate-700">
                  Reminder: verify pending payments before end of day. Export receipts from the Receipts tab.
                </p>
              </div>
              {!financeMsgRead && (
                <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs font-bold text-white">New</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => markRead()}
              className="mt-3 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              {financeMsgRead ? 'Marked as read' : 'Mark as read'}
            </button>
          </div>
        </div>
      )}
    </AppShellLayout>
  )
}
