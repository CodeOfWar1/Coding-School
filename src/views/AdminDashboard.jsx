import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import AppShellLayout from '../components/AppShellLayout'
import MetricCard from '../components/MetricCard'
import CalendarWidget from '../components/CalendarWidget'
import { commonOptions } from '../components/charts'
import { buildSkillRadarFromAvg } from '../utils/academic'
import { ROLE_META, ROLE_ORDER } from '../theme/roleStyles'
import { useMessageInbox } from '../hooks/useMessageInbox'
import { createPortalMessage, listPortalMessages } from '../state/portalMessages'
import { createPortalEvent, listPortalEvents } from '../state/portalEvents'
import { Line, Pie, Bar } from 'react-chartjs-2'

const NAV_BASE = [
  { id: 'dash', label: 'Overview', icon: '🏠' },
  { id: 'users', label: 'Users & roles', icon: '👥' },
  { id: 'tasks', label: 'Coding tasks', icon: '📋' },
  { id: 'grade', label: 'Grading', icon: '✅' },
  { id: 'skills', label: 'Skill insights', icon: '🎯' },
  { id: 'landing', label: 'Landing page', icon: '🖼️' },
  { id: 'activity', label: 'Activity', icon: '📡' },
  { id: 'msg', label: 'Messages', icon: '✉️', badge: 0 },
]

const SECTION_TITLE = {
  dash: 'Overview',
  users: 'Users & roles',
  tasks: 'Coding tasks',
  grade: 'Grading',
  skills: 'Skill insights',
  landing: 'Landing page',
  activity: 'Activity',
  msg: 'Messages',
}

const ROLES = ['student', 'parent', 'finance', 'admin']

