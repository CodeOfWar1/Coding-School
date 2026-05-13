import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import { commonOptions } from '../components/charts'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  FaArrowLeft,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCheckDouble,
  FaClipboardList,
  FaEnvelope,
  FaFileInvoiceDollar,
  FaInbox,
  FaReceipt,
  FaSearch,
} from 'react-icons/fa'

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

function statusPillClass(status) {
  return status === 'verified'
    ? 'border border-emerald-200/90 bg-gradient-to-r from-emerald-50 to-white font-heading text-emerald-900'
    : 'border border-amber-200/90 bg-gradient-to-r from-[#fff8ef] to-white font-heading text-amber-950'
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
          backgroundColor: ['rgba(45, 63, 93, 0.9)', 'rgba(250, 168, 83, 0.92)'],
          borderColor: ['rgba(250, 168, 83, 0.55)', 'rgba(45, 63, 93, 0.45)'],
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
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
          backgroundColor: ['rgba(45, 63, 93, 0.94)', 'rgba(250, 168, 83, 0.9)'],
          borderWidth: 4,
          borderColor: '#ffffff',
          hoverOffset: 6,
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
          borderColor: '#2d3f5d',
          backgroundColor: 'rgba(250, 168, 83, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#faa853',
          pointBorderColor: '#2d3f5d',
          pointBorderWidth: 2,
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
          <p className="mb-4 text-sm text-gray-600">
            Overview metrics are tied to the same payment records below. Use the sidebar to open lists and reports.
          </p>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              color="bg-primary"
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
              color="bg-[#243652]"
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

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border-2 border-secondary/10 bg-gradient-to-br from-white via-[#f8fbff] to-white p-5 shadow-xl shadow-secondary/[0.07] md:p-6">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-secondary to-primary" aria-hidden />
              <div className="mb-4 flex items-start gap-3 pl-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <FaChartBar className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-secondary">Volume by status</h2>
                  <p className="text-xs text-gray-500">Count of payment records — not dollar amounts</p>
                </div>
              </div>
              <div className="h-56 rounded-2xl bg-white/80 p-2 ring-1 ring-secondary/[0.06]">
                <Bar
                  data={statusCountBar}
                  options={{
                    ...commonOptions,
                    plugins: { ...commonOptions.plugins, legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748b' }, grid: { color: 'rgba(45,63,93,0.06)' } },
                      x: { ticks: { color: '#64748b', font: { weight: '600' } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
              <p className="mt-3 text-[11px] font-medium text-secondary/55">Navy = verified rows · Amber = pending review</p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-[#fff8ef]/90 via-white to-[#f8fbff]/80 p-5 shadow-xl shadow-primary/[0.06] md:p-6">
              <div className="pointer-events-none absolute -right-10 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden />
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#e89235] text-white shadow-md">
                  <FaChartPie className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-secondary">Money split</h2>
                  <p className="text-xs text-gray-500">Dollar totals — verified vs pending</p>
                </div>
              </div>
              <div className="relative mx-auto h-56 max-w-[13rem]">
                <Doughnut
                  data={amountSplitDoughnut}
                  options={{
                    ...commonOptions,
                    cutout: '58%',
                    plugins: {
                      ...commonOptions.plugins,
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11, weight: '600' } } },
                    },
                  }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                  <div className="text-center">
                    <p className="font-heading text-xl font-black tabular-nums text-secondary">${amountTotal.toFixed(0)}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">combined</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-secondary/10 bg-white p-5 shadow-2xl shadow-secondary/[0.08] md:p-6">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8fbff] text-secondary ring-1 ring-secondary/10">
                  <FaChartLine className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-secondary">Cash-in by month</h2>
                  <p className="text-xs text-gray-500">
                    Sum of all payment amounts (verified + pending) grouped by calendar month
                  </p>
                </div>
              </div>
            </div>
            {monthlyTotals.keys.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">No payments to chart yet.</p>
            ) : (
              <div className="mt-5 h-64 md:h-72">
                <Line
                  data={cashFlowLine}
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(45, 63, 93, 0.92)',
                        padding: 12,
                        cornerRadius: 12,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (v) => `$${v}`, color: '#64748b' },
                        grid: { color: 'rgba(45, 63, 93, 0.06)' },
                      },
                      x: { ticks: { color: '#64748b' }, grid: { display: false } },
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
          <header className="relative mb-6 overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.06] via-white to-primary/[0.07] p-6 shadow-lg md:p-7">
            <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operations</p>
                <h2 className="font-heading mt-2 text-2xl font-black text-secondary md:text-3xl">Payments queue</h2>
                <p className="mt-2 max-w-xl text-sm text-gray-600">
                  Filter by student or date. Pending rows are highlighted — verify when receipt checks out.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    jump('dash')
                    setToast('Back to overview charts.')
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-secondary/15 bg-white px-4 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-[#f8fbff]"
                >
                  <FaArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => jump('rec')}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#243652]"
                >
                  <FaReceipt className="h-3.5 w-3.5" aria-hidden />
                  Receipts
                </button>
              </div>
            </div>
          </header>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <label className="relative block">
              <span className="sr-only">Filter by student name</span>
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" aria-hidden />
              <input
                className="portal-input pl-10 shadow-md shadow-secondary/[0.04]"
                placeholder="Filter by student name…"
                value={filter.q}
                onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))}
              />
            </label>
            <input className="portal-input shadow-md shadow-secondary/[0.04]" type="date" value={filter.date} onChange={(e) => setFilter((p) => ({ ...p, date: e.target.value }))} />
          </div>

          <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-xl shadow-secondary/[0.06]">
            <div className="flex flex-wrap items-center gap-2 border-b border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white px-4 py-3 md:px-5">
              <FaFileInvoiceDollar className="text-primary" aria-hidden />
              <span className="font-heading text-sm font-bold text-secondary">Payment records</span>
              <span className="ml-auto rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                {filtered.length} shown
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="portal-table-head text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Receipt / status</th>
                    <th className="px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/[0.07]">
                  {filtered.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`transition hover:bg-primary/[0.04] ${
                        p.status !== 'verified'
                          ? 'bg-[#fff8ef]/65 hover:bg-[#fff8ef]/85'
                          : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-[#f8fbff]/45'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-heading font-semibold text-secondary">
                        {p.profiles?.full_name ?? 'Unknown'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-sm font-bold tabular-nums text-secondary">
                        ${Number(p.amount).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="mr-2 font-mono text-xs text-secondary">{p.receipts?.[0]?.receipt_number ?? '—'}</span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusPillClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.status !== 'verified' && (
                          <button
                            type="button"
                            className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98]"
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
                <p className="p-10 text-center text-sm text-gray-500">No payments match your filters.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeSection === 'rec' && (
        <div className="space-y-6">
          <header className="rounded-3xl border border-secondary/10 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-md md:flex md:items-center md:justify-between md:gap-6 md:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg ring-2 ring-white">
                <FaReceipt className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-secondary md:text-2xl">Receipt ledger</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                  One row per receipt linked to a payment. Missing receipt numbers show &quot;—&quot;. Status mirrors the
                  parent payment.
                </p>
              </div>
            </div>
          </header>

          <div className="overflow-hidden rounded-3xl border-2 border-dashed border-secondary/15 bg-white shadow-xl shadow-secondary/[0.06]">
            <div className="border-b border-secondary/10 bg-gradient-to-r from-secondary/[0.06] to-transparent px-5 py-3">
              <span className="font-heading text-sm font-bold text-secondary">All receipt rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b-2 border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white text-xs font-bold uppercase tracking-wider text-secondary">
                  <tr>
                    <th className="px-4 py-3.5">Receipt #</th>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Payment status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/[0.07]">
                  {allReceipts.map((r, idx) => (
                    <tr
                      key={`${r.paymentId}-${r.receipt_number}-${idx}`}
                      className={`transition hover:bg-emerald-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-secondary">{r.receipt_number}</td>
                      <td className="px-4 py-3.5 font-medium text-secondary">{r.student}</td>
                      <td className="px-4 py-3.5 font-mono font-bold tabular-nums text-secondary">${Number(r.amount).toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusPillClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allReceipts.length === 0 && (
                <p className="p-10 text-center text-sm text-gray-500">No receipt data.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'rep' && (
        <div className="space-y-8">
          <header className="relative mb-2 overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef]/70 p-6 shadow-xl md:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                  <FaClipboardList className="text-primary" aria-hidden />
                  Reporting workspace
                </p>
                <h2 className="font-heading mt-3 text-3xl font-black text-secondary md:text-4xl">Finance reports</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                  Same rollups as Overview, optimized for review. Figures reconcile with the Payments and Receipts tabs.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-2xl border border-secondary/15 bg-white px-4 py-2 text-xs font-bold text-secondary shadow-sm">
                  {verifiedList.length} verified
                </span>
                <span className="rounded-2xl border border-primary/35 bg-primary/15 px-4 py-2 text-xs font-bold text-secondary shadow-sm">
                  {pendingList.length} pending
                </span>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-200/40 bg-white p-6 shadow-2xl shadow-emerald-900/[0.04] md:p-7">
              <div className="absolute right-4 top-4 flex gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
                  Counts
                </span>
              </div>
              <div className="mb-6 flex items-start gap-4 pr-16">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <FaChartBar className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-secondary">Payment counts</h3>
                  <p className="mt-1 text-sm text-gray-500">Records by verification status — not dollar totals</p>
                </div>
              </div>
              <div className="h-72 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white p-3 ring-1 ring-emerald-100">
                <Bar
                  data={statusCountBar}
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: { display: false },
                      tooltip: { backgroundColor: 'rgba(45, 63, 93, 0.92)', cornerRadius: 12 },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#64748b' },
                        grid: { color: 'rgba(16, 185, 129, 0.08)' },
                      },
                      x: { ticks: { color: '#64748b', font: { weight: '600' } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border-2 border-amber-300/35 bg-gradient-to-br from-[#fffbeb] via-white to-[#f8fbff] p-6 shadow-2xl md:p-7">
              <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
              <div className="relative mb-6 flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#e89235] text-secondary shadow-lg ring-2 ring-white">
                  <FaChartPie className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-secondary">Amount mix</h3>
                  <p className="mt-1 text-sm text-gray-500">Dollar split — verified vs pending review</p>
                </div>
              </div>
              <div className="relative mx-auto h-72 max-w-xs">
                <Doughnut
                  data={amountSplitDoughnut}
                  options={{
                    ...commonOptions,
                    cutout: '48%',
                    plugins: {
                      ...commonOptions.plugins,
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11, weight: '600' } } },
                    },
                  }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-14">
                  <div className="text-center">
                    <p className="font-heading text-3xl font-black tabular-nums text-secondary">${amountTotal.toFixed(0)}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">total volume</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="relative overflow-hidden rounded-3xl border border-secondary/15 bg-gradient-to-b from-[#0f172a] via-secondary to-[#1a2542] p-6 text-white shadow-2xl md:p-8">
            <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/40">
                  <FaChartLine className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">Monthly cash-in</h3>
                  <p className="text-sm text-white/70">All payments summed by calendar month</p>
                </div>
              </div>
              <span className="rounded-full bg-primary/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary ring-1 ring-primary/40">
                Trend
              </span>
            </div>
            <div className="relative rounded-2xl bg-white/95 p-4 ring-2 ring-white/10">
              {monthlyTotals.keys.length === 0 ? (
                <p className="py-16 text-center text-sm text-gray-500">No data.</p>
              ) : (
                <div className="h-80">
                  <Line
                    data={cashFlowLine}
                    options={{
                      ...commonOptions,
                      plugins: {
                        ...commonOptions.plugins,
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(45, 63, 93, 0.95)',
                          cornerRadius: 12,
                          padding: 12,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (v) => `$${v}`, color: '#64748b' },
                          grid: { color: 'rgba(45, 63, 93, 0.08)' },
                        },
                        x: { ticks: { color: '#64748b' }, grid: { display: false } },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeSection === 'msg' && (
        <div className="space-y-8">
          <header className="relative overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.07] via-white to-primary/[0.08] p-6 shadow-xl md:p-8">
            <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary shadow-sm">
                  <FaEnvelope className="text-primary" aria-hidden />
                  Finance desk
                </p>
                <h2 className="font-heading mt-4 text-3xl font-black text-secondary md:text-4xl">Messages</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  Broadcasts and reminders for finance staff. Mark the inbox read once you&apos;ve reviewed everything.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && !financeMsgRead && (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-bold text-secondary shadow-md">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" aria-hidden />
                    Unread
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-2xl border border-secondary/15 bg-white/90 px-4 py-2 text-xs font-bold text-secondary shadow-md">
                  <FaInbox className="text-primary" aria-hidden />
                  {messages.length} broadcast{messages.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            {messages.map((m) => {
              const office = String(m.target).toLowerCase() === 'finance' || String(m.target).toLowerCase() === 'office'
              return (
                <article
                  key={m.id}
                  className={[
                    'group relative overflow-hidden rounded-3xl border-2 bg-white p-0 shadow-lg transition duration-200',
                    'hover:-translate-y-0.5 hover:shadow-2xl',
                    office
                      ? 'border-secondary/25 ring-1 ring-secondary/10'
                      : 'border-primary/25 hover:border-primary/40',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'absolute left-0 top-0 h-full w-1.5',
                      office ? 'bg-gradient-to-b from-secondary to-[#1a2542]' : 'bg-gradient-to-b from-primary to-[#e89235]',
                    ].join(' ')}
                    aria-hidden
                  />
                  <div className="relative flex gap-4 px-5 pb-5 pt-5 md:gap-5 md:px-7 md:pb-7 md:pt-7">
                    <div
                      className={[
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg ring-2 ring-white md:h-16 md:w-16',
                        office ? 'bg-gradient-to-br from-secondary to-[#1a2542]' : 'bg-gradient-to-br from-primary to-[#e89235] text-secondary',
                      ].join(' ')}
                    >
                      {(String(m.title ?? '').trim().slice(0, 1) || '?').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary ring-1 ring-secondary/10">
                          {m.target}
                        </span>
                        <time className="text-xs font-medium tabular-nums text-gray-500" dateTime={m.created_at}>
                          {new Date(m.created_at).toLocaleString()}
                        </time>
                      </div>
                      {m.author && (
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/90">From {m.author}</p>
                      )}
                      <h3 className="font-heading mt-1 text-lg font-bold text-secondary md:text-xl">{m.title}</h3>
                      <p className="mt-3 whitespace-pre-wrap border-t border-secondary/[0.08] pt-3 text-sm leading-relaxed text-gray-700">
                        {m.body}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
            {messages.length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-secondary/20 bg-[#f8fbff]/80 py-16 text-center shadow-inner">
                <FaInbox className="mx-auto mb-3 h-10 w-10 text-secondary/25" aria-hidden />
                <p className="text-sm font-medium text-gray-500">No announcements yet.</p>
              </div>
            )}
          </div>

          <div
            className={[
              'relative overflow-hidden rounded-3xl border p-6 shadow-xl md:p-7',
              financeMsgRead
                ? 'border-secondary/12 bg-gradient-to-br from-[#f8fbff] to-white'
                : 'border-primary/35 bg-gradient-to-br from-[#fff8ef] via-white to-[#f8fbff] ring-2 ring-primary/15',
            ].join(' ')}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
            <div className="relative flex flex-col gap-5 pt-2 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4">
                <span
                  className={[
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                    financeMsgRead ? 'bg-secondary/10 text-secondary' : 'bg-primary/20 text-secondary',
                  ].join(' ')}
                >
                  {financeMsgRead ? <FaCheckDouble className="h-5 w-5" aria-hidden /> : <FaEnvelope className="h-5 w-5" aria-hidden />}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Pinned notice</p>
                  <p className="font-heading mt-1 text-lg font-bold text-secondary">Daily settlement summary</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Reminder: verify pending payments before end of day. Export receipts from the Receipts tab.
                  </p>
                </div>
              </div>
              {!financeMsgRead && (
                <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                  New
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => markRead()}
              className={
                financeMsgRead
                  ? 'mt-5 rounded-full border-2 border-secondary/20 bg-white px-6 py-2.5 text-sm font-bold text-secondary shadow-sm transition hover:bg-[#f8fbff]'
                  : 'btn-portal-primary mt-5 px-8 py-3 text-sm font-bold shadow-lg'
              }
            >
              <span className="inline-flex items-center gap-2">
                <FaCheckDouble className="h-4 w-4" aria-hidden />
                {financeMsgRead ? 'Inbox marked read' : 'Mark inbox as read'}
              </span>
            </button>
          </div>
        </div>
      )}
    </AppShellLayout>
  )
}
