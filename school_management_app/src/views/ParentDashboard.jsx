import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import { listPortalEvents } from '../state/portalEvents'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import CalendarWidget from '../components/CalendarWidget'
import { commonOptions } from '../components/charts'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  buildSkillRadarFromAvg,
  completionPercent,
  latestSubmissionForTask,
  submissionTime,
  taskStatus,
} from '../utils/academic'

const NAV_BASE = [
  { id: 'dash', label: 'Overview', icon: '🏠' },
  { id: 'child', label: 'Child progress', icon: '📈' },
  { id: 'cal', label: 'Schedule', icon: '📅' },
  { id: 'pay', label: 'Payments', icon: '💳' },
  { id: 'rec', label: 'Receipts', icon: '🧾' },
  { id: 'msg', label: 'Messages', icon: '✉️', badge: 0 },
]

const SECTION_TITLE = {
  dash: 'Overview',
  child: 'Child progress',
  cal: 'Schedule',
  pay: 'Payments',
  rec: 'Receipts',
  msg: 'Messages',
}

const ANNUAL_DUE = 1200

const DEMO_CHILD_DATA = {
  'demo-student': {
    tasks: [
      { id: 1, title: 'FizzBuzz', description: 'Classic warmup', deadline: new Date().toISOString() },
      {
        id: 2,
        title: 'Palindrome',
        description: 'String practice',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: 3,
        title: 'API lab',
        description: 'HTTP GET',
        deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      },
    ],
    submissions: [
      {
        id: 1,
        task_id: 1,
        score: 78,
        feedback: 'Good job on loops.',
        submitted_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 2,
        task_id: 2,
        score: 65,
        feedback: 'Add case-insensitive check.',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  'demo-student-2': {
    tasks: [
      { id: 1, title: 'FizzBuzz', description: 'Classic warmup', deadline: new Date().toISOString() },
      {
        id: 2,
        title: 'Palindrome',
        description: 'String practice',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: 3,
        title: 'API lab',
        description: 'HTTP GET',
        deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      },
    ],
    submissions: [
      {
        id: 1,
        task_id: 1,
        score: 92,
        feedback: 'Excellent edge handling.',
        submitted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
  },
}

function sortSubs(list) {
  return [...(list ?? [])].sort((a, b) => submissionTime(a) - submissionTime(b))
}

export default function ParentDashboard() {
  const { user, isDemoMode } = useAuth()
  const [activeSection, setActiveSection] = useState('dash')
  const [childFocusId, setChildFocusId] = useState('')
  const [children, setChildren] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [toast, setToast] = useState(null)
  const { unreadCount, markRead, read: parentMsgRead } = useMessageInbox(user?.id, 'parent')
  const messages = listMessagesForRole('parent')

  const portalEvents = useMemo(() => listPortalEvents(), [])
  const parentEvents = useMemo(
    () => portalEvents.filter((e) => e.target === 'all' || e.target === 'parent'),
    [portalEvents],
  )
  const eventHighlights = useMemo(() => parentEvents.map((e) => e.date), [parentEvents])
  const upcomingParentEvents = useMemo(() => {
    const copy = [...parentEvents]
    copy.sort((a, b) => new Date(a.date) - new Date(b.date))
    return copy.slice(0, 10)
  }, [parentEvents])

  const loadLinkedChildren = useCallback(async () => {
    if (isDemoMode) {
      setChildren([
        { id: 'demo-student', full_name: 'Alex Student' },
        { id: 'demo-student-2', full_name: 'Sam Student' },
      ])
      setPayments([
        {
          id: 1,
          student_id: 'demo-student',
          amount: 400,
          created_at: new Date().toISOString(),
          receipts: [{ receipt_number: 'RCPT-1001', receipt_url: '' }],
        },
        {
          id: 2,
          student_id: 'demo-student',
          amount: 350,
          created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
          receipts: [{ receipt_number: 'RCPT-1002', receipt_url: '' }],
        },
        {
          id: 3,
          student_id: 'demo-student-2',
          amount: 500,
          created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          receipts: [{ receipt_number: 'RCPT-2001', receipt_url: '' }],
        },
      ])
      return
    }
    const { data: links } = await supabase.from('parent_students').select('student_id').eq('parent_id', user.id)
    const ids = (links ?? []).map((x) => x.student_id)
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('profiles').select('id,full_name').in('id', ids),
      supabase.from('payments').select('*, receipts(*)').in('student_id', ids).order('created_at', { ascending: false }),
    ])
    setChildren(c ?? [])
    setPayments(p ?? [])
  }, [user.id, isDemoMode])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadLinkedChildren()
    }, 0)
    return () => clearTimeout(id)
  }, [loadLinkedChildren])

  const resolvedChildId = useMemo(() => {
    if (!children.length) return ''
    const ok = children.some((c) => String(c.id) === String(selectedId))
    if (selectedId && ok) return String(selectedId)
    return String(children[0].id)
  }, [children, selectedId])

  useEffect(() => {
    if (activeSection !== 'child' || !childFocusId) return
    const el = document.getElementById(childFocusId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeSection, childFocusId])

  useEffect(() => {
    const loadChild = async () => {
      if (!resolvedChildId) {
        setTasks([])
        setSubmissions([])
        return
      }
      if (isDemoMode) {
        const pack = DEMO_CHILD_DATA[resolvedChildId] ?? DEMO_CHILD_DATA['demo-student']
        setTasks(pack.tasks)
        setSubmissions(pack.submissions)
        return
      }
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from('coding_tasks').select('*').order('deadline', { ascending: true }),
        supabase.from('coding_submissions').select('*').eq('student_id', resolvedChildId).order('submitted_at', { ascending: false }),
      ])
      setTasks(t ?? [])
      setSubmissions(s ?? [])
    }
    loadChild()
  }, [resolvedChildId, isDemoMode])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const remaining = Math.max(0, ANNUAL_DUE - totalPaid)

  const paymentsForChild = useMemo(
    () => payments.filter((p) => String(p.student_id) === String(resolvedChildId)),
    [payments, resolvedChildId],
  )
  const paidForChild = paymentsForChild.reduce((s, p) => s + Number(p.amount || 0), 0)
  const duePerChild = ANNUAL_DUE / Math.max(1, children.length)
  const outstandingChild = Math.max(0, duePerChild - paidForChild)

  const donut = {
    labels: ['Paid (family)', 'Outstanding (family)'],
    datasets: [{ data: [totalPaid, remaining], backgroundColor: ['#16b8e6', '#d4d8e2'] }],
  }

  const pct = useMemo(() => completionPercent(tasks, submissions), [tasks, submissions])
  const sortedSubs = useMemo(() => sortSubs(submissions), [submissions])
  const avg = submissions.length
    ? submissions.reduce((a, b) => a + Number(b.score ?? 0), 0) / submissions.length
    : 0

  const pendingTasks = useMemo(() => {
    const submitted = new Set(submissions.map((s) => s.task_id))
    return tasks.filter((t) => !submitted.has(t.id))
  }, [tasks, submissions])

  const completedCount = tasks.length - pendingTasks.length

  const trendData = useMemo(
    () => ({
      labels: sortedSubs.map((_, i) => `#${i + 1}`),
      datasets: [
        {
          label: 'Scores',
          data: sortedSubs.map((s) => Number(s.score ?? 0)),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [sortedSubs],
  )

  const barByTask = useMemo(() => {
    const labels = tasks.map((t) => t.title.slice(0, 18) + (t.title.length > 18 ? '…' : ''))
    const data = tasks.map((t) => {
      const latest = latestSubmissionForTask(t.id, submissions)
      return latest ? Number(latest.score ?? 0) : 0
    })
    return {
      labels,
      datasets: [{ label: 'Latest grade', data, backgroundColor: '#0ea5e9' }],
    }
  }, [tasks, submissions])

  const selectedName =
    children.find((c) => String(c.id) === String(resolvedChildId))?.full_name ?? 'Select a child'

  const skillRadar = useMemo(() => buildSkillRadarFromAvg(avg), [avg])

  const skillBar = useMemo(() => {
    // Reuse the same skill values, but present them as bars (clearer than radar for many users).
    const ds = skillRadar.datasets?.[0]
    return {
      labels: skillRadar.labels ?? [],
      datasets: [
        {
          label: ds?.label ?? 'Skill profile',
          data: ds?.data ?? [],
          backgroundColor: 'rgba(37, 99, 235, 0.22)',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    }
  }, [skillRadar])

  const jump = (id) => setActiveSection(id)

  const navItems = useMemo(() => {
    return NAV_BASE.map((n) => (n.id === 'msg' ? { ...n, badge: unreadCount } : { ...n, badge: undefined }))
  }, [unreadCount])

  const childSelector = (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Select child</h2>
      <p className="mt-1 text-sm text-slate-600">
        Switch students to see academic progress and payments in context.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {children.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              String(resolvedChildId) === String(c.id)
                ? 'bg-blue-600 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c.full_name}
          </button>
        ))}
        {children.length === 0 && (
          <p className="text-sm text-slate-500">No linked students. Ask an admin to link your account.</p>
        )}
      </div>
    </section>
  )

  return (
    <AppShellLayout
      navItems={navItems}
      activeNavId={activeSection}
      onNavSelect={setActiveSection}
      roleLabel="Parent"
      pageTitle={SECTION_TITLE[activeSection] ?? 'Parent'}
      breadcrumbLast="Parent"
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
            Use the sidebar to open <strong>child progress</strong> (including skill balance), payments, receipts, and
            messages.
          </p>
          {childSelector}
          {resolvedChildId && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                color="bg-blue-600"
                value={`${pct}%`}
                title="Task completion"
                icon="📈"
                animationDelayMs={0}
                subtitle={`${selectedName.split(' ')[0]} — ${completedCount} done, ${pendingTasks.length} open`}
                foot="Progress & skills"
                onMoreInfo={() => {
                  jump('child')
                  setChildFocusId('child-summary')
                  setToast('Child progress — skill balance and charts.')
                }}
              />
              <MetricCard
                color="bg-green-600"
                value={avg ? avg.toFixed(1) : '—'}
                title="Avg grade"
                icon="📊"
                animationDelayMs={90}
                subtitle={submissions.length ? 'Based on graded work' : 'No grades yet'}
                foot="See charts"
                onMoreInfo={() => {
                  jump('child')
                  setChildFocusId('child-grade-trend')
                  setToast('Grade trend — the line chart below.')
                }}
              />
              <MetricCard
                color="bg-orange-500"
                value={completedCount}
                title="Tasks done"
                icon="✓"
                animationDelayMs={180}
                subtitle="With at least one submission"
                foot="View details"
                onMoreInfo={() => {
                  jump('child')
                  setChildFocusId('child-done')
                  setToast('Completed work list opened.')
                }}
              />
              <MetricCard
                color="bg-red-600"
                value={pendingTasks.length}
                title="Pending tasks"
                icon="📋"
                animationDelayMs={270}
                subtitle={pendingTasks.length ? 'Needs submission' : 'All caught up'}
                foot="Review list"
                onMoreInfo={() => {
                  jump('child')
                  setChildFocusId('child-pending')
                  setToast('Pending tasks — scroll to the list.')
                }}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                jump('pay')
                setToast('Family payment overview.')
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Family payments
            </button>
            <button
              type="button"
              onClick={() => {
                jump('rec')
                setToast('Receipts and downloads.')
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Receipts & downloads
            </button>
          </div>
        </>
      )}

      {activeSection === 'cal' && (
        <>
          {childSelector}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
            <p className="mt-1 text-sm text-slate-600">
              Calendar highlights include your child&apos;s assignment deadlines plus admin-published school events.
            </p>
            <div className="mt-4">
              <CalendarWidget
                title="Deadlines & events"
                highlightDates={[
                  ...eventHighlights,
                  ...tasks.map((t) => t.deadline).filter(Boolean),
                ]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Upcoming admin events</h3>
            {upcomingParentEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No admin events yet. Admin can publish events in their calendar.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingParentEvents.slice(0, 6).map((e) => (
                  <li key={e.id} className="rounded border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {e.target} · {new Date(e.date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{e.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {activeSection === 'child' && resolvedChildId && (
        <>
          {childSelector}
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <h3 className="text-sm font-semibold text-indigo-900">Skill balance (for selected child)</h3>
            <p className="mt-1 text-xs text-indigo-800/80">
              Estimated profile from average performance — use with grade trends for a fuller picture.
            </p>
            <div className="mx-auto mt-4 max-w-lg">
              <div className="h-64">
                <Bar
                  data={skillBar}
                  options={{
                    ...commonOptions,
                    plugins: { legend: { display: false } },
                    scales: { y: { min: 0, max: 100, ticks: { stepSize: 25 } } },
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-indigo-800/80">
                Higher bars indicate stronger areas (estimated from the child&apos;s graded work).
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">Family payment overview</h2>
              <p className="mb-3 text-sm text-slate-600">Total paid vs estimated annual balance (demo: ${ANNUAL_DUE}).</p>
              <div className="mx-auto h-64 max-w-md">
                <Doughnut data={donut} options={commonOptions} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" id="child-summary">
              <h2 className="mb-2 text-xl font-semibold">{selectedName} — summary</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <strong>Completion:</strong> {pct}%
                </li>
                <li>
                  <strong>Average grade:</strong> {submissions.length ? avg.toFixed(1) : 'N/A'}
                </li>
                <li>
                  <strong>Paid toward this child:</strong> ${paidForChild.toFixed(2)}
                </li>
                <li className="font-semibold text-orange-700">
                  <strong>Outstanding (demo):</strong> ${outstandingChild.toFixed(2)}
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-1" id="child-grade-trend">
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-1 font-semibold text-slate-900">Grade trend</h3>
              <p className="mb-2 text-xs text-slate-600">
                Shows your graded attempts over time (chronological). Higher lines mean improving grades.
              </p>
              <div className="h-56">
                <Line data={trendData} options={{ ...commonOptions, scales: { y: { min: 0, max: 100 } } }} />
              </div>
            </div>
          </div>

          <div className="mb-6 rounded border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 font-semibold text-slate-900">Grades by assignment (latest)</h3>
            <p className="mb-3 text-xs text-slate-600">
              Shows the most recent score per assignment (gray = not submitted, light blue = awaiting grade).
            </p>
            <div className="h-64">
              <Bar data={barByTask} options={commonOptions} />
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded border border-slate-200 bg-white p-4 shadow-sm" id="child-pending">
              <h2 className="mb-3 text-lg font-semibold">Pending tasks</h2>
              <ul className="space-y-2 text-sm">
                {pendingTasks.map((t) => (
                  <li key={t.id} className="rounded border border-amber-100 bg-amber-50/50 p-2">
                    <strong>{t.title}</strong>
                    <span className="text-slate-600"> — due {new Date(t.deadline).toLocaleDateString()}</span>
                  </li>
                ))}
                {pendingTasks.length === 0 && <p className="text-slate-500">No pending tasks.</p>}
              </ul>
            </section>
            <section className="rounded border border-slate-200 bg-white p-4 shadow-sm" id="child-done">
              <h2 className="mb-3 text-lg font-semibold">Completed & graded</h2>
              <ul className="space-y-2 text-sm">
                {tasks.map((t) => {
                  const latest = latestSubmissionForTask(t.id, submissions)
                  const st = taskStatus(t, latest)
                  if (st === 'pending') return null
                  return (
                    <li key={t.id} className="rounded border border-slate-100 p-2">
                      <strong>{t.title}</strong>
                      {latest && (
                        <span className="text-slate-600">
                          {' '}
                          — score {latest.score != null ? Number(latest.score).toFixed(0) : '—'}
                        </span>
                      )}
                      {latest?.feedback && (
                        <p className="mt-1 text-xs text-slate-600">Feedback: {latest.feedback}</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        </>
      )}

      {activeSection === 'pay' && (
        <div className="space-y-6">
          {childSelector}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Family payments</h2>
            <p className="mt-2 text-sm text-slate-600">Total paid vs estimated annual balance (demo: ${ANNUAL_DUE}).</p>
            <div className="mx-auto mt-6 h-72 max-w-lg">
              <Doughnut data={donut} options={commonOptions} />
            </div>
            <p className="mt-4 text-center text-sm text-slate-600">
              Total paid: <strong>${totalPaid.toFixed(2)}</strong> · Outstanding (family):{' '}
              <strong>${remaining.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      )}

      {activeSection === 'rec' && (
        <div className="space-y-6">
          {childSelector}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Payment history & receipts</h2>
            <p className="mb-3 text-sm text-slate-600">
              Download when a receipt file URL is attached. Otherwise use the receipt number for your records.
            </p>
            <div className="space-y-2">
              {payments.map((p) => {
                const child = children.find((c) => String(c.id) === String(p.student_id))
                const r = p.receipts?.[0]
                const canDownload = r?.receipt_url && String(r.receipt_url).startsWith('http')
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">${Number(p.amount).toFixed(2)}</span>
                      <span className="text-slate-600"> — {new Date(p.created_at).toLocaleDateString()}</span>
                      {child && <span className="ml-2 text-slate-500">({child.full_name})</span>}
                      <div className="text-xs text-slate-500">Receipt: {r?.receipt_number ?? '—'}</div>
                    </div>
                    <div className="flex gap-2">
                      {canDownload ? (
                        <a
                          href={r.receipt_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="rounded bg-slate-200 px-3 py-1.5 text-xs text-slate-500">No file linked</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {activeSection === 'msg' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="mt-2 text-sm text-slate-600">
            School announcements and instructor notes.
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
              parentMsgRead
                ? 'border-slate-200 bg-slate-50'
                : 'border-blue-200 bg-blue-50/80 ring-2 ring-blue-200/50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm text-slate-800">
                <strong>Tip:</strong> Check your child’s progress tab for grades and skill balance after each assignment.
              </p>
              {!parentMsgRead && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">New</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => markRead()}
              className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
            >
              {parentMsgRead ? 'Marked as read' : 'Mark welcome as read'}
            </button>
          </div>
        </div>
      )}
    </AppShellLayout>
  )
}