export default function AdminDashboard() {
  const { isDemoMode, user } = useAuth()
  const { unreadCount, markRead, read: adminMsgRead } = useMessageInbox(user?.id, 'admin')
  const [activeSection, setActiveSection] = useState('dash')
  const [toast, setToast] = useState(null)
  const [users, setUsers] = useState([])
  const [taskCount, setTaskCount] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [paymentCount, setPaymentCount] = useState(0)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' })
  const [content, setContent] = useState({
    hero_title: '',
    hero_text: '',
    hero_image_url: '',
    hero_image_url_secondary: '',
  })
  const [tasksList, setTasksList] = useState([])
  const [submissionsFeed, setSubmissionsFeed] = useState([])
  const [gradeEdits, setGradeEdits] = useState({})
  const [selectedSkillStudentId, setSelectedSkillStudentId] = useState('')
  const [msgVersion, setMsgVersion] = useState(0)
  const [msgDraft, setMsgDraft] = useState({ title: '', body: '', target: 'all' })
  const [activityQuery, setActivityQuery] = useState('')
  const [activityStatus, setActivityStatus] = useState('all') // all | graded | pending
  const [usersSearch, setUsersSearch] = useState('')
  const [skillStudentQuery, setSkillStudentQuery] = useState('')

  const loadAll = useCallback(async () => {
    if (isDemoMode) {
      setUsers([
        { id: 'u-admin', full_name: 'Admin User', role: 'admin' },
        { id: 'u-finance', full_name: 'Finance User', role: 'finance' },
        { id: 'u-student', full_name: 'Student One', role: 'student' },
        { id: 'u-student-two', full_name: 'Student Two', role: 'student' },
        { id: 'u-parent', full_name: 'Parent One', role: 'parent' },
      ])
      setTaskCount(4)
      setSubmissionCount(6)
      setPaymentCount(2)
      setContent({
        hero_title: 'Learn to code with confidence',
        hero_text: 'Build real projects with mentors.',
        hero_image_url: '/media/hero.jpg',
        hero_image_url_secondary: '/media/Logo.png',
      })
      setTasksList([
        { id: 1, title: 'FizzBuzz', deadline: new Date().toISOString(), description: 'Warmup' },
        { id: 2, title: 'Palindrome lab', deadline: new Date().toISOString(), description: 'Strings' },
      ])
      setSubmissionsFeed([
        {
          id: 101,
          task_id: 1,
          student_id: 'u-student',
          student_name: 'Student One',
          task_title: 'FizzBuzz',
          score: 78,
          feedback: 'Good structure.',
          submitted_at: new Date().toISOString(),
        },
        {
          id: 102,
          task_id: 2,
          student_id: 'u-student',
          student_name: 'Student One',
          task_title: 'Palindrome lab',
          score: null,
          feedback: '',
          submitted_at: new Date().toISOString(),
        },
        {
          id: 103,
          task_id: 1,
          student_id: 'u-student-two',
          student_name: 'Student Two',
          task_title: 'FizzBuzz',
          score: 52,
          feedback: 'Review loops.',
          submitted_at: new Date().toISOString(),
        },
        {
          id: 104,
          task_id: 2,
          student_id: 'u-student-two',
          student_name: 'Student Two',
          task_title: 'Palindrome lab',
          score: 61,
          feedback: 'Getting there.',
          submitted_at: new Date().toISOString(),
        },
      ])
      return
    }
    const [usersRes, contentRes, tasksRes, subRes, payRes] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('landing_content').select('*').limit(1).maybeSingle(),
      supabase.from('coding_tasks').select('*').order('deadline', { ascending: true }),
      supabase.from('coding_submissions').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ])
    setUsers(usersRes.data ?? [])
    setContent({
      ...(contentRes.data ?? {}),
      hero_title: contentRes.data?.hero_title ?? '',
      hero_text: contentRes.data?.hero_text ?? '',
      hero_image_url: contentRes.data?.hero_image_url ?? '',
      hero_image_url_secondary: contentRes.data?.hero_image_url_secondary ?? '',
    })
    setTasksList(tasksRes.data ?? [])
    setTaskCount((tasksRes.data ?? []).length)
    setSubmissionCount(subRes.count ?? 0)
    setPaymentCount(payRes.count ?? 0)

    const { data: feed } = await supabase
      .from('coding_submissions')
      .select('id, task_id, student_id, score, feedback, submitted_at, code, profiles(full_name), coding_tasks(title)')
      .order('submitted_at', { ascending: false })
      .limit(500)
    const normalized =
      feed?.map((row) => ({
        id: row.id,
        task_id: row.task_id,
        student_id: row.student_id,
        student_name: row.profiles?.full_name ?? 'Student',
        task_title: row.coding_tasks?.title ?? `Task #${row.task_id}`,
        score: row.score,
        feedback: row.feedback,
        submitted_at: row.submitted_at,
        code_preview: (row.code ?? '').slice(0, 120),
      })) ?? []
    setSubmissionsFeed(normalized)
  }, [isDemoMode])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadAll()
    }, 0)
    return () => clearTimeout(id)
  }, [loadAll])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const portalMsgs = useMemo(() => {
    void msgVersion
    return listPortalMessages()
  }, [msgVersion])

  const studentUsers = useMemo(() => users.filter((u) => u.role === 'student'), [users])

  const skillStudentId = useMemo(() => {
    if (!studentUsers.length) return ''
    const ok = studentUsers.some((s) => String(s.id) === String(selectedSkillStudentId))
    if (selectedSkillStudentId && ok) return String(selectedSkillStudentId)
    return String(studentUsers[0].id)
  }, [studentUsers, selectedSkillStudentId])

  const filteredSkillStudentUsers = useMemo(() => {
    const q = skillStudentQuery.trim().toLowerCase()
    if (!q) return studentUsers
    return studentUsers.filter((u) => {
      const hay = `${u.full_name ?? ''} ${u.id ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [studentUsers, skillStudentQuery])

  const skillSelectOptions = useMemo(() => {
    if (!skillStudentId) return []
    const selected = studentUsers.find((u) => String(u.id) === String(skillStudentId))
    const opts = filteredSkillStudentUsers
    const hasSelected = opts.some((o) => String(o.id) === String(skillStudentId))
    return hasSelected ? opts : selected ? [selected, ...opts] : opts
  }, [studentUsers, filteredSkillStudentUsers, skillStudentId])

  const skillScores = useMemo(() => {
    if (!skillStudentId) return []
    return submissionsFeed
      .filter(
        (s) =>
          String(s.student_id) === String(skillStudentId) && s.score != null && s.score !== '',
      )
      .map((s) => Number(s.score))
  }, [skillStudentId, submissionsFeed])

  const createTask = async (e) => {
    e.preventDefault()
    if (isDemoMode) {
      const id = Date.now()
      setTasksList((prev) => [...prev, { id, ...taskForm, deadline: taskForm.deadline || new Date().toISOString() }])
      setTaskCount((c) => c + 1)
    } else {
      await supabase.from('coding_tasks').insert(taskForm)
      await loadAll()
    }
    setTaskForm({ title: '', description: '', deadline: '' })
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task? Submissions may be deleted by database rules.')) return
    if (isDemoMode) {
      setTasksList((prev) => prev.filter((t) => t.id !== id))
      setTaskCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('coding_tasks').delete().eq('id', id)
      await loadAll()
    }
  }

  const saveContent = async (e) => {
    e.preventDefault()
    if (isDemoMode) {
      setContent((c) => ({ ...c }))
    } else {
      await supabase.from('landing_content').upsert({
        id: 1,
        hero_title: content.hero_title,
        hero_text: content.hero_text,
        hero_image_url: content.hero_image_url || null,
        hero_image_url_secondary: content.hero_image_url_secondary || null,
      })
      await loadAll()
    }
  }

  const updateUserRole = async (userId, role) => {
    if (isDemoMode) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } else {
      await supabase.from('profiles').update({ role }).eq('id', userId)
      await loadAll()
    }
  }

  const setGradeField = (submissionId, field, value) => {
    setGradeEdits((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }))
  }

  const saveGrade = async (row) => {
    const edits = gradeEdits[row.id] ?? {}
    const score = edits.score !== undefined ? edits.score : row.score
    const feedback = edits.feedback !== undefined ? edits.feedback : row.feedback
    if (isDemoMode) {
      setSubmissionsFeed((prev) =>
        prev.map((s) =>
          s.id === row.id ? { ...s, score: score === '' ? null : Number(score), feedback } : s,
        ),
      )
      setGradeEdits((prev) => {
        const next = { ...prev }
        delete next[row.id]
        return next
      })
    } else {
      await supabase
        .from('coding_submissions')
        .update({
          score: score === '' || score == null ? null : Number(score),
          feedback: feedback || null,
        })
        .eq('id', row.id)
      await loadAll()
      setGradeEdits((prev) => {
        const next = { ...prev }
        delete next[row.id]
        return next
      })
    }
  }

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  const activityCounts = useMemo(() => {
    const scored = submissionsFeed.filter((s) => s.score != null && s.score !== '')
    const pending = submissionsFeed.filter((s) => !(s.score != null && s.score !== ''))
    return { total: submissionsFeed.length, graded: scored.length, pending: pending.length }
  }, [submissionsFeed])

  const filteredActivity = useMemo(() => {
    const q = activityQuery.trim().toLowerCase()
    return (submissionsFeed ?? []).filter((row) => {
      const isScored = row.score != null && row.score !== ''
      if (activityStatus === 'graded' && !isScored) return false
      if (activityStatus === 'pending' && isScored) return false
      if (!q) return true
      const hay = `${row.student_name ?? ''} ${row.task_title ?? ''} ${row.id ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [activityQuery, activityStatus, submissionsFeed])

  const filteredUsers = useMemo(() => {
    const q = usersSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => `${u.full_name ?? ''} ${u.id ?? ''} ${u.role ?? ''}`.toLowerCase().includes(q))
  }, [users, usersSearch])

  const pie = useMemo(() => {
    const rc = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    const keys = Object.keys(rc).length ? Object.keys(rc) : ['—']
    return {
      labels: keys,
      datasets: [
        {
          data: Object.keys(rc).length ? Object.values(rc) : [1],
          backgroundColor: keys.map((k) => ROLE_META[k]?.pie ?? '#94a3b8'),
        },
      ],
    }
  }, [users])

  const lineData = useMemo(
    () => ({
      labels: ['Payments', 'Tasks', 'Submissions', 'Users', 'Registrations', 'Media'],
      datasets: [
        {
          label: 'Overview',
          data: [
            Math.min(paymentCount, 10),
            Math.min(taskCount, 10),
            Math.min(submissionCount, 10),
            Math.min(users.length, 10),
            0,
            0,
          ],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointRadius: 5,
        },
      ],
    }),
    [paymentCount, taskCount, submissionCount, users.length],
  )

  const studentSkillRadar = useMemo(() => {
    if (!skillScores.length) return null
    const avg = skillScores.reduce((a, b) => a + b, 0) / skillScores.length
    return buildSkillRadarFromAvg(avg)
  }, [skillScores])

  const studentSkillBar = useMemo(() => {
    if (!studentSkillRadar) return null
    const ds = studentSkillRadar.datasets?.[0]
    return {
      labels: studentSkillRadar.labels ?? [],
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
  }, [studentSkillRadar])

  const skillStudentLabel = studentUsers.find((u) => String(u.id) === String(skillStudentId))?.full_name ?? 'Student'
  const skillAvgText = skillScores.length
    ? (skillScores.reduce((a, b) => a + b, 0) / skillScores.length).toFixed(1)
    : null

  const [eventsVersion, setEventsVersion] = useState(0)
  const portalEvents = useMemo(() => {
    void eventsVersion
    return listPortalEvents()
  }, [eventsVersion])
  const eventHighlightsAll = useMemo(() => portalEvents.map((e) => e.date), [portalEvents])
  const [eventDraft, setEventDraft] = useState({ title: '', date: '', target: 'all' })

  const overviewNav = (section, hint) => {
    setActiveSection(section)
    if (hint) setToast(hint)
  }

  const navItems = useMemo(() => {
    return NAV_BASE.map((n) => (n.id === 'msg' ? { ...n, badge: unreadCount } : { ...n, badge: undefined }))
  }, [unreadCount])

  return (
    <AppShellLayout
      navItems={navItems}
      activeNavId={activeSection}
      onNavSelect={setActiveSection}
      roleLabel="Administrator"
      pageTitle={SECTION_TITLE[activeSection] ?? 'Admin'}
      breadcrumbLast="Admin"
      messageCount={unreadCount}
      onMessagesClick={() => setActiveSection('msg')}
    >
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      )}

      {activeSection === 'dash' && (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Overview metrics link to each admin area. Use <strong>Skill insights</strong> to review each
            student&apos;s estimated skill profile from their grades.
          </p>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              color="bg-blue-600"
              value={roleCounts.student || 0}
              title="Students"
              icon="🎓"
              animationDelayMs={0}
              subtitle="Registered accounts"
              foot="Open users"
              onMoreInfo={() => overviewNav('users', 'Users & roles — filter by student.')}
            />
            <MetricCard
              color="bg-green-600"
              value={(roleCounts.admin || 0) + (roleCounts.finance || 0) || 0}
              title="Staff"
              icon="👔"
              animationDelayMs={70}
              subtitle="Admin + finance"
              foot="Manage roles"
              onMoreInfo={() => overviewNav('users', 'Assign roles to staff accounts.')}
            />
            <MetricCard
              color="bg-teal-500"
              value={roleCounts.parent || 0}
              title="Parents"
              icon="👨‍👩‍👧"
              animationDelayMs={140}
              subtitle="Linked parents"
              foot="View users"
              onMoreInfo={() => overviewNav('users', 'Parent profiles in the users table.')}
            />
            <MetricCard
              color="bg-orange-500"
              value={taskCount}
              title="Tasks"
              icon="📋"
              animationDelayMs={210}
              subtitle="Published assignments"
              foot="Manage tasks"
              onMoreInfo={() => overviewNav('tasks', 'Create or delete coding tasks.')}
            />
            <MetricCard
              color="bg-emerald-700"
              value={submissionCount}
              title="Submissions"
              icon="📤"
              animationDelayMs={280}
              subtitle="All student attempts"
              foot="See activity"
              onMoreInfo={() => overviewNav('activity', 'Recent submissions feed.')}
            />
            <MetricCard
              color="bg-violet-600"
              value={paymentCount}
              title="Payments"
              icon="💳"
              animationDelayMs={350}
              subtitle="Recorded in system"
              foot="Activity log"
              onMoreInfo={() => overviewNav('activity', 'Pair with finance for verification.')}
            />
            <MetricCard
              color="bg-slate-700"
              value={users.length}
              title="Accounts"
              icon="👤"
              animationDelayMs={420}
              subtitle="Total users"
              foot="User directory"
              onMoreInfo={() => overviewNav('users', 'Full user list.')}
            />
            <MetricCard
              color="bg-sky-500"
              value={Math.min(submissionCount, users.length || 1)}
              title="Engagement"
              icon="📈"
              animationDelayMs={490}
              subtitle="Submissions vs users"
              foot="View activity"
              onMoreInfo={() => overviewNav('activity', 'Recent submissions — see engagement in action.')}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold text-slate-800">Event schedule</h3>
              <p className="mb-3 text-xs text-slate-500">
                Publish school events here; students and parents will see highlighted dates in their schedules.
              </p>
              <CalendarWidget title="School events" highlightDates={eventHighlightsAll} />
              <form
                className="mt-4 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 md:grid-cols-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  const created = createPortalEvent({
                    title: eventDraft.title,
                    date: eventDraft.date,
                    target: eventDraft.target,
                    author: 'admin',
                  })
                  if (!created) {
                    setToast('Add a title and valid date for the event.')
                    return
                  }
                  setEventsVersion((v) => v + 1)
                  setEventDraft({ title: '', date: '', target: 'all' })
                  setToast('Event published — it will appear in Student/Parent calendars.')
                }}
              >
                <input
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  placeholder="Event title"
                  value={eventDraft.title}
                  onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))}
                  required
                />
                <input
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  type="date"
                  value={eventDraft.date ? String(eventDraft.date).slice(0, 10) : ''}
                  onChange={(e) => setEventDraft((p) => ({ ...p, date: e.target.value }))}
                  required
                />
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  value={eventDraft.target}
                  onChange={(e) => setEventDraft((p) => ({ ...p, target: e.target.value }))}
                >
                  <option value="all">All (Student + Parent)</option>
                  <option value="student">Students only</option>
                  <option value="parent">Parents only</option>
                </select>
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black md:col-span-3"
                >
                  Publish event
                </button>
              </form>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">Recent events</h4>
                {portalEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">No events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {portalEvents
                      .slice()
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 4)
                      .map((ev) => (
                        <li key={ev.id} className="rounded border border-slate-100 bg-white p-2 text-sm">
                          <p className="font-semibold text-slate-900">{ev.title}</p>
                          <p className="text-xs text-slate-600">
                            {ev.target} · {new Date(ev.date).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">System activity snapshot</h3>
              <p className="mb-2 text-xs text-slate-500">
                Tracks key platform counts (payments, tasks, submissions, and accounts) as a quick health overview.
              </p>
              <div className="h-64">
                <Line
                  data={lineData}
                  options={{
                    ...commonOptions,
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold text-slate-800">Users by role</h3>
              <p className="mb-3 text-xs text-slate-500">Distribution of user accounts across role groups.</p>
              <div className="mx-auto h-64 max-w-sm">
                <Pie data={pie} options={commonOptions} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Landing preview</h3>
              {content.hero_image_url && (
                <img
                  src={content.hero_image_url}
                  alt="Hero"
                  className="mb-3 h-28 w-full rounded object-cover"
                />
              )}
              <p className="text-lg font-bold text-slate-900">{content.hero_title}</p>
              <p className="mt-2 text-sm text-slate-600">{content.hero_text}</p>
              <button
                type="button"
                onClick={() => overviewNav('landing', 'Edit landing in the next section.')}
                className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
              >
                Edit landing content →
              </button>
            </div>
          </div>
        </>
      )}

      {activeSection === 'skills' && (
        <section className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-950">Skill insights by student</h2>
          <p className="mt-1 text-sm text-indigo-900/80">
            Choose a student to see an estimated skill profile derived from <strong>their</strong> graded submissions
            only. Switch students to compare. Scores use submissions loaded for admin (most recent records, up to
            500).
          </p>

          {studentUsers.length === 0 ? (
            <p className="mt-6 text-sm text-indigo-900/70">No student accounts yet — add students under Users & roles.</p>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="flex min-w-[16rem] flex-col gap-1 text-sm font-medium text-indigo-950">
                  Student
                  <input
                    className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-500/30 focus:ring-2"
                    placeholder="Search student…"
                    value={skillStudentQuery}
                    onChange={(e) => setSkillStudentQuery(e.target.value)}
                  />
                  <select
                    value={skillStudentId}
                    onChange={(e) => setSelectedSkillStudentId(e.target.value)}
                    className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-500/30 focus:ring-2"
                  >
                    {skillSelectOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name ?? u.id}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-lg border border-indigo-200/80 bg-white/80 px-4 py-2 text-sm text-indigo-950">
                  <span className="font-semibold">{skillStudentLabel}</span>
                  {skillAvgText != null && (
                    <span className="ml-2 text-indigo-800/90">
                      · avg grade {skillAvgText} ({skillScores.length} graded submission
                      {skillScores.length === 1 ? '' : 's'})
                    </span>
                  )}
                  {skillAvgText == null && <span className="ml-2 text-amber-800">· no graded work yet</span>}
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-lg">
                {studentSkillBar ? (
                  <div className="h-64 rounded-xl border border-indigo-200 bg-white/60 p-2">
                    <Bar
                      data={studentSkillBar}
                      options={{
                        ...commonOptions,
                        plugins: { legend: { display: false } },
                        scales: { y: { min: 0, max: 100, ticks: { stepSize: 25 } } },
                      }}
                    />
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-indigo-200 bg-white/60 py-12 text-center text-sm text-indigo-900/75">
                    No numeric grades for this student yet. Post scores in <strong>Grading</strong> to build a profile.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {activeSection === 'users' && (
        <section className="mb-6 space-y-6" id="users">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Users & roles</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Accounts are grouped by role so you can scan each cohort quickly. Changing a role updates the local row;
              click <strong>Apply</strong> to persist (demo updates immediately; production follows Supabase RLS).
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2"
              placeholder="Search users by name or id…"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
            />
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => setUsersSearch('')}
            >
              Clear
            </button>
          </div>

          <div className="space-y-6">
            {ROLE_ORDER.map((role) => {
              const meta = ROLE_META[role]
              const group = filteredUsers.filter((u) => u.role === role)
              return (
                <div
                  key={role}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-200/60"
                >
                  <div className={`bg-gradient-to-r px-5 py-4 text-white shadow-inner ${meta.header}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{meta.label}</h3>
                        <p className="text-sm text-white/90">{meta.description}</p>
                      </div>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold tabular-nums">
                        {group.length}
                      </span>
                    </div>
                  </div>

                  {group.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-500">No accounts in this group yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {group.map((u) => (
                        <li
                          key={u.id}
                          className={`flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-center sm:justify-between ${meta.row}`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${meta.dot}`}
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{u.full_name}</p>
                              <p className="truncate text-xs text-slate-500">{u.id}</p>
                            </div>
                            <span
                              className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide sm:inline ${meta.chip}`}
                            >
                              {meta.singular}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <label className="sr-only" htmlFor={`role-${u.id}`}>
                              Role for {u.full_name}
                            </label>
                            <select
                              id={`role-${u.id}`}
                              className="min-w-[9rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none ring-sky-500/25 focus:ring-2"
                              value={u.role}
                              onChange={(e) => {
                                const nextRole = e.target.value
                                setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)))
                              }}
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_META[r]?.singular ?? r}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                              style={{ backgroundColor: 'var(--app-brand)' }}
                              onClick={() => updateUserRole(u.id, u.role)}
                            >
                              Apply
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          {filteredUsers.some((u) => !ROLE_ORDER.includes(u.role)) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <strong>Other roles:</strong>{' '}
              {filteredUsers
                .filter((u) => !ROLE_ORDER.includes(u.role))
                .map((u) => u.full_name)
                .join(', ')}
            </div>
          )}
        </section>
      )}

      {activeSection === 'tasks' && (
      <section className="mb-6 rounded border border-slate-200 bg-white p-4 shadow-sm" id="tasks">
        <h2 className="mb-2 text-lg font-semibold">Create & manage coding tasks</h2>
        <form className="mb-6 grid gap-2 md:grid-cols-3" onSubmit={createTask}>
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            required
          />
          <input
            className="rounded border border-slate-300 p-2"
            type="datetime-local"
            value={taskForm.deadline}
            onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
            required
          />
          <button type="submit" className="rounded bg-indigo-600 px-3 py-2 text-white md:col-span-3">
            Create task
          </button>
        </form>
        <h3 className="mb-2 font-medium text-slate-800">Published tasks</h3>
        <ul className="space-y-2 text-sm">
          {tasksList.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 p-2">
              <span>
                <strong>{t.title}</strong>
                <span className="text-slate-600"> — due {new Date(t.deadline).toLocaleString()}</span>
              </span>
              <button
                type="button"
                className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                onClick={() => deleteTask(t.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      )}

      {activeSection === 'grade' && (
      <section className="mb-6 rounded border border-slate-200 bg-white p-4 shadow-sm" id="grading">
        <h2 className="mb-2 text-lg font-semibold">Grades & feedback</h2>
        <p className="mb-4 text-sm text-slate-600">Students and parents see scores and feedback on the dashboards.</p>
        <div className="space-y-4">
          {submissionsFeed.map((row) => {
            const edit = gradeEdits[row.id] ?? {}
            const scoreVal = edit.score !== undefined ? edit.score : row.score ?? ''
            const feedbackVal = edit.feedback !== undefined ? edit.feedback : row.feedback ?? ''
            return (
              <div key={row.id} className="rounded border border-slate-100 p-3">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium">{row.student_name}</span>
                  <span className="text-slate-600">{row.task_title}</span>
                  <span className="text-slate-400">{new Date(row.submitted_at).toLocaleString()}</span>
                </div>
                {row.code_preview && (
                  <pre className="mt-2 max-h-24 overflow-auto rounded bg-slate-50 p-2 text-xs">{row.code_preview}…</pre>
                )}
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="rounded border border-slate-200 p-2 text-sm"
                    placeholder="Score /100"
                    value={scoreVal}
                    onChange={(e) => setGradeField(row.id, 'score', e.target.value)}
                  />
                  <input
                    className="rounded border border-slate-200 p-2 text-sm md:col-span-2"
                    placeholder="Feedback for student"
                    value={feedbackVal}
                    onChange={(e) => setGradeField(row.id, 'feedback', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="mt-2 rounded bg-emerald-600 px-3 py-1.5 text-sm text-white"
                  onClick={() => saveGrade(row)}
                >
                  Save grade
                </button>
              </div>
            )
          })}
          {submissionsFeed.length === 0 && (
            <p className="text-sm text-slate-500">No submissions yet.</p>
          )}
        </div>
      </section>
      )}

      {activeSection === 'landing' && (
      <section className="mb-6 rounded border border-slate-200 bg-white p-4 shadow-sm" id="landing">
        <h2 className="mb-2 text-lg font-semibold">Landing page content</h2>
        <p className="mb-4 text-sm text-slate-600">Text and hero images (use public paths like /media/hero.jpg or full URLs).</p>
        <form onSubmit={saveContent} className="space-y-3">
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Hero title"
            value={content.hero_title ?? ''}
            onChange={(e) => setContent((p) => ({ ...p, hero_title: e.target.value }))}
          />
          <textarea
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Hero text"
            value={content.hero_text ?? ''}
            onChange={(e) => setContent((p) => ({ ...p, hero_text: e.target.value }))}
          />
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Hero image URL (primary)"
            value={content.hero_image_url ?? ''}
            onChange={(e) => setContent((p) => ({ ...p, hero_image_url: e.target.value }))}
          />
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Secondary image URL (optional)"
            value={content.hero_image_url_secondary ?? ''}
            onChange={(e) => setContent((p) => ({ ...p, hero_image_url_secondary: e.target.value }))}
          />
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
            Save landing content
          </button>
        </form>
      </section>
      )}

      {activeSection === 'activity' && (
      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm" id="activity">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Activity & submissions</h2>
            <p className="mt-1 text-sm text-slate-600">
              Search recent submissions by student or task, then jump into Grading to review scores.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2 lg:w-64"
              placeholder="Search student or task…"
              value={activityQuery}
              onChange={(e) => setActivityQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2"
              value={activityStatus}
              onChange={(e) => setActivityStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="graded">Graded only</option>
              <option value="pending">Pending only</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MetricCard
            color="bg-slate-700"
            value={activityCounts.total}
            title="Total"
            icon="📤"
            animationDelayMs={0}
            foot="Latest submissions"
          />
          <MetricCard
            color="bg-emerald-600"
            value={activityCounts.graded}
            title="Graded"
            icon="✅"
            animationDelayMs={70}
            foot="Has a score"
          />
          <MetricCard
            color="bg-amber-500"
            value={activityCounts.pending}
            title="Pending"
            icon="⏳"
            animationDelayMs={140}
            foot="Awaiting grading"
          />
        </div>

        <div className="mt-4 max-h-64 overflow-auto text-sm">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 text-slate-600">
              <tr>
                <th className="py-2">When</th>
                <th className="py-2">Student</th>
                <th className="py-2">Task</th>
                <th className="py-2">Score</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivity.map((row) => {
                const scored = row.score != null && row.score !== ''
                return (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-2 whitespace-nowrap">{new Date(row.submitted_at).toLocaleString()}</td>
                    <td className="py-2">{row.student_name}</td>
                    <td className="py-2">{row.task_title}</td>
                    <td className="py-2">
                      {scored ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                          {Number(row.score).toFixed(0)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                        onClick={() => overviewNav('grade', 'Opened grading from activity feed.')}
                      >
                        Open grading
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredActivity.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-sm text-slate-500" colSpan={5}>
                    No submissions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeSection === 'msg' && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create announcements for all users or a selected role. Only admin can create messages.
          </p>
          <form
            className="mt-4 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              const created = createPortalMessage({
                title: msgDraft.title,
                body: msgDraft.body,
                target: msgDraft.target,
                author: 'admin',
              })
              if (!created) {
                setToast('Please add both title and message body.')
                return
              }
              setMsgVersion((v) => v + 1)
              setMsgDraft({ title: '', body: '', target: msgDraft.target })
              setToast('Message published.')
            }}
          >
            <input
              className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:ring-2"
              placeholder="Message title"
              value={msgDraft.title}
              onChange={(e) => setMsgDraft((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <select
              className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:ring-2"
              value={msgDraft.target}
              onChange={(e) => setMsgDraft((p) => ({ ...p, target: e.target.value }))}
            >
              <option value="all">All users</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="finance">Finance</option>
              <option value="admin">Admins</option>
            </select>
            <textarea
              className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:ring-2 md:col-span-2"
              rows={3}
              placeholder="Write announcement..."
              value={msgDraft.body}
              onChange={(e) => setMsgDraft((p) => ({ ...p, body: e.target.value }))}
              required
            />
            <div className="md:col-span-2">
              <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                Publish message
              </button>
            </div>
          </form>
          <div
            className={`mt-4 rounded-xl border p-4 transition ${
              adminMsgRead
                ? 'border-slate-200 bg-slate-50'
                : 'border-violet-200 bg-violet-50/80 ring-2 ring-violet-200/50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">System</p>
                <p className="font-semibold text-slate-900">Weekly review</p>
                <p className="mt-2 text-sm text-slate-700">
                  Check Users & roles for new accounts, then review Grading for pending scores.
                </p>
              </div>
              {!adminMsgRead && (
                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">New</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => markRead()}
              className="mt-3 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              {adminMsgRead ? 'Marked as read' : 'Mark as read'}
            </button>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">Recent published messages</h3>
            <div className="mt-2 space-y-2">
              {portalMsgs.slice(0, 8).map((m) => (
                <article key={m.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {m.target} · {new Date(m.created_at).toLocaleString()}
                  </p>
                  <p className="font-semibold text-slate-900">{m.title}</p>
                  <p className="text-sm text-slate-700">{m.body}</p>
                </article>
              ))}
              {portalMsgs.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
            </div>
          </div>
        </section>
      )}
    </AppShellLayout>
  )
}
