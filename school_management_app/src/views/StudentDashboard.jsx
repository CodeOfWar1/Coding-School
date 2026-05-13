import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import { listPortalEvents } from '../state/portalEvents'
import { supabase } from '../lib/supabase'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import CalendarWidget from '../components/CalendarWidget'
import {
  FaAward,
  FaCalendarAlt,
  FaChartLine,
  FaChartPie,
  FaCheckDouble,
  FaClipboardList,
  FaComments,
  FaEnvelope,
  FaInbox,
  FaMedal,
} from 'react-icons/fa'
import { commonOptions } from '../components/charts'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  completionPercent,
  latestSubmissionForTask,
  submissionTime,
  taskStatus,
} from '../utils/academic'

const NAV_BASE = [
  { id: 'dash', label: 'Overview', icon: '🏠' },
  { id: 'tasks', label: 'Assignments', icon: '📋' },
  { id: 'progress', label: 'Progress & grades', icon: '📈' },
  { id: 'cal', label: 'Schedule', icon: '📅' },
  { id: 'msg', label: 'Messages', icon: '✉️', badge: 1 },
]

const SECTION_TITLE = {
  dash: 'Overview',
  tasks: 'Assignments',
  progress: 'Progress & grades',
  cal: 'Schedule',
  msg: 'Messages',
}

function scoreBadgeClass(score) {
  if (score == null || score === '') {
    return 'border-secondary/20 bg-slate-100/90 text-secondary/75'
  }
  const n = Number(score)
  if (Number.isNaN(n)) return 'border-secondary/15 bg-white text-secondary'
  if (n < 60) return 'border-red-200/90 bg-gradient-to-br from-red-50 to-white text-red-800 shadow-sm shadow-red-900/5'
  if (n < 80) return 'border-amber-200/90 bg-gradient-to-br from-[#fff8ef] to-white text-secondary shadow-sm'
  return 'border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white text-emerald-900 shadow-sm shadow-emerald-900/5'
}

function sortSubmissionsForTrend(list) {
  const copy = [...(list ?? [])]
  copy.sort((a, b) => submissionTime(a) - submissionTime(b))
  return copy
}

const FEEDBACK_SAMPLES = [
  'Nice structure. Consider edge cases for empty input.',
  'Good use of loops. Add comments for clarity.',
  'Solid solution. Try extracting helpers next time.',
  'Excellent work — passes all checks.',
]

