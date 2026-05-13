import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import { listPortalEvents, PORTAL_EVENTS_CHANGED, PORTAL_EVENTS_STORAGE_KEY } from '../state/portalEvents'
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
import {
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaComments,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaReceipt,
  FaUsers,
} from 'react-icons/fa'

const CARD_ACCENTS = [
  'from-secondary via-[#2d4a73] to-primary',
  'from-primary via-amber-400 to-secondary',
  'from-emerald-600 via-teal-600 to-secondary',
]

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
  const [portalEventsTick, setPortalEventsTick] = useState(0)
  const { unreadCount, markRead, read: parentMsgRead } = useMessageInbox(user?.id, 'parent')
  const messages = listMessagesForRole('parent')

  useEffect(() => {
    const bump = () => setPortalEventsTick((n) => n + 1)
    window.addEventListener(PORTAL_EVENTS_CHANGED, bump)
    const onStorage = (e) => {
      if (e.key === PORTAL_EVENTS_STORAGE_KEY) bump()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(PORTAL_EVENTS_CHANGED, bump)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const portalEvents = useMemo(() => {
    void portalEventsTick
    return listPortalEvents()
  }, [portalEventsTick])
  const parentEvents = useMemo(
    () => portalEvents.filter((e) => e.target === 'all' || e.target === 'parent'),
    [portalEvents],
  )
  const eventHighlights = useMemo(() => parentEvents.map((e) => e.date), [parentEvents])

  /** Same admin-published events as the calendar highlights above — next upcoming first. */
  const { nextSchoolEvent, restUpcomingSchoolEvents } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming = parentEvents
      .filter((e) => {
        const d = new Date(e.date)
        if (Number.isNaN(d.getTime())) return false
        const day = new Date(d)
        day.setHours(0, 0, 0, 0)
        return day >= today
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    return {
      nextSchoolEvent: upcoming[0] ?? null,
      restUpcomingSchoolEvents: upcoming.slice(1, 8),
    }
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
    datasets: [
      {
        data: [totalPaid, remaining],
        backgroundColor: ['#faa853', '#cbd5e1'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 10,
      },
    ],
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
          borderColor: '#2d3f5d',
          backgroundColor: 'rgba(250, 168, 83, 0.18)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#faa853',
          pointBorderColor: '#2d3f5d',
          pointBorderWidth: 2,
          pointRadius: 5,
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
      datasets: [
        {
          label: 'Latest grade',
          data,
          backgroundColor: labels.map((_, i) => (i % 2 === 0 ? '#faa853' : '#2d3f5d')),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [tasks, submissions])

  const selectedName =
    children.find((c) => String(c.id) === String(resolvedChildId))?.full_name ?? 'Select a child'

  const skillRadar = useMemo(() => buildSkillRadarFromAvg(avg), [avg])

  const skillBar = useMemo(() => {
    const ds = skillRadar.datasets?.[0]
    const labels = skillRadar.labels ?? []
    const data = ds?.data ?? []
    return {
      labels,
      datasets: [
        {
          label: ds?.label ?? 'Skill profile',
          data,
          backgroundColor: labels.map((_, i) =>
            i % 2 === 0 ? 'rgba(250, 168, 83, 0.9)' : 'rgba(45, 63, 93, 0.88)',
          ),
          borderColor: labels.map((_, i) => (i % 2 === 0 ? '#e89235' : '#1a2542')),
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [skillRadar])

  const jump = (id) => setActiveSection(id)

  const navItems = useMemo(() => {
    return NAV_BASE.map((n) => (n.id === 'msg' ? { ...n, badge: unreadCount } : { ...n, badge: undefined }))
  }, [unreadCount])

  const childSelector = (
    <section className="relative mb-6 overflow-hidden rounded-3xl border-2 border-secondary/12 bg-white shadow-xl">
      <div className="h-1.5 bg-gradient-to-r from-secondary via-[#3d5a8a] to-primary" aria-hidden />
      <div className="flex flex-wrap items-start gap-4 p-5 md:p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-2xl text-primary shadow-lg ring-2 ring-white">
          <FaUsers className="h-7 w-7" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Family</p>
          <h2 className="font-heading text-xl font-black tracking-tight text-secondary md:text-2xl">Select child</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Switch students to see academic progress and payments in context.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-heading font-semibold shadow-sm transition-all ${
                  String(resolvedChildId) === String(c.id)
                    ? 'bg-gradient-to-r from-secondary to-[#1a2542] text-white shadow-lg ring-2 ring-primary/35'
                    : 'border-2 border-secondary/12 bg-white text-secondary hover:border-primary/40 hover:bg-[#f8fbff]'
                }`}
              >
                {c.full_name}
              </button>
            ))}
            {children.length === 0 && (
              <p className="rounded-xl border border-dashed border-secondary/20 bg-[#f8fbff]/80 px-4 py-3 text-sm text-gray-600">
                No linked students yet — ask an administrator to link your account.
              </p>
            )}
          </div>
        </div>
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
          <header className="mb-6 overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#e89235] text-secondary shadow-md ring-2 ring-white">
                <FaChartLine className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">At a glance</p>
                <h2 className="font-heading mt-1 text-xl font-black text-secondary md:text-2xl">Your family dashboard</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                  Jump into <strong className="text-secondary">child progress</strong> for skills and grades, or manage{' '}
                  <strong className="text-secondary">payments</strong> and <strong className="text-secondary">receipts</strong>{' '}
                  from the shortcuts below.
                </p>
              </div>
            </div>
          </header>
          {childSelector}
          {resolvedChildId && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                color="bg-primary"
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                jump('pay')
                setToast('Family payment overview.')
              }}
              className="btn-portal-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg"
            >
              <FaCreditCard className="h-4 w-4" aria-hidden />
              Family payments
            </button>
            <button
              type="button"
              onClick={() => {
                jump('rec')
                setToast('Receipts and downloads.')
              }}
              className="btn-portal-outline inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
            >
              <FaReceipt className="h-4 w-4" aria-hidden />
              Receipts & downloads
            </button>
          </div>
        </>
      )}

      {activeSection === 'cal' && (
        <div className="space-y-6">
          {childSelector}
          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
            <div className="border-b border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <FaCalendarAlt className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-secondary md:text-xl">Schedule</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Assignment deadlines and admin-published school events appear on the calendar below.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <CalendarWidget
                title="Deadlines & events"
                highlightDates={[
                  ...eventHighlights,
                  ...tasks.map((t) => t.deadline).filter(Boolean),
                ]}
              />
            </div>
          </section>

          <section className="portal-section-card relative overflow-hidden shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-secondary opacity-90" aria-hidden />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="font-heading text-lg font-bold text-secondary">Upcoming school events</h3>
              </div>
              {nextSchoolEvent && (
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-secondary">
                  Synced with calendar
                </span>
              )}
            </div>

            {nextSchoolEvent ? (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/35 bg-gradient-to-br from-[#fff8ef] via-white to-[#f8fbff] p-6 shadow-lg ring-2 ring-primary/10">
                  <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-secondary via-[#2d4a73] to-primary" aria-hidden />
                  <p className="pl-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary">Next school event</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 pl-4">
                    <time
                      className="font-heading text-2xl font-black text-secondary md:text-3xl"
                      dateTime={nextSchoolEvent.date}
                    >
                      {new Date(nextSchoolEvent.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <span className="rounded-full border border-secondary/15 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary shadow-sm">
                      {nextSchoolEvent.target === 'all' ? 'Everyone' : nextSchoolEvent.target}
                    </span>
                  </div>
                  <p className="mt-4 pl-4 font-heading text-xl font-bold leading-snug text-secondary md:text-2xl">
                    {nextSchoolEvent.title}
                  </p>
                  <p className="mt-3 pl-4 text-sm text-gray-600">
                    Pulled from the same school events your admin adds — highlighted on the calendar above.
                  </p>
                </div>

                {restUpcomingSchoolEvents.length > 0 ? (
                  <div>
                    <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-secondary/80">
                      Also coming up
                    </p>
                    <ul className="space-y-3">
                      {restUpcomingSchoolEvents.map((e, idx) => (
                        <li
                          key={e.id}
                          className="group relative overflow-hidden rounded-2xl border border-secondary/12 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div
                            className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`}
                            aria-hidden
                          />
                          <div className="pl-5 pr-4 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
                              {e.target} · {new Date(e.date).toLocaleDateString()}
                            </p>
                            <p className="mt-1 font-heading font-semibold text-secondary">{e.title}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-secondary/20 bg-[#f8fbff]/70 py-10 text-center text-sm leading-relaxed text-gray-600">
                No upcoming school events yet. When your school publishes a date (same events as on the admin calendar),
                the next one will appear here automatically.
              </p>
            )}
          </section>
        </div>
      )}

      {activeSection === 'child' && resolvedChildId && (
        <div className="space-y-6">
          {childSelector}
          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-primary via-amber-400 to-secondary" aria-hidden />
            <div className="border-b border-secondary/10 bg-gradient-to-r from-[#fff8ef]/80 to-[#f8fbff] px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-md">
                  <FaChartBar className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-secondary md:text-xl">Skill balance</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Estimated profile from average performance — pair this with grade trends for context.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-6 md:px-8">
              <div className="mx-auto max-w-lg">
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
                <p className="mt-3 text-center text-xs text-secondary/80">
                  Higher bars = stronger estimated skills from graded work.
                </p>
              </div>
            </div>
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="group relative overflow-hidden rounded-3xl border-2 border-secondary/12 bg-white shadow-xl transition hover:shadow-2xl">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-secondary via-[#2d4a73] to-primary" aria-hidden />
              <div className="p-5 md:p-6 pl-7">
                <div className="mb-3 flex items-center gap-2">
                  <FaCreditCard className="h-5 w-5 text-primary" aria-hidden />
                  <h2 className="font-heading text-lg font-bold text-secondary">Family payment overview</h2>
                </div>
                <p className="mb-4 text-sm text-gray-600">Total paid vs estimated annual balance (demo: ${ANNUAL_DUE}).</p>
                <div className="mx-auto h-64 max-w-md">
                  <Doughnut data={donut} options={commonOptions} />
                </div>
              </div>
            </section>
            <section
              className="group relative overflow-hidden rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-[#f8fbff] to-white shadow-xl ring-2 ring-primary/10"
              id="child-summary"
            >
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-amber-400" aria-hidden />
              <div className="p-5 md:p-6 pl-7">
                <h2 className="font-heading text-xl font-black text-secondary">{selectedName}</h2>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Quick summary</p>
                <ul className="mt-4 space-y-3 text-sm text-secondary">
                  <li className="flex justify-between gap-4 rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-secondary/10">
                    <span className="text-gray-600">Completion</span>
                    <strong>{pct}%</strong>
                  </li>
                  <li className="flex justify-between gap-4 rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-secondary/10">
                    <span className="text-gray-600">Average grade</span>
                    <strong>{submissions.length ? avg.toFixed(1) : 'N/A'}</strong>
                  </li>
                  <li className="flex justify-between gap-4 rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-secondary/10">
                    <span className="text-gray-600">Paid toward this child</span>
                    <strong>${paidForChild.toFixed(2)}</strong>
                  </li>
                  <li className="flex justify-between gap-4 rounded-xl border border-amber-200 bg-[#fff8ef] px-3 py-2 font-semibold text-amber-950">
                    <span>Outstanding (demo)</span>
                    <span>${outstandingChild.toFixed(2)}</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-1" id="child-grade-trend">
            <div className="relative overflow-hidden rounded-3xl border-2 border-secondary/12 bg-white p-5 shadow-xl md:p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary to-primary opacity-80" aria-hidden />
              <h3 className="font-heading pt-1 text-lg font-bold text-secondary">Grade trend</h3>
              <p className="mb-4 text-sm text-gray-600">
                Graded attempts over time — upward movement usually means stronger submissions.
              </p>
              <div className="h-56">
                <Line data={trendData} options={{ ...commonOptions, scales: { y: { min: 0, max: 100 } } }} />
              </div>
            </div>
          </div>

          <div className="mb-6 relative overflow-hidden rounded-3xl border-2 border-secondary/12 bg-white p-5 shadow-xl md:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-secondary opacity-90" aria-hidden />
            <h3 className="font-heading pt-1 text-lg font-bold text-secondary">Grades by assignment (latest)</h3>
            <p className="mb-4 text-sm text-gray-600">
              Most recent score per assignment — compare tasks at a glance.
            </p>
            <div className="h-64">
              <Bar data={barByTask} options={commonOptions} />
            </div>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="relative overflow-hidden rounded-3xl border-2 border-amber-300/40 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-lg ring-1 ring-amber-200/60" id="child-pending">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-500 to-primary" aria-hidden />
              <h2 className="font-heading pl-3 text-lg font-bold text-secondary">Pending tasks</h2>
              <ul className="mt-4 space-y-3 pl-3 text-sm">
                {pendingTasks.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-xl border border-amber-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm"
                  >
                    <strong className="text-secondary">{t.title}</strong>
                    <span className="text-gray-600"> — due {new Date(t.deadline).toLocaleDateString()}</span>
                  </li>
                ))}
                {pendingTasks.length === 0 && (
                  <p className="rounded-xl border border-dashed border-secondary/15 bg-white py-8 text-center text-gray-600">
                    No pending tasks — great job staying current.
                  </p>
                )}
              </ul>
            </section>
            <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white p-5 shadow-xl" id="child-done">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-600 to-teal-600" aria-hidden />
              <h2 className="font-heading pl-3 text-lg font-bold text-secondary">Completed & graded</h2>
              <ul className="mt-4 space-y-3 pl-3 text-sm">
                {tasks.map((t) => {
                  const latest = latestSubmissionForTask(t.id, submissions)
                  const st = taskStatus(t, latest)
                  if (st === 'pending') return null
                  return (
                    <li key={t.id} className="rounded-xl border border-secondary/10 bg-[#f8fbff]/70 px-4 py-3 shadow-sm">
                      <strong className="text-secondary">{t.title}</strong>
                      {latest && (
                        <span className="text-gray-600">
                          {' '}
                          — score {latest.score != null ? Number(latest.score).toFixed(0) : '—'}
                        </span>
                      )}
                      {latest?.feedback && (
                        <p className="mt-2 rounded-lg bg-white/90 px-3 py-2 text-xs leading-relaxed text-gray-600 ring-1 ring-secondary/10">
                          {latest.feedback}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        </div>
      )}

      {activeSection === 'pay' && (
        <div className="space-y-6">
          {childSelector}
          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
            <div className="border-b border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white px-5 py-5 md:px-8">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg ring-2 ring-white">
                  <FaCreditCard className="h-7 w-7" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Finances</p>
                  <h2 className="font-heading text-2xl font-black text-secondary md:text-3xl">Family payments</h2>
                  <p className="mt-2 max-w-xl text-sm text-gray-600">
                    Snapshot of total contributions versus the demo annual estimate (${ANNUAL_DUE}). Receipts live under{' '}
                    <strong className="text-secondary">Receipts</strong>.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 px-5 py-8 md:px-10">
              <div className="mx-auto h-72 max-w-md flex-1">
                <Doughnut data={donut} options={commonOptions} />
              </div>
              <div className="flex min-w-[14rem] flex-col justify-center gap-4 rounded-2xl border border-secondary/10 bg-[#f8fbff]/80 p-6 shadow-inner">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Total paid</p>
                  <p className="font-heading text-3xl font-black text-secondary">${totalPaid.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Outstanding (family)</p>
                  <p className="font-heading text-3xl font-black text-amber-800">${remaining.toFixed(2)}</p>
                </div>
                <div className="flex gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-secondary">
                    <span className="h-2 w-2 rounded-full bg-[#faa853]" aria-hidden />
                    Paid
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200/80 px-3 py-1 text-secondary">
                    <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                    Due
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'rec' && (
        <div className="space-y-6">
          {childSelector}
          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-secondary" aria-hidden />
            <div className="border-b border-secondary/10 bg-gradient-to-r from-emerald-50/50 to-white px-5 py-5 md:px-8">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-800">
                  <FaFileInvoiceDollar className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-black text-secondary md:text-2xl">Payment history & receipts</h2>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600">
                    Download when finance attaches a file. Otherwise keep the receipt number for your records.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5 md:p-6">
              {payments.map((p, idx) => {
                const child = children.find((c) => String(c.id) === String(p.student_id))
                const r = p.receipts?.[0]
                const canDownload = r?.receipt_url && String(r.receipt_url).startsWith('http')
                const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-secondary/12 bg-white py-4 pl-5 pr-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl md:pl-6"
                  >
                    <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${accent}`} aria-hidden />
                    <div className="min-w-0 pl-2">
                      <p className="font-heading text-lg font-bold text-secondary">${Number(p.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(p.created_at).toLocaleDateString()}
                        {child && <span className="text-gray-500"> · {child.full_name}</span>}
                      </p>
                      <p className="mt-1 font-mono text-xs text-gray-500">Receipt: {r?.receipt_number ?? '—'}</p>
                    </div>
                    <div className="shrink-0">
                      {canDownload ? (
                        <a
                          href={r.receipt_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="btn-portal-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="inline-flex rounded-xl border-2 border-secondary/15 bg-secondary/5 px-4 py-2 text-xs font-bold text-gray-500">
                          No file linked
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {payments.length === 0 && (
                <p className="rounded-2xl border border-dashed border-secondary/20 py-12 text-center text-sm text-gray-600">
                  No payments recorded yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {activeSection === 'msg' && (
        <div className="space-y-6">
          <header className="overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg ring-2 ring-white">
                <FaComments className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Inbox</p>
                <h2 className="font-heading text-2xl font-black text-secondary md:text-3xl">Messages</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                  Announcements from your school team. Tips below help you get the most from the portal.
                </p>
              </div>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/12 bg-white p-6 shadow-xl md:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-90" aria-hidden />
            <div className="space-y-4 pt-2">
              {messages.map((m, idx) => (
                <article
                  key={m.id}
                  className="group relative overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-md transition hover:shadow-lg"
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`}
                    aria-hidden
                  />
                  <div className="px-5 py-5 pl-7">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      {m.target} · {new Date(m.created_at).toLocaleString()}
                    </p>
                    <p className="font-heading mt-2 text-lg font-bold text-secondary">{m.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{m.body}</p>
                  </div>
                </article>
              ))}
              {messages.length === 0 && (
                <p className="rounded-2xl border border-dashed border-secondary/20 bg-[#f8fbff]/80 py-12 text-center text-sm text-gray-600">
                  No announcements yet — check back soon.
                </p>
              )}
            </div>

            <div
              className={`relative mt-8 overflow-hidden rounded-2xl border-2 p-6 shadow-inner transition ${
                parentMsgRead
                  ? 'border-secondary/15 bg-[#f8fbff]/90'
                  : 'border-primary/35 bg-gradient-to-br from-[#fff8ef] to-white ring-2 ring-primary/20'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
              <div className="flex flex-wrap items-start justify-between gap-3 pt-1">
                <p className="max-w-xl text-sm leading-relaxed text-secondary">
                  <strong className="text-secondary">Tip:</strong> After each assignment, open{' '}
                  <strong className="text-primary">Child progress</strong> for grades and skill balance.
                </p>
                {!parentMsgRead && (
                  <span className="rounded-full bg-gradient-to-r from-primary to-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
                    New
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => markRead()}
                className={
                  parentMsgRead
                    ? 'btn-portal-outline mt-5 px-6 py-2.5 text-sm font-bold'
                    : 'btn-portal-primary mt-5 px-8 py-3 text-sm font-bold shadow-lg'
                }
              >
                {parentMsgRead ? 'Marked as read' : 'Mark welcome as read'}
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShellLayout>
  )
}
