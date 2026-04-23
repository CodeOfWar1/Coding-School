import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { listMessagesForRole } from '../state/portalMessages'
import { listPortalEvents } from '../state/portalEvents'
import { supabase } from '../lib/supabase'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import CalendarWidget from '../components/CalendarWidget'
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
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
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
          backgroundColor: sortedTasks.map((t) => {
            const latest = latestSubmissionForTask(t.id, submissions)
            const st = taskStatus(t, latest)
            if (st === 'pending') return '#e2e8f0'
            if (st === 'submitted') return '#93c5fd'
            return '#2563eb'
          }),
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
          backgroundColor: ['#16a34a', '#e2e8f0'],
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
      pending: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
      submitted: 'bg-sky-100 text-sky-900 ring-1 ring-sky-200',
      graded: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
    }
    return map[st] ?? 'bg-slate-100 text-slate-800'
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
          <p className="mb-4 text-sm text-slate-600">
            Hi <span className="font-semibold text-slate-800">{profile?.full_name ?? 'there'}</span> — use
            the sidebar to jump between overview, assignments, your schedule, and more.
          </p>
          <section className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Your progress</h2>
            <p className="mt-1 text-sm text-slate-600">
              Completion rate, average grade, and items that need attention.
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm font-medium text-slate-700">
                <span>Assignment completion</span>
                <span>{pct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{pendingCount} assignment(s) still need a submission.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => jump('tasks')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Go to assignments
              </button>
              <button
                type="button"
                onClick={() => jump('cal')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View schedule
              </button>
              <button
                type="button"
                onClick={() => jump('progress')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                See charts
              </button>
            </div>
          </section>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              color="bg-blue-600"
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Coding tasks & assignments</h2>
              <p className="text-sm text-slate-600">
                Expand a task to read details and submit. Search to filter the list.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700">
                {tasks.length} total
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-900">
                {pendingCount} need work
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="task-search" className="sr-only">
              Search assignments
            </label>
            <input
              id="task-search"
              type="search"
              placeholder="Search by title or description…"
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-blue-500/30 transition focus:ring-2"
            />
          </div>
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const latest = latestSubmissionForTask(task.id, submissions)
              const st = taskStatus(task, latest)
              const overdue = new Date(task.deadline).getTime() < nowMs && st === 'pending'
              const expanded = openTaskId === task.id
              return (
                <div
                  key={task.id}
                  className={`overflow-hidden rounded-xl border shadow-sm transition ${
                    overdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenTaskId(expanded ? null : task.id)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-slate-50/80"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Due {new Date(task.deadline).toLocaleString()}
                        {overdue && <span className="ml-2 font-semibold text-red-600">Overdue</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(st)}`}>
                        {statusBadgeLabel(st)}
                      </span>
                      <span className="text-xs font-medium text-blue-600">{expanded ? 'Collapse ▲' : 'Expand ▼'}</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-2">
                      {latest && (
                        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                          <p className="font-medium text-slate-800">
                            Latest grade:{' '}
                            <span className="text-blue-600">
                              {latest.score != null ? Number(latest.score).toFixed(0) : '—'} / 100
                            </span>
                          </p>
                          {latest.feedback && (
                            <p className="mt-2 text-slate-700">
                              <span className="font-medium text-slate-900">Feedback: </span>
                              {latest.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      <label className="block text-xs font-medium text-slate-600">Your solution (code)</label>
                      <textarea
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm shadow-inner outline-none ring-blue-500/25 focus:ring-2"
                        rows={5}
                        placeholder="Paste or write your code here…"
                        value={codeByTask[task.id] ?? ''}
                        onChange={(e) => setCodeByTask((p) => ({ ...p, [task.id]: e.target.value }))}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={submittingId === task.id}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => submitCode(task.id)}
                        >
                          {submittingId === task.id ? 'Submitting…' : 'Submit solution'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
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
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Performance & trends</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Score trend</h3>
                <p className="mb-2 text-xs text-slate-500">
                  Only graded attempts (with a score), oldest → newest on the axis.
                </p>
                {sortedGradedSubs.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    No graded work yet. After your instructor posts scores, they will show here.
                  </p>
                ) : (
                  <div className="h-56">
                    <Line
                      data={trendLineData}
                      options={{
                        ...commonOptions,
                        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Completion split</h3>
                <p className="mb-2 text-xs text-slate-500">Tasks with at least one submission vs open</p>
                <div className="mx-auto h-56 max-w-xs">
                  <Doughnut data={taskProgressDonut} options={commonOptions} />
                </div>
              </div>
            </div>
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Grades & feedback log</h2>
              <div className="max-h-96 overflow-auto rounded-lg border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="py-2 pl-3 pr-2">Task</th>
                      <th className="py-2 pr-2">Score</th>
                      <th className="py-2 pr-3">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubs.map((s) => {
                      const task = tasks.find((t) => String(t.id) === String(s.task_id))
                      return (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                          <td className="py-2 pl-3 pr-2 align-top">{task?.title ?? `Task #${s.task_id}`}</td>
                          <td className="py-2 pr-2 align-top font-medium">
                            {s.score != null ? Number(s.score).toFixed(0) : '—'}
                          </td>
                          <td className="py-2 pr-3 align-top text-slate-700">{s.feedback || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {sortedSubs.length === 0 && (
                  <p className="py-8 text-center text-slate-500">No submissions yet.</p>
                )}
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Performance summary</h2>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <strong>Completion:</strong> {pct}%
                </li>
                <li>
                  <strong>Average grade:</strong>{' '}
                  {gradedSubs.length ? `${avg.toFixed(1)} (from ${gradedSubs.length} graded)` : 'N/A'}
                </li>
                <li>
                  <strong>Total submissions:</strong> {submissions.length}
                </li>
                <li>
                  <strong>Past-due (not submitted):</strong> {expiredCount}
                </li>
              </ul>
              <p className="mt-4 text-sm text-slate-500">
                Grades and feedback are added by your instructors in the admin tools.
              </p>
            </section>
          </div>
        </>
      )}

      {activeSection === 'cal' && (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Highlights show your assignment deadlines and admin-published school events. Scroll sideways on small
            screens.
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <div className="mb-2 flex items-center gap-2 rounded-t-lg border border-b-0 border-slate-200 bg-blue-600 px-3 py-2 text-sm text-white sm:px-4 sm:py-2.5">
                <span className="font-semibold">Calendar</span>
              </div>
              <CalendarWidget
                title=""
                highlightDates={[...deadlineDates, ...studentEventDates].filter(Boolean)}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Upcoming events</div>
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  {upcomingStudentEvents.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-500">No upcoming events.</p>
                  ) : (
                    <ul className="space-y-1 p-3 text-sm">
                      {upcomingStudentEvents.map((ev) => (
                        <li key={ev.id} className="rounded border border-slate-100 bg-slate-50/60 p-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {new Date(ev.date).toLocaleDateString()}
                          </p>
                          <p className="font-semibold text-slate-900">{ev.title}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Upcoming deadlines</div>
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[16rem] text-left text-sm">
                    <thead className="border-b bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Task</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((row) => (
                        <tr key={row.id} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50">
                          <td className="px-3 py-2 whitespace-nowrap">{row.date}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="text-left font-medium text-blue-700 hover:underline"
                              onClick={() => {
                                setActiveSection('tasks')
                                setOpenTaskId(row.id)
                                setTaskQuery('')
                              }}
                            >
                              {row.name}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {upcoming.length === 0 && (
                    <p className="p-4 text-center text-sm text-slate-500">No upcoming deadlines.</p>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-slate-800">Latest grade per assignment</h3>
                <p className="mb-2 text-xs text-slate-500">
                  Bars use your most recent submission per task (gray = not submitted, light blue = awaiting grade).
                </p>
                <div className="h-56 min-w-[17rem]">
                  <Bar
                    data={gradesByTaskBar}
                    options={{
                      ...commonOptions,
                      scales: {
                        y: { min: 0, max: 100, ticks: { stepSize: 20 } },
                        x: { ticks: { maxRotation: 45, minRotation: 0 } },
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
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'msg' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Messages from instructors and staff.
          </p>
          <div className="space-y-3">
            {messages.map((m) => (
              <article key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {m.target} · {new Date(m.created_at).toLocaleString()}
                </p>
                <p className="mt-1 font-semibold text-slate-900">{m.title}</p>
                <p className="mt-2 text-sm text-slate-700">{m.body}</p>
              </article>
            ))}
            {messages.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                No announcements yet.
              </p>
            )}
          </div>
          <div
            className={`rounded-xl border p-4 transition ${
              msgRead ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50/60 ring-2 ring-blue-200/50'
            }`}
          >
            <button type="button" onClick={() => markRead()} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              {msgRead ? 'Marked as read' : 'Mark inbox as read'}
            </button>
          </div>
        </div>
      )}
    </AppShellLayout>
  )
}