export default function StudentDashboard() {
  const { user, profile, isDemoMode } = useAuth()
  const [activeSection, setActiveSection] = useState('dash')
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [codeByTask, setCodeByTask] = useState({})
  const [nowMs, setNowMs] = useState(0)
  const [openTaskId, setOpenTaskId] = useState(null)
  const [taskQuery, setTaskQuery] = useState('')
  const [submittingId, setSubmittingId] = useState(null)
  const [toast, setToast] = useState(null)
  const { unreadCount, markRead, read: msgRead } = useMessageInbox(user?.id, 'student')
  const messages = listMessagesForRole('student')

  const portalEvents = useMemo(() => listPortalEvents(), [])
  const studentEvents = useMemo(
    () => portalEvents.filter((e) => e.target === 'all' || e.target === 'student'),
    [portalEvents],
  )
  const studentEventDates = useMemo(() => studentEvents.map((e) => e.date), [studentEvents])
  const upcomingStudentEvents = useMemo(() => {
    const copy = [...studentEvents]
    copy.sort((a, b) => new Date(a.date) - new Date(b.date))
    return copy.slice(0, 6)
  }, [studentEvents])

  const reloadSubmissions = useCallback(async () => {
    if (isDemoMode) return
    const { data } = await supabase
      .from('coding_submissions')
      .select('*')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
    setSubmissions(data ?? [])
  }, [user.id, isDemoMode])

  useEffect(() => {
    const t = setTimeout(() => setNowMs(Date.now()), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!openTaskId) return
    const raf = window.requestAnimationFrame(() => {
      document.getElementById(`student-assignment-${openTaskId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [openTaskId])

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        const base = Date.now() - 86400000 * 14
        setTasks([
          {
            id: 1,
            title: 'FizzBuzz',
            description: 'Print numbers 1–n; replace multiples of 3 and 5 with Fizz, Buzz, FizzBuzz.',
            deadline: new Date().toISOString(),
          },
          {
            id: 2,
            title: 'Palindrome checker',
            description: 'Return whether a string reads the same forwards and backwards.',
            deadline: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            id: 3,
            title: 'API fetch',
            description: 'Fetch JSON from an endpoint and display one field.',
            deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          },
        ])
        setSubmissions([
          {
            id: 1,
            task_id: 1,
            score: 62,
            feedback: FEEDBACK_SAMPLES[0],
            submitted_at: new Date(base).toISOString(),
            code: 'print("demo")',
          },
          {
            id: 2,
            task_id: 1,
            score: 70,
            feedback: FEEDBACK_SAMPLES[1],
            submitted_at: new Date(base + 86400000 * 2).toISOString(),
            code: 'def fizz(): ...',
          },
          {
            id: 3,
            task_id: 2,
            score: 85,
            feedback: FEEDBACK_SAMPLES[2],
            submitted_at: new Date(base + 86400000 * 5).toISOString(),
            code: '...',
          },
          {
            id: 4,
            task_id: 2,
            score: 92,
            feedback: FEEDBACK_SAMPLES[3],
            submitted_at: new Date(base + 86400000 * 7).toISOString(),
            code: '...',
          },
        ])
        return
      }
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from('coding_tasks').select('*').order('deadline', { ascending: true }),
        supabase.from('coding_submissions').select('*').eq('student_id', user.id).order('submitted_at', { ascending: false }),
      ])
      setTasks(t ?? [])
      setSubmissions(s ?? [])
    }
    load()
  }, [user.id, isDemoMode])

  const submitCode = async (taskId) => {
    const code = codeByTask[taskId]
    if (!code?.trim()) {
      setToast({ type: 'error', text: 'Add some code before submitting.' })
      return
    }
    setSubmittingId(taskId)
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 400))
        const score = Math.min(100, Math.round(65 + Math.random() * 30))
        const feedback = FEEDBACK_SAMPLES[Math.floor(Math.random() * FEEDBACK_SAMPLES.length)]
        setSubmissions((prev) => [
          {
            id: `new-${Date.now()}`,
            task_id: taskId,
            score,
            feedback,
            submitted_at: new Date().toISOString(),
            code: code.slice(0, 200),
          },
          ...prev,
        ])
        setCodeByTask((p) => ({ ...p, [taskId]: '' }))
        setToast({ type: 'ok', text: 'Submitted — check your latest grade below.' })
      } else {
        const { error } = await supabase.from('coding_submissions').insert({
          task_id: taskId,
          student_id: user.id,
          code,
        })
        if (error) {
          setToast({ type: 'error', text: error.message || 'Could not submit.' })
          return
        }
        setCodeByTask((p) => ({ ...p, [taskId]: '' }))
        await reloadSubmissions()
        setToast({ type: 'ok', text: 'Solution submitted. Your instructor will grade it soon.' })
      }
    } finally {
      setSubmittingId(null)
    }
  }

  const sortedSubs = useMemo(() => sortSubmissionsForTrend(submissions), [submissions])

  const gradedSubs = useMemo(
    () => submissions.filter((s) => s.score != null && s.score !== ''),
    [submissions],
  )

  const sortedGradedSubs = useMemo(() => sortSubmissionsForTrend(gradedSubs), [gradedSubs])

  const avg = gradedSubs.length
    ? gradedSubs.reduce((a, b) => a + Number(b.score), 0) / gradedSubs.length
    : 0

  const expiredCount = useMemo(
    () => tasks.filter((t) => new Date(t.deadline).getTime() < nowMs).length,
    [tasks, nowMs],
  )

  const pct = useMemo(() => completionPercent(tasks, submissions), [tasks, submissions])

  const pendingCount = useMemo(() => {
    const done = new Set(submissions.map((s) => s.task_id))
    return tasks.filter((t) => !done.has(t.id)).length
  }, [tasks, submissions])

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [tasks, taskQuery])

  const trendLineData = useMemo(
    () => ({
      labels: sortedGradedSubs.map((s, i) => {
        const d = new Date(s.submitted_at)
        return `G${i + 1} · ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      }),
      datasets: [
        {
          label: 'Graded scores (chronological)',
          data: sortedGradedSubs.map((s) => Number(s.score)),
          borderColor: '#2d3f5d',
          backgroundColor: 'rgba(250, 168, 83, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: '#faa853',
          pointBorderColor: '#2d3f5d',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    }),
    [sortedGradedSubs],
  )

  const gradesByTaskBar = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    return {
      labels: sortedTasks.map((t) => t.title.slice(0, 14) + (t.title.length > 14 ? '…' : '')),
      datasets: [
        {
          label: 'Latest score / assignment',
          data: sortedTasks.map((t) => {
            const latest = latestSubmissionForTask(t.id, submissions)
            if (latest?.score != null && latest.score !== '') return Number(latest.score)
            return null
          }),
          backgroundColor: sortedTasks.map((t, i) => {
            const latest = latestSubmissionForTask(t.id, submissions)
            const st = taskStatus(t, latest)
            if (st === 'pending') return 'rgba(45, 63, 93, 0.13)'
            if (st === 'submitted') return 'rgba(250, 168, 83, 0.38)'
            return i % 2 === 0 ? 'rgba(250, 168, 83, 0.95)' : 'rgba(45, 63, 93, 0.9)'
          }),
          borderColor: sortedTasks.map((t, i) => {
            const latest = latestSubmissionForTask(t.id, submissions)
            const st = taskStatus(t, latest)
            if (st === 'pending') return 'rgba(45, 63, 93, 0.35)'
            if (st === 'submitted') return 'rgba(45, 63, 93, 0.55)'
            return i % 2 === 0 ? 'rgba(45, 63, 93, 0.85)' : 'rgba(250, 168, 83, 0.55)'
          }),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }
  }, [tasks, submissions])

  const taskProgressDonut = useMemo(() => {
    const submittedTaskIds = new Set(submissions.map((s) => s.task_id).filter(Boolean))
    const withSubmission = tasks.filter((t) => submittedTaskIds.has(t.id)).length
    const pending = Math.max(0, tasks.length - withSubmission)
    return {
      labels: ['Completed (submitted)', 'Pending'],
      datasets: [
        {
          data: [withSubmission, pending],
          backgroundColor: ['rgba(250, 168, 83, 0.92)', 'rgba(45, 63, 93, 0.14)'],
          borderWidth: 0,
        },
      ],
    }
  }, [tasks, submissions])

  const upcoming = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 8)
        .map((t) => ({
          id: t.id,
          date: new Date(t.deadline).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          name: t.title,
        })),
    [tasks],
  )

  const deadlineDates = useMemo(() => tasks.map((t) => t.deadline).filter(Boolean), [tasks])

  const statusBadge = (st) => {
    const map = {
      pending: 'bg-[#fff8ef] text-amber-950 ring-1 ring-primary/35 shadow-sm',
      submitted: 'bg-[#f8fbff] text-secondary ring-1 ring-secondary/25 shadow-sm',
      graded: 'bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] text-secondary ring-1 ring-emerald-200/80 shadow-sm',
    }
    return map[st] ?? 'bg-[#eef4fb] text-secondary'
  }

  const navItems = useMemo(() => {
    return NAV_BASE.map((n) => (n.id === 'msg' ? { ...n, badge: unreadCount } : { ...n, badge: undefined }))
  }, [unreadCount])

  /** First task that is still pending and past deadline (for “Past due” card drill-down). */
  const firstOverduePendingId = useMemo(() => {
    for (const task of tasks) {
      const latest = latestSubmissionForTask(task.id, submissions)
      if (taskStatus(task, latest) !== 'pending') continue
      if (new Date(task.deadline).getTime() < nowMs) return task.id
    }
    return null
  }, [tasks, submissions, nowMs])

  const gradedAttempts = useMemo(
    () => submissions.filter((s) => s.score != null && s.score !== '').length,
    [submissions],
  )

  const jump = (id) => setActiveSection(id)

  const statusBadgeLabel = (st) => {
    if (st === 'pending') return 'Not submitted'
    if (st === 'submitted') return 'Awaiting grade'
    return 'Graded'
  }

  return (
    <AppShellLayout
      navItems={navItems}
      activeNavId={activeSection}
      onNavSelect={setActiveSection}
      roleLabel="Student"
      pageTitle={SECTION_TITLE[activeSection] ?? 'Student'}
      breadcrumbLast="Student"
      messageCount={unreadCount}
      onMessagesClick={() => setActiveSection('msg')}
    >
      {toast && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${
            toast.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
          role="status"
        >
          {toast.text}
        </div>
      )}

      {activeSection === 'dash' && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Hi <span className="font-semibold text-secondary">{profile?.full_name ?? 'there'}</span> — use
            the sidebar to jump between overview, assignments, your schedule, and more.
          </p>
          <section className="mb-6 rounded-2xl border border-secondary/10 bg-gradient-to-br from-white to-[#f8fbff] p-5 shadow-md md:p-6">
            <h2 className="font-heading text-xl font-bold text-secondary md:text-2xl">Your progress</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Completion rate, average grade, and items that need attention.
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm font-medium text-secondary">
                <span>Assignment completion</span>
                <span>{pct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">{pendingCount} assignment(s) still need a submission.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => jump('tasks')}
                className="btn-portal-primary"
              >
                Go to assignments
              </button>
              <button
                type="button"
                onClick={() => jump('cal')}
                className="rounded-full border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition hover:border-primary hover:bg-[#fff8ef]"
              >
                View schedule
              </button>
              <button
                type="button"
                onClick={() => jump('progress')}
                className="rounded-full border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition hover:border-primary hover:bg-[#fff8ef]"
              >
                See charts
              </button>
            </div>
          </section>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              color="bg-primary"
              value={tasks.length}
              title="Assignments"
              icon="📋"
              animationDelayMs={0}
              subtitle={`${pendingCount} still need a submission · ${pct}% complete`}
              foot="Open assignments"
              onMoreInfo={() => {
                jump('tasks')
                setToast({ type: 'ok', text: 'Assignments — expand a task to submit.' })
              }}
            />
            <MetricCard
              color="bg-green-600"
              value={submissions.length}
              title="Submissions"
              icon="➕"
              animationDelayMs={80}
              subtitle={
                submissions.length
                  ? `${submissions.length} attempt(s) · ${gradedAttempts} with a grade`
                  : 'No attempts yet — start from Assignments'
              }
              foot="View progress & log"
              onMoreInfo={() => {
                jump('progress')
                setToast({ type: 'ok', text: 'Progress & grades — charts and feedback below.' })
              }}
            />
            <MetricCard
              color="bg-orange-500"
              value={avg ? avg.toFixed(1) : '—'}
              title="Avg grade"
              icon="📊"
              animationDelayMs={160}
              subtitle={
                gradedAttempts > 0
                  ? `Across ${gradedAttempts} graded attempt(s)`
                  : 'Submit work to receive grades'
              }
              foot="See grade trend"
              onMoreInfo={() => {
                jump('progress')
                setToast({ type: 'ok', text: 'Check the score trend and feedback log.' })
              }}
            />
            <MetricCard
              color="bg-red-600"
              value={expiredCount}
              title="Past due"
              icon="🔔"
              animationDelayMs={240}
              subtitle={
                expiredCount === 0
                  ? 'You are caught up on deadlines'
                  : `${expiredCount} overdue (not submitted) — tap to focus`
              }
              foot={expiredCount ? 'Jump to overdue task' : 'View schedule'}
              onMoreInfo={() => {
                if (expiredCount && firstOverduePendingId != null) {
                  jump('tasks')
                  setOpenTaskId(firstOverduePendingId)
                  setToast({ type: 'ok', text: 'Opened your next overdue assignment.' })
                } else {
                  jump('cal')
                  setToast({ type: 'ok', text: 'Schedule — upcoming due dates.' })
                }
              }}
            />
          </div>
        </>
      )}

      {activeSection === 'tasks' && (
        <>
          <header className="mb-6 rounded-2xl border border-secondary/12 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef]/80 p-5 shadow-md shadow-secondary/[0.06] md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-heading text-xl font-bold tracking-tight text-secondary md:text-2xl">
                  Learning assignments
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Each row is one task from your instructor. Open it to see the <strong className="text-secondary">full brief</strong> on the
                  left and a <strong className="text-secondary">large workspace</strong> on the right — write your code, then submit. You can
                  submit again to improve your attempt unless your school locks resubmits.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-bold text-secondary shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
                  {tasks.length} task{tasks.length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-[#fff8ef] px-3 py-1.5 text-xs font-bold text-amber-950 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  {pendingCount} still open
                </span>
              </div>
            </div>
            <ol className="mt-6 grid gap-3 border-t border-secondary/10 pt-5 text-sm sm:grid-cols-3">
              <li className="flex gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-secondary/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-black text-white">
                  1
                </span>
                <span>
                  <span className="font-heading font-bold text-secondary">Read</span>
                  <span className="block text-xs text-gray-600">Open the task and read the whole brief.</span>
                </span>
              </li>
              <li className="flex gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-secondary/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-secondary">
                  2
                </span>
                <span>
                  <span className="font-heading font-bold text-secondary">Code</span>
                  <span className="block text-xs text-gray-600">Use the editor — it expands tall so you can work comfortably.</span>
                </span>
              </li>
              <li className="flex gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-secondary/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-black text-white">
                  3
                </span>
                <span>
                  <span className="font-heading font-bold text-secondary">Submit</span>
                  <span className="block text-xs text-gray-600">Send your solution; feedback appears under Progress when graded.</span>
                </span>
              </li>
            </ol>
          </header>
          <div className="mb-5">
            <label htmlFor="task-search" className="sr-only">
              Search assignments
            </label>
            <input
              id="task-search"
              type="search"
              placeholder="Filter by title or description…"
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              className="portal-input max-w-2xl shadow-md shadow-secondary/[0.04]"
            />
          </div>
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const latest = latestSubmissionForTask(task.id, submissions)
              const st = taskStatus(task, latest)
              const overdue = new Date(task.deadline).getTime() < nowMs && st === 'pending'
              const expanded = openTaskId === task.id
              const accent =
                overdue
                  ? 'border-l-red-500'
                  : st === 'graded'
                    ? 'border-l-emerald-500'
                    : st === 'submitted'
                      ? 'border-l-secondary/50'
                      : 'border-l-primary'
              return (
                <div
                  id={`student-assignment-${task.id}`}
                  key={task.id}
                  className={`group scroll-mt-24 overflow-hidden rounded-2xl border-2 bg-white shadow-md transition-all duration-200 ${
                    overdue
                      ? 'border-red-200/90 bg-gradient-to-r from-red-50/50 to-white'
                      : 'border-secondary/10 hover:border-primary/35 hover:shadow-lg'
                  } ${expanded ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-[#f8fbff]' : ''}`}
                >
                  <div className={`border-l-4 ${accent}`}>
                    <button
                      type="button"
                      onClick={() => setOpenTaskId(expanded ? null : task.id)}
                      className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-[#f8fbff]/90 md:p-5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg" aria-hidden>
                            📌
                          </span>
                          <p className="font-heading text-lg font-bold text-secondary">{task.title}</p>
                        </div>
                        {!expanded ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{task.description}</p>
                        ) : (
                          <p className="mt-1 text-xs font-medium text-primary/90">
                            Instructions & code workspace below — tap Collapse to hide
                          </p>
                        )}
                        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 rounded-md bg-secondary/5 px-2 py-0.5 font-medium text-secondary">
                            <span aria-hidden>🗓</span>
                            Due {new Date(task.deadline).toLocaleString()}
                          </span>
                          {overdue && (
                            <span className="font-bold text-red-600">Past due — submit soon</span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(st)}`}>
                          {statusBadgeLabel(st)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-xs font-bold transition ${
                            expanded
                              ? 'border-secondary bg-secondary text-white'
                              : 'border-primary/40 bg-white text-secondary group-hover:border-primary group-hover:bg-[#fff8ef]'
                          }`}
                        >
                          {expanded ? 'Collapse' : 'Open task'}
                          <svg
                            className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                  {expanded && (
                    <div className="border-t border-secondary/[0.08] bg-gradient-to-b from-[#f8fbff]/98 via-white to-[#fffdfa]">
                      <div className="mx-auto max-w-[1600px] px-3 pb-8 pt-6 sm:px-5 md:px-8 md:pb-10 md:pt-8">
                        <div className="mb-8 flex flex-col gap-4 border-b border-secondary/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-xl shadow-lg ring-2 ring-white">
                              <span aria-hidden>📘</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Assignment workspace
                              </p>
                              <h3 className="font-heading mt-0.5 text-2xl font-black tracking-tight text-secondary md:text-3xl">
                                {task.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Due{' '}
                                <time dateTime={task.deadline} className="font-semibold text-secondary">
                                  {new Date(task.deadline).toLocaleString()}
                                </time>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusBadge(st)}`}>
                              {statusBadgeLabel(st)}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                          <aside className="space-y-4 lg:col-span-4 xl:col-span-4">
                            <div className="rounded-2xl border border-secondary/12 bg-white p-5 shadow-md ring-1 ring-secondary/[0.04]">
                              <h4 className="font-heading text-sm font-bold text-secondary">What to build</h4>
                              <p className="mt-1 text-xs text-gray-500">
                                Read everything here before you code. Scroll if your instructor added a long brief.
                              </p>
                              <div className="mt-4 max-h-[min(38vh,420px)] overflow-y-auto rounded-xl bg-gradient-to-b from-[#f8fbff] to-white p-4 ring-1 ring-secondary/10">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 md:text-[15px]">
                                  {task.description || 'Use the title and due date as your guide.'}
                                </p>
                              </div>
                              {overdue && st === 'pending' && (
                                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                                  Deadline passed — submit as soon as you can.
                                </p>
                              )}
                            </div>
                          </aside>

                          <div className="flex min-h-0 flex-col gap-5 lg:col-span-8 xl:col-span-8">
                            {latest && st === 'submitted' && (
                              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-[#fff8ef] to-white px-5 py-4 shadow-sm">
                                <p className="text-sm text-secondary">
                                  <strong className="text-amber-950">Submitted.</strong> Waiting for a grade —{' '}
                                  <button
                                    type="button"
                                    className="font-semibold text-secondary underline decoration-primary decoration-2 underline-offset-2 hover:text-primary"
                                    onClick={() => jump('progress')}
                                  >
                                    open Progress & grades
                                  </button>
                                  .
                                </p>
                              </div>
                            )}
                            {latest && (latest.score != null || latest.feedback) && (
                              <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-md md:p-6">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800/90">
                                      Instructor result
                                    </p>
                                    <p className="font-heading mt-1 flex items-baseline gap-2 text-4xl font-black text-secondary md:text-5xl">
                                      {latest.score != null ? `${Number(latest.score).toFixed(0)}` : '—'}
                                      <span className="text-xl font-semibold text-gray-400">/ 100</span>
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                                    Latest attempt
                                  </span>
                                </div>
                                {latest.feedback && (
                                  <div className="mt-4 rounded-xl border border-emerald-100 bg-white/90 px-4 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Feedback</p>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-800">{latest.feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-secondary/15 bg-white shadow-xl shadow-secondary/10 ring-1 ring-secondary/[0.06]">
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary/10 bg-gradient-to-r from-secondary/[0.06] to-transparent px-4 py-3 md:px-5">
                                <div>
                                  <label className="font-heading text-base font-bold text-secondary" htmlFor={`code-${task.id}`}>
                                    Code editor
                                  </label>
                                  <p className="text-xs text-gray-500">Pull the corner to resize · monospace</p>
                                </div>
                                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-mono tabular-nums text-secondary">
                                  {(codeByTask[task.id] ?? '').length} chars
                                </span>
                              </div>
                              <textarea
                                id={`code-${task.id}`}
                                className="min-h-[min(72vh,720px)] w-full flex-1 resize-y border-0 bg-[#0f172a] px-4 py-4 font-mono text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40 md:min-h-[min(65vh,680px)] md:px-5 md:py-5 md:text-sm"
                                rows={24}
                                spellCheck={false}
                                placeholder={`# Your solution\n# This panel is tall so you can work comfortably.\n\n`}
                                value={codeByTask[task.id] ?? ''}
                                onChange={(e) => setCodeByTask((p) => ({ ...p, [task.id]: e.target.value }))}
                              />
                              <div className="flex flex-col gap-4 border-t border-secondary/10 bg-[#f8fbff]/80 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5 md:py-5">
                                <p className="max-w-2xl text-xs leading-relaxed text-gray-600">
                                  Submitting sends your latest code as an attempt. Grades and comments show under{' '}
                                  <button
                                    type="button"
                                    className="font-semibold text-secondary underline decoration-primary/50 underline-offset-2 hover:text-primary"
                                    onClick={() => jump('progress')}
                                  >
                                    Progress & grades
                                  </button>
                                  .
                                </p>
                                <button
                                  type="button"
                                  disabled={submittingId === task.id}
                                  className="btn-portal-primary shrink-0 px-10 py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => submitCode(task.id)}
                                >
                                  {submittingId === task.id ? 'Submitting…' : 'Submit solution'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-secondary/10 bg-[#f8fbff] py-8 text-center text-sm text-gray-500">
                {tasks.length === 0
                  ? 'No assignments published yet.'
                  : 'No tasks match your search.'}
              </p>
            )}
          </div>
        </>
      )}

      {activeSection === 'progress' && (
        <>
          <header className="relative mb-8 overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.06] via-white to-primary/[0.09] p-6 shadow-xl shadow-secondary/[0.08] md:p-8">
            <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute right-1/4 top-8 hidden h-24 w-24 rounded-full border border-primary/30 md:block" aria-hidden />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(250,168,83,0.35)]" aria-hidden />
                  Learning analytics
                </p>
                <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-secondary md:text-4xl">
                  Performance & trends
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  Track how your graded attempts evolve, where you&apos;ve submitted work, and every line of instructor
                  feedback — all in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-shrink-0 lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-secondary/15 bg-white/90 px-4 py-2.5 text-xs font-bold text-secondary shadow-md backdrop-blur-sm">
                  <FaMedal className="text-primary" aria-hidden />
                  {gradedSubs.length} graded task{gradedSubs.length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/35 bg-gradient-to-r from-primary/20 to-primary/5 px-4 py-2.5 text-xs font-bold text-secondary shadow-md">
                  <FaChartPie className="text-secondary" aria-hidden />
                  {pct}% completion
                </span>
              </div>
            </div>
          </header>

          <section className="mb-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border-2 border-secondary/10 bg-gradient-to-br from-white via-[#f8fbff]/90 to-white p-5 shadow-2xl shadow-secondary/[0.08] md:p-6">
                <div
                  className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-secondary via-primary to-secondary"
                  aria-hidden
                />
                <div className="relative mb-5 flex items-start justify-between gap-3 pl-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg ring-2 ring-white">
                      <FaChartLine className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-secondary">Score trend</h3>
                      <p className="mt-0.5 text-xs font-medium text-gray-500">
                        Graded attempts only · oldest → newest
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-500/25">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                    </span>
                    Live
                  </span>
                </div>
                {sortedGradedSubs.length === 0 ? (
                  <p className="relative rounded-2xl border border-dashed border-secondary/15 bg-[#f8fbff]/60 py-16 text-center text-sm text-gray-500">
                    No graded work yet. After your instructor posts scores, they will show here.
                  </p>
                ) : (
                  <div className="relative rounded-2xl bg-gradient-to-b from-white to-[#f8fbff]/50 p-3 ring-1 ring-secondary/[0.06] md:p-4">
                    <div className="pointer-events-none absolute inset-x-6 top-8 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
                    <div className="h-60">
                      <Line
                        data={trendLineData}
                        options={{
                          ...commonOptions,
                          interaction: { mode: 'index', intersect: false },
                          plugins: {
                            ...commonOptions.plugins,
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(45, 63, 93, 0.92)',
                              titleFont: { family: 'inherit', size: 12 },
                              bodyFont: { family: 'inherit', size: 13 },
                              padding: 12,
                              cornerRadius: 12,
                            },
                          },
                          scales: {
                            y: {
                              min: 0,
                              max: 100,
                              ticks: { stepSize: 20, color: '#64748b', font: { size: 11 } },
                              grid: { color: 'rgba(45, 63, 93, 0.06)' },
                            },
                            x: {
                              ticks: { color: '#64748b', maxRotation: 45, font: { size: 10 } },
                              grid: { display: false },
                            },
                          },
                          elements: {
                            line: { borderWidth: 3, tension: 0.35 },
                            point: { radius: 5, hoverRadius: 7, borderWidth: 2 },
                          },
                        }}
                      />
                    </div>
                    <p className="mt-2 text-center text-[11px] font-medium text-secondary/55">
                      Navy line · amber markers · each step is one graded submission
                    </p>
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-[#fff8ef]/95 via-white to-[#f8fbff]/90 p-5 shadow-2xl shadow-primary/[0.07] md:p-6">
                <div className="pointer-events-none absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/15 blur-2xl" aria-hidden />
                <div className="relative mb-5 flex items-start justify-between gap-3 border-b border-secondary/10 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#e89235] text-white shadow-lg shadow-primary/30 ring-2 ring-white">
                      <FaChartPie className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-secondary">Completion split</h3>
                      <p className="mt-0.5 text-xs font-medium text-gray-500">Submitted at least once vs not yet</p>
                    </div>
                  </div>
                </div>
                <div className="relative mx-auto flex h-64 max-w-[14rem] items-center justify-center">
                  <div className="relative h-full w-full max-w-xs">
                    <Doughnut
                      data={taskProgressDonut}
                      options={{
                        ...commonOptions,
                        cutout: '62%',
                        plugins: {
                          ...commonOptions.plugins,
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              padding: 18,
                              font: { size: 11, weight: '600' },
                              color: '#2d3f5d',
                            },
                          },
                        },
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10">
                      <div className="text-center">
                        <p className="font-heading text-4xl font-black tabular-nums text-secondary">{pct}%</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">on track</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="relative overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-xl shadow-secondary/[0.06]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
              <div className="p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <FaComments className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-secondary md:text-xl">Grades & feedback log</h2>
                    <p className="text-xs text-gray-500">Newest submissions appear first</p>
                  </div>
                </div>
                <div className="max-h-[22rem] overflow-auto rounded-2xl border border-secondary/10 bg-gradient-to-b from-[#f8fbff]/40 to-white shadow-inner">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b-2 border-secondary/10 bg-gradient-to-r from-secondary/[0.08] to-primary/[0.06] text-xs font-bold uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="py-3 pl-4 pr-2">Task</th>
                        <th className="py-3 pr-2">Score</th>
                        <th className="py-3 pr-4">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/[0.07]">
                      {sortedSubs.map((s, idx) => {
                        const task = tasks.find((t) => String(t.id) === String(s.task_id))
                        const stripe = idx % 2 === 0 ? 'bg-white/90' : 'bg-[#f8fbff]/40'
                        return (
                          <tr key={s.id} className={`${stripe} transition hover:bg-primary/[0.04]`}>
                            <td className="py-3 pl-4 pr-2 align-top font-heading font-semibold text-secondary">
                              {task?.title ?? `Task #${s.task_id}`}
                            </td>
                            <td className="py-3 pr-2 align-top">
                              <span
                                className={`inline-flex min-w-[2.5rem] justify-center rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums ${scoreBadgeClass(s.score)}`}
                              >
                                {s.score != null ? Number(s.score).toFixed(0) : '—'}
                              </span>
                            </td>
                            <td className="max-w-[14rem] py-3 pr-4 align-top text-sm leading-relaxed text-gray-700 md:max-w-none">
                              {s.feedback || <span className="text-gray-400">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {sortedSubs.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-500">No submissions yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-3xl border border-secondary/10 bg-gradient-to-br from-white via-[#fff8ef]/30 to-[#f8fbff]/50 p-5 shadow-xl shadow-secondary/[0.06] md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-primary/25 text-secondary">
                  <FaAward className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-secondary md:text-xl">Performance summary</h2>
                  <p className="text-xs text-gray-500">Snapshot of your workload</p>
                </div>
              </div>
              <ul className="grid flex-1 gap-3 sm:grid-cols-2">
                <li className="group relative overflow-hidden rounded-2xl border border-secondary/10 bg-gradient-to-br from-[#f8fbff] to-white p-4 shadow-md transition hover:border-primary/30 hover:shadow-lg">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Completion</p>
                  <p className="font-heading mt-2 text-3xl font-black tabular-nums text-secondary">{pct}%</p>
                  <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/10 blur-xl transition group-hover:bg-primary/20" aria-hidden />
                </li>
                <li className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-[#fff8ef] to-white p-4 shadow-md transition hover:border-secondary/25 hover:shadow-lg">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Average grade</p>
                  <p className="font-heading mt-2 text-3xl font-black tabular-nums text-secondary">
                    {gradedSubs.length ? avg.toFixed(1) : '—'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {gradedSubs.length ? `from ${gradedSubs.length} graded` : 'No grades yet'}
                  </p>
                  <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-secondary/10 blur-2xl" aria-hidden />
                </li>
                <li className="rounded-2xl border border-secondary/10 bg-white/90 p-4 shadow-inner transition hover:border-secondary/20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Submissions</p>
                  <p className="font-heading mt-2 text-2xl font-bold tabular-nums text-secondary">{submissions.length}</p>
                  <p className="mt-1 text-[11px] text-gray-500">Total attempts logged</p>
                </li>
                <li className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/80 to-white p-4 shadow-inner transition hover:border-red-200">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-800/80">Past due (open)</p>
                  <p className="font-heading mt-2 text-2xl font-bold tabular-nums text-red-600">{expiredCount}</p>
                  <p className="mt-1 text-[11px] text-gray-500">Finish these when you can</p>
                </li>
              </ul>
              <p className="rounded-xl border border-secondary/10 bg-white/80 px-4 py-3 text-sm leading-relaxed text-gray-600">
                Grades and feedback are posted by instructors from the admin grading tools.
              </p>
            </section>
          </div>
        </>
      )}

      {activeSection === 'cal' && (
        <>
          <header className="mb-6 rounded-2xl border border-secondary/12 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef]/70 p-5 shadow-md md:p-6">
            <h2 className="font-heading text-xl font-bold tracking-tight text-secondary md:text-2xl">Your schedule</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              <strong className="text-secondary">Amber dots</strong> mark deadlines or school events; the soft ring marks
              today. Weekdays use a cool sky tint and weekends a warm cream tint. Swipe the calendar on small screens to
              see the full month.
            </p>
          </header>
          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="min-w-0 lg:col-span-2">
              <CalendarWidget
                title="Calendar"
                highlightDates={[...deadlineDates, ...studentEventDates].filter(Boolean)}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-secondary/10 border-l-4 border-l-primary bg-white shadow-lg shadow-secondary/[0.06]">
                <div className="flex items-center gap-3 border-b border-secondary/10 bg-gradient-to-r from-primary/[0.08] via-[#f8fbff] to-white px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner shadow-primary/10">
                    <FaCalendarAlt className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-secondary">Upcoming events</p>
                    <p className="text-[11px] text-gray-500">Published by administrators</p>
                  </div>
                </div>
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  {upcomingStudentEvents.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No upcoming events — check back after admins publish.</p>
                  ) : (
                    <ul className="space-y-2 p-4 text-sm">
                      {upcomingStudentEvents.map((ev) => (
                        <li
                          key={ev.id}
                          className="rounded-xl border border-secondary/10 bg-gradient-to-br from-[#f8fbff] to-white p-3 transition hover:border-primary/30 hover:shadow-md"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {new Date(ev.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="mt-1 font-heading font-bold text-secondary">{ev.title}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-secondary/10 border-l-4 border-l-secondary bg-white shadow-lg shadow-secondary/[0.06]">
                <div className="flex items-center gap-3 border-b border-secondary/10 bg-gradient-to-r from-secondary/[0.07] via-[#f8fbff] to-[#fff8ef]/50 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary shadow-inner">
                    <FaClipboardList className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-secondary">Upcoming deadlines</p>
                    <p className="text-[11px] text-gray-500">Tap a task to open assignments</p>
                  </div>
                </div>
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[16rem] text-left text-sm">
                    <thead className="portal-table-head border-b text-xs font-bold uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Task</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/[0.08]">
                      {upcoming.map((row) => (
                        <tr
                          key={row.id}
                          className="cursor-pointer transition hover:bg-[#fff8ef]/80"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-gray-600">{row.date}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="group inline-flex items-center gap-1 text-left font-heading font-semibold text-secondary transition hover:text-primary"
                              onClick={() => {
                                setActiveSection('tasks')
                                setOpenTaskId(row.id)
                                setTaskQuery('')
                              }}
                            >
                              {row.name}
                              <span className="text-primary opacity-0 transition group-hover:opacity-100" aria-hidden>
                                →
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {upcoming.length === 0 && (
                    <p className="p-6 text-center text-sm text-gray-500">No upcoming deadlines.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section className="portal-section-card mb-6 overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef]/40 shadow-lg shadow-secondary/[0.07]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-secondary/10 pb-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-lg shadow-md ring-2 ring-white" aria-hidden>
                  📊
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-secondary md:text-xl">Latest grade per assignment</h3>
                  <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-600 md:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-secondary/15 ring-1 ring-secondary/30" aria-hidden />
                      Navy tint = not submitted
                    </span>
                    {' · '}
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/40 ring-1 ring-secondary/25" aria-hidden />
                      Amber = waiting for grade
                    </span>
                    {' · '}
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary ring-1 ring-secondary/40" aria-hidden />
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-secondary ring-1 ring-primary/35" aria-hidden />
                      Solid amber / navy = scored (alternating)
                    </span>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                Per task
              </span>
            </div>
            <div className="h-64 min-h-[14rem] w-full md:h-72">
              <Bar
                data={gradesByTaskBar}
                options={{
                  ...commonOptions,
                  interaction: { mode: 'index', intersect: false },
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      ticks: { stepSize: 20, color: '#64748b' },
                      grid: { color: 'rgba(45, 63, 93, 0.07)' },
                    },
                    x: {
                      ticks: { maxRotation: 45, minRotation: 0, color: '#64748b' },
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const v = ctx.raw
                          if (v == null || Number.isNaN(v)) return 'No grade yet'
                          return `Score: ${v}`
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </section>
        </>
      )}

      {activeSection === 'msg' && (
        <div className="space-y-8">
          <header className="relative mb-2 overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.07] via-white to-primary/[0.08] p-6 shadow-xl shadow-secondary/[0.08] md:p-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 left-0 h-44 w-44 rounded-full bg-secondary/12 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary shadow-sm backdrop-blur-sm">
                  <FaEnvelope className="text-primary" aria-hidden />
                  Communications
                </p>
                <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-secondary md:text-4xl">Inbox</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  Announcements and notes from your instructors land here. Open each message, then mark the inbox read
                  when you&apos;re caught up.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {unreadCount > 0 && !msgRead && (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/25 to-primary/10 px-4 py-2.5 text-xs font-bold text-secondary shadow-md">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-35" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
                    </span>
                    Unread
                  </span>
                )}
                {msgRead && (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-sm">
                    <FaCheckDouble className="h-3.5 w-3.5" aria-hidden />
                    All read
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-2xl border border-secondary/15 bg-white/90 px-4 py-2.5 text-xs font-bold text-secondary shadow-md">
                  <FaInbox className="text-primary" aria-hidden />
                  {messages.length} message{messages.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            {messages.map((m, idx) => {
              const isNewFocus = !msgRead && idx === 0
              return (
                <article
                  key={m.id}
                  className={[
                    'group relative overflow-hidden rounded-3xl border-2 bg-white p-0 shadow-lg transition duration-200',
                    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-2xl hover:shadow-secondary/10',
                    isNewFocus
                      ? 'border-primary/45 ring-2 ring-primary/20 ring-offset-2 ring-offset-[#f8fbff]'
                      : 'border-secondary/10',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'absolute left-0 top-0 h-full w-1.5',
                      isNewFocus
                        ? 'bg-gradient-to-b from-primary via-secondary to-primary'
                        : 'bg-gradient-to-b from-secondary/30 to-secondary/10',
                    ].join(' ')}
                    aria-hidden
                  />
                  <div className="pointer-events-none absolute -right-6 top-0 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
                  <div className="relative pl-2 pr-5 pt-5 sm:pl-3 sm:pr-6 sm:pt-6 md:pl-4">
                    <div className="flex gap-4 md:gap-5">
                      <div
                        className={[
                          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg ring-2 ring-white transition group-hover:ring-primary/30 md:h-16 md:w-16 md:text-xl',
                          isNewFocus
                            ? 'bg-gradient-to-br from-primary to-[#e89235] text-secondary'
                            : 'bg-gradient-to-br from-secondary to-[#1a2542]',
                        ].join(' ')}
                      >
                        {(String(m.title ?? '').trim().slice(0, 1) || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 pb-5 md:pb-6">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                          <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary ring-1 ring-secondary/10">
                            {m.target}
                          </span>
                          <time
                            className="text-xs font-medium tabular-nums text-gray-500"
                            dateTime={m.created_at}
                          >
                            {new Date(m.created_at).toLocaleString()}
                          </time>
                          {isNewFocus && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
                              New
                            </span>
                          )}
                        </div>
                        {m.author && (
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary/90">
                            From {m.author}
                          </p>
                        )}
                        <h3 className="font-heading mt-1 text-lg font-bold leading-snug text-secondary md:text-xl">
                          {m.title}
                        </h3>
                        <p className="mt-3 whitespace-pre-wrap border-t border-secondary/[0.06] pt-3 text-sm leading-relaxed text-gray-700">
                          {m.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
            {messages.length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-secondary/20 bg-gradient-to-br from-[#f8fbff] to-white py-16 text-center shadow-inner">
                <FaInbox className="mx-auto mb-3 h-10 w-10 text-secondary/25" aria-hidden />
                <p className="text-sm font-medium text-gray-500">No announcements yet — you&apos;re all caught up.</p>
              </div>
            )}
          </div>

          <div
            className={[
              'relative overflow-hidden rounded-3xl border p-6 shadow-xl transition md:p-7',
              msgRead
                ? 'border-secondary/12 bg-gradient-to-br from-[#f8fbff] to-white'
                : 'border-primary/35 bg-gradient-to-br from-[#fff8ef] via-white to-[#f8fbff]/80 ring-2 ring-primary/15',
            ].join(' ')}
          >
            <div
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary"
              aria-hidden
            />
            <div className="relative flex flex-col gap-5 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <span
                  className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    msgRead ? 'bg-secondary/10 text-secondary' : 'bg-primary/20 text-secondary',
                  ].join(' ')}
                >
                  {msgRead ? (
                    <FaCheckDouble className="h-5 w-5" aria-hidden />
                  ) : (
                    <FaEnvelope className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                  {msgRead ? (
                    <>
                      <strong className="font-heading text-secondary">All caught up.</strong>{' '}
                      <span className="text-gray-600">New messages will appear above when instructors send them.</span>
                    </>
                  ) : (
                    <>
                      <strong className="font-heading text-secondary">You have unread inbox items.</strong>{' '}
                      <span className="text-gray-600">Mark read after you&apos;ve reviewed the messages above.</span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => markRead()}
                className={
                  msgRead
                    ? 'shrink-0 rounded-full border-2 border-secondary/20 bg-white px-8 py-3.5 text-sm font-bold text-secondary shadow-md transition hover:bg-[#f8fbff] active:scale-[0.98]'
                    : 'btn-portal-primary shrink-0 px-8 py-3.5 text-sm font-bold shadow-lg transition active:scale-[0.98]'
                }
              >
                {msgRead ? (
                  <span className="inline-flex items-center gap-2">
                    <FaCheckDouble className="h-4 w-4" aria-hidden />
                    Inbox read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <FaCheckDouble className="h-4 w-4" aria-hidden />
                    Mark inbox as read
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShellLayout>
  )
}
