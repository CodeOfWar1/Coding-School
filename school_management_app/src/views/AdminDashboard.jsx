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
import {
  FaBullhorn,
  FaCalendarAlt,
  FaChartBar,
  FaCheckDouble,
  FaClipboardCheck,
  FaCode,
  FaEnvelope,
  FaGraduationCap,
  FaHandshake,
  FaHeading,
  FaImage,
  FaImages,
  FaInbox,
  FaLink,
  FaPaperPlane,
  FaPhone,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaUpload,
  FaUserGraduate,
} from 'react-icons/fa'
import { emptyLandingContent } from '../content/landingSiteDefaults'
import { mergeLandingSiteRow, buildLandingUpsertPayload } from '../utils/landingContentMerge'
import { uploadSiteMediaFile } from '../lib/siteMediaUpload'

const NAV_BASE = [
  { id: 'dash', label: 'Overview', icon: '🏠' },
  { id: 'users', label: 'Users & roles', icon: '👥' },
  { id: 'tasks', label: 'Coding tasks', icon: '📋' },
  { id: 'grade', label: 'Grading', icon: '✅' },
  { id: 'skills', label: 'Skill insights', icon: '🎯' },
  { id: 'landing', label: 'Landing page', icon: '🖼️' },
  { id: 'cmsGallery', label: 'Site gallery', icon: '📷' },
  { id: 'cmsPartners', label: 'Partners', icon: '🤝' },
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
  cmsGallery: 'Site gallery',
  cmsPartners: 'Partners & outreach',
  activity: 'Activity',
  msg: 'Messages',
}

const ROLES = ['student', 'parent', 'finance', 'admin']

function broadcastAccent(target) {
  const t = String(target || 'all').toLowerCase()
  if (t === 'student') return 'border-l-4 border-l-primary bg-gradient-to-r from-[#fff8ef]/90 to-white'
  if (t === 'parent') return 'border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-50/80 to-white'
  if (t === 'finance') return 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/70 to-white'
  if (t === 'admin') return 'border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50/70 to-white'
  return 'border-l-4 border-l-secondary bg-gradient-to-r from-[#f8fbff] to-white'
}

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
  const [content, setContent] = useState(() => emptyLandingContent())
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
      setContent(
        mergeLandingSiteRow({
          hero_title: 'Learn to code with confidence',
          hero_text: 'Build real projects with mentors.',
          hero_image_url: '/media/hero.jpg',
          hero_image_url_secondary: '/media/Logo.png',
        }),
      )
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
    setContent(mergeLandingSiteRow(contentRes.data))
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

  const persistLandingContent = async (e) => {
    e?.preventDefault?.()
    if (isDemoMode) {
      setToast('Demo mode — website content is not saved to the database.')
      return
    }
    const { error } = await supabase.from('landing_content').upsert(buildLandingUpsertPayload(content))
    if (error) {
      setToast(error.message || 'Save failed. Add missing columns in Supabase (see supabase/landing_content_extend.sql).')
      return
    }
    await loadAll()
    setToast('Website content saved.')
  }

  const addGalleryItem = () => {
    setContent((p) => ({
      ...p,
      gallery_items: [...(p.gallery_items || []), { title: 'Photo title', image_url: '' }],
    }))
  }

  const removeGalleryItem = (idx) => {
    setContent((p) => ({
      ...p,
      gallery_items: (p.gallery_items || []).filter((_, i) => i !== idx),
    }))
  }

  const patchGalleryItem = (idx, field, value) => {
    setContent((p) => {
      const items = [...(p.gallery_items || [])]
      items[idx] = { ...items[idx], [field]: value }
      return { ...p, gallery_items: items }
    })
  }

  const addPartnerItem = () => {
    setContent((p) => ({
      ...p,
      partners_items: [...(p.partners_items || []), { name: 'Partner name', logo_url: '', activity_summary: '' }],
    }))
  }

  const removePartnerItem = (idx) => {
    setContent((p) => ({
      ...p,
      partners_items: (p.partners_items || []).filter((_, i) => i !== idx),
    }))
  }

  const patchPartnerItem = (idx, field, value) => {
    setContent((p) => {
      const items = [...(p.partners_items || [])]
      items[idx] = { ...items[idx], [field]: value }
      return { ...p, partners_items: items }
    })
  }

  const uploadGalleryFile = async (idx, fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const r = await uploadSiteMediaFile(file, 'gallery')
    if (r.error) {
      setToast(r.error)
      return
    }
    patchGalleryItem(idx, 'image_url', r.publicUrl)
    setToast('Image uploaded — save to publish on the public site.')
  }

  const uploadPartnerLogo = async (idx, fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const r = await uploadSiteMediaFile(file, 'partners')
    if (r.error) {
      setToast(r.error)
      return
    }
    patchPartnerItem(idx, 'logo_url', r.publicUrl)
    setToast('Logo uploaded — save to publish.')
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
          borderColor: '#2d3f5d',
          backgroundColor: 'rgba(45, 63, 93, 0.08)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#faa853',
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
    const data = ds?.data ?? []
    const len = data.length
    const fills =
      len === 0
        ? []
        : Array.from({ length: len }, (_, i) =>
            i % 2 === 0 ? 'rgba(250, 168, 83, 0.9)' : 'rgba(45, 63, 93, 0.85)',
          )
    return {
      labels: studentSkillRadar.labels ?? [],
      datasets: [
        {
          label: ds?.label ?? 'Skill profile',
          data,
          backgroundColor: fills,
          borderColor: '#2d3f5d',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
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
          <p className="mb-4 text-sm text-gray-600">
            Overview metrics link to each admin area. Use <strong>Skill insights</strong> to review each
            student&apos;s estimated skill profile from their grades.
          </p>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              color="bg-primary"
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
              color="bg-secondary"
              value={paymentCount}
              title="Payments"
              icon="💳"
              animationDelayMs={350}
              subtitle="Recorded in system"
              foot="Activity log"
              onMoreInfo={() => overviewNav('activity', 'Pair with finance for verification.')}
            />
            <MetricCard
              color="bg-[#243652]"
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
            <div className="rounded-xl border border-secondary/10 bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold text-secondary">Event schedule</h3>
              <p className="mb-3 text-xs text-gray-500">
                Publish school events here; students and parents will see highlighted dates in their schedules.
              </p>
              <CalendarWidget title="School events" highlightDates={eventHighlightsAll} />
              <form
                className="mt-4 grid gap-3 rounded-lg border border-secondary/[0.06] bg-[#f8fbff] p-3 md:grid-cols-3"
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
                  className="rounded-lg border border-secondary/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  placeholder="Event title"
                  value={eventDraft.title}
                  onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))}
                  required
                />
                <input
                  className="rounded-lg border border-secondary/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  type="date"
                  value={eventDraft.date ? String(eventDraft.date).slice(0, 10) : ''}
                  onChange={(e) => setEventDraft((p) => ({ ...p, date: e.target.value }))}
                  required
                />
                <select
                  className="rounded-lg border border-secondary/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-2 md:col-span-1"
                  value={eventDraft.target}
                  onChange={(e) => setEventDraft((p) => ({ ...p, target: e.target.value }))}
                >
                  <option value="all">All (Student + Parent)</option>
                  <option value="student">Students only</option>
                  <option value="parent">Parents only</option>
                </select>
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-black md:col-span-3"
                >
                  Publish event
                </button>
              </form>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-secondary">Recent events</h4>
                {portalEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {portalEvents
                      .slice()
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 4)
                      .map((ev) => (
                        <li key={ev.id} className="rounded border border-secondary/[0.06] bg-white p-2 text-sm">
                          <p className="font-semibold text-secondary">{ev.title}</p>
                          <p className="text-xs text-gray-600">
                            {ev.target} · {new Date(ev.date).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-secondary/10 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-secondary">System activity snapshot</h3>
              <p className="mb-2 text-xs text-gray-500">
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
            <div className="rounded-xl border border-secondary/10 bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold text-secondary">Users by role</h3>
              <p className="mb-3 text-xs text-gray-500">Distribution of user accounts across role groups.</p>
              <div className="mx-auto h-64 max-w-sm">
                <Pie data={pie} options={commonOptions} />
              </div>
            </div>
            <div className="rounded-xl border border-secondary/10 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-secondary">Landing preview</h3>
              {content.hero_image_url && (
                <img
                  src={content.hero_image_url}
                  alt="Hero"
                  className="mb-3 h-28 w-full rounded object-cover"
                />
              )}
              <p className="text-lg font-bold text-secondary">{content.hero_title}</p>
              <p className="mt-2 text-sm text-gray-600">{content.hero_text}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => overviewNav('landing', 'Hero, About strip, announcement, contact.')}
                  className="text-sm font-semibold text-secondary hover:text-primary hover:underline"
                >
                  Landing content →
                </button>
                <button
                  type="button"
                  onClick={() => overviewNav('cmsGallery', 'Gallery photos on the home page.')}
                  className="text-sm font-semibold text-secondary hover:text-primary hover:underline"
                >
                  Site gallery →
                </button>
                <button
                  type="button"
                  onClick={() => overviewNav('cmsPartners', 'Partner logos and activities.')}
                  className="text-sm font-semibold text-secondary hover:text-primary hover:underline"
                >
                  Partners CMS →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'skills' && (
        <div className="space-y-8">
          <header className="relative overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.08] via-white to-primary/[0.07] p-6 shadow-xl md:p-8">
            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                  <FaGraduationCap className="text-primary" aria-hidden />
                  Skill analytics
                </p>
                <h2 className="font-heading mt-3 text-3xl font-black tracking-tight text-secondary md:text-4xl">
                  Skill insights by student
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  Choose a student to see an estimated skill profile from{' '}
                  <strong className="text-secondary">their graded submissions only</strong>. Switch students to compare.
                  Data uses the most recent admin-loaded submissions (up to 500).
                </p>
              </div>
            </div>
          </header>

          <section className="portal-section-card border-0 shadow-none ring-0" id="skills">
            {studentUsers.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-secondary/25 bg-[#f8fbff]/80 py-14 text-center text-sm text-secondary/75">
                No student accounts yet — add students under Users & roles.
              </p>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
                  <div className="flex flex-col gap-4 lg:col-span-5">
                    <div className="rounded-3xl border-2 border-secondary/15 bg-gradient-to-br from-white to-[#f8fbff] p-5 shadow-lg md:p-6">
                      <div className="mb-4 flex items-center gap-3 border-b border-secondary/10 pb-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                          <FaSearch className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="font-heading text-sm font-bold text-secondary">Pick a learner</p>
                          <p className="text-xs text-gray-500">Search then select from the list</p>
                        </div>
                      </div>
                      <label className="sr-only" htmlFor="skill-student-search">
                        Search students
                      </label>
                      <input
                        id="skill-student-search"
                        className="portal-input mb-3 shadow-inner"
                        placeholder="Search student…"
                        value={skillStudentQuery}
                        onChange={(e) => setSkillStudentQuery(e.target.value)}
                      />
                      <label className="sr-only" htmlFor="skill-student-select">
                        Student
                      </label>
                      <select
                        id="skill-student-select"
                        value={skillStudentId}
                        onChange={(e) => setSelectedSkillStudentId(e.target.value)}
                        className="portal-input font-heading font-semibold text-secondary"
                      >
                        {skillSelectOptions.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name ?? u.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-[#fff8ef] via-white to-[#f8fbff] p-5 shadow-lg md:p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Snapshot</p>
                      <p className="font-heading mt-2 text-lg font-bold text-secondary">{skillStudentLabel}</p>
                      {skillAvgText != null ? (
                        <p className="mt-2 text-sm text-secondary/85">
                          Avg grade{' '}
                          <span className="rounded-lg bg-primary/20 px-2 py-0.5 font-heading text-xl font-black tabular-nums text-secondary">
                            {skillAvgText}
                          </span>
                          <span className="text-gray-600">
                            {' '}
                            · {skillScores.length} graded submission{skillScores.length === 1 ? '' : 's'}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 font-medium text-amber-800">No graded work yet for this student.</p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    {studentSkillBar ? (
                      <div className="relative h-full min-h-[20rem] overflow-hidden rounded-3xl border-2 border-secondary/20 bg-gradient-to-br from-[#0f172a] via-secondary to-[#1a2542] p-5 shadow-2xl md:p-6">
                        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/25 blur-3xl" aria-hidden />
                        <div className="relative mb-4 flex items-center gap-3">
                          <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/40">
                            Profile bars
                          </span>
                          <span className="text-xs font-medium text-white/70">Alternating navy · amber fills</span>
                        </div>
                        <div className="relative rounded-2xl bg-white p-4 shadow-xl ring-2 ring-white/10">
                          <div className="h-72 md:h-80">
                            <Bar
                              data={studentSkillBar}
                              options={{
                                ...commonOptions,
                                plugins: { legend: { display: false } },
                                scales: {
                                  y: {
                                    min: 0,
                                    max: 100,
                                    ticks: { stepSize: 25, color: '#64748b' },
                                    grid: { color: 'rgba(45,63,93,0.08)' },
                                  },
                                  x: {
                                    ticks: { color: '#475569', font: { size: 11, weight: '600' } },
                                    grid: { display: false },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[20rem] items-center justify-center rounded-3xl border-2 border-dashed border-secondary/25 bg-gradient-to-br from-[#f8fbff] to-white p-8 text-center shadow-inner">
                        <div>
                          <FaChartBar className="mx-auto mb-3 h-12 w-12 text-secondary/20" aria-hidden />
                          <p className="max-w-sm text-sm text-secondary/80">
                            No numeric grades for this student yet. Post scores in <strong>Grading</strong> to build a
                            profile.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {activeSection === 'users' && (
        <section className="mb-6 space-y-6" id="users">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-secondary">Users & roles</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Accounts are grouped by role so you can scan each cohort quickly. Changing a role updates the local row;
              click <strong>Apply</strong> to persist (demo updates immediately; production follows Supabase RLS).
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              className="w-full max-w-md rounded-xl border border-secondary/10 bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-sky-500/25 transition focus:ring-2"
              placeholder="Search users by name or id…"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
            />
            <button
              type="button"
              className="rounded-xl border border-secondary/10 bg-white px-4 py-2.5 text-sm font-semibold text-secondary shadow-sm hover:bg-[#f8fbff]"
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
                <div key={role} className={`overflow-hidden rounded-2xl ${meta.card}`}>
                  <div className={`bg-gradient-to-r px-5 py-4 text-white shadow-inner ${meta.header}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight drop-shadow-sm">{meta.label}</h3>
                        <p className="text-sm text-white/92">{meta.description}</p>
                      </div>
                      <span className="rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-sm font-bold tabular-nums backdrop-blur-[2px]">
                        {group.length}
                      </span>
                    </div>
                  </div>

                  {group.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-gray-500">No accounts in this group yet.</p>
                  ) : (
                    <ul className={`divide-y ${meta.divide}`}>
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
                              <p className="truncate font-semibold text-secondary">{u.full_name}</p>
                              <p className="truncate text-xs text-gray-500">{u.id}</p>
                            </div>
                            <span
                              className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-sm ${meta.chip}`}
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
                              className={`min-w-[9rem] rounded-xl border bg-white px-3 py-2 text-sm font-medium text-secondary shadow-sm outline-none transition ${meta.selectRing}`}
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
                              className={`rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition ${meta.applyBtn}`}
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
      <div className="space-y-6" id="tasks">
        <header className="rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-2xl text-primary shadow-lg ring-2 ring-white">
              <FaCode className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black tracking-tight text-secondary md:text-3xl">Coding tasks</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Create assignments with a due date. Students see published tasks on their dashboard and can submit work there.
              </p>
            </div>
          </div>
        </header>

        <form
          className="group relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white shadow-xl"
          onSubmit={createTask}
        >
          <div className="h-1.5 bg-gradient-to-r from-secondary via-[#3d5a8a] to-primary" aria-hidden />
          <div className="border-b border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white px-5 py-4 md:px-6">
            <h3 className="font-heading text-lg font-bold text-secondary md:text-xl">Create &amp; publish</h3>
            <p className="mt-1 text-sm text-gray-600">Fill in the basics below — all fields are required.</p>
          </div>
          <div className="space-y-5 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary/80">
                <span className="mb-1.5 flex items-center gap-2">
                  <FaCode className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Title
                </span>
                <input
                  className="portal-input"
                  placeholder="e.g. FizzBuzz warmup"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary/80 md:col-span-1">
                <span className="mb-1.5 flex items-center gap-2">
                  <FaClipboardCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Description
                </span>
                <input
                  className="portal-input"
                  placeholder="Short summary for students"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary/80">
                <span className="mb-1.5 flex items-center gap-2">
                  <FaCalendarAlt className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Due
                </span>
                <input
                  className="portal-input"
                  type="datetime-local"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
                  required
                />
              </label>
            </div>
            <button type="submit" className="btn-portal-primary inline-flex w-full items-center justify-center gap-2 md:w-auto md:min-w-[13rem]">
              <FaPlus className="h-4 w-4" aria-hidden />
              Create task
            </button>
          </div>
        </form>

        <section className="portal-section-card">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-secondary/10 pb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-secondary md:text-xl">Published tasks</h3>
              <p className="mt-1 text-sm text-gray-600">
                {tasksList.length === 0
                  ? 'No tasks yet — create one above.'
                  : `${tasksList.length} assignment${tasksList.length === 1 ? '' : 's'} live for students.`}
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {tasksList.map((t, idx) => {
              const accent =
                idx % 3 === 0
                  ? 'from-secondary via-[#2d4a73] to-primary'
                  : idx % 3 === 1
                    ? 'from-primary via-amber-400 to-secondary'
                    : 'from-emerald-600 via-teal-600 to-secondary'
              return (
                <li
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl border border-secondary/12 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${accent}`} aria-hidden />
                  <div className="flex flex-wrap items-center justify-between gap-4 pl-5 pr-4 py-4 sm:pl-6">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-secondary">{t.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{t.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-secondary">
                        <FaCalendarAlt className="h-3 w-3 text-primary" aria-hidden />
                        Due {new Date(t.deadline).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                      onClick={() => deleteTask(t.id)}
                    >
                      <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      )}

      {activeSection === 'grade' && (
      <div className="space-y-6">
        <header className="rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-2xl text-primary shadow-lg ring-2 ring-white">
              <FaClipboardCheck className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black tracking-tight text-secondary md:text-3xl">Grades & feedback</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Students and parents see scores and feedback on their dashboards. Save after editing each submission.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-6" id="grading">
        <div className="space-y-6">
          {submissionsFeed.map((row, idx) => {
            const edit = gradeEdits[row.id] ?? {}
            const scoreVal = edit.score !== undefined ? edit.score : row.score ?? ''
            const feedbackVal = edit.feedback !== undefined ? edit.feedback : row.feedback ?? ''
            const hasScore = row.score != null && row.score !== ''
            const initial = (String(row.student_name || '?').trim().slice(0, 1) || '?').toUpperCase()
            const accent =
              idx % 3 === 0
                ? 'from-secondary via-[#2d4a73] to-primary'
                : idx % 3 === 1
                  ? 'from-primary via-amber-400 to-secondary'
                  : 'from-emerald-600 via-teal-600 to-secondary'
            return (
              <div
                key={row.id}
                className={`group relative overflow-hidden rounded-3xl border-2 bg-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl ${
                  hasScore ? 'border-secondary/20' : 'border-primary/35 ring-2 ring-primary/15'
                }`}
              >
                <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${accent}`} aria-hidden />
                <div
                  className={`flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:items-center md:px-6 ${
                    hasScore
                      ? 'border-secondary/10 bg-gradient-to-r from-[#f8fbff] to-white'
                      : 'border-primary/15 bg-gradient-to-r from-[#fff8ef] to-white'
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4 pl-1">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-md ring-2 ring-white ${
                        hasScore ? 'bg-gradient-to-br from-secondary to-[#1a2542]' : 'bg-gradient-to-br from-primary to-[#e89235] text-secondary'
                      }`}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-heading text-lg font-bold text-secondary">
                        <FaUserGraduate className="hidden h-4 w-4 text-primary sm:inline" aria-hidden />
                        {row.student_name}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-600">{row.task_title}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-secondary/10 bg-white px-3 py-1 text-xs tabular-nums text-gray-500 shadow-sm">
                    {new Date(row.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-5 md:px-6 md:py-6">
                  {row.code_preview && (
                    <pre className="mb-5 max-h-32 overflow-auto rounded-2xl border border-secondary/10 bg-[#0f172a] p-4 font-mono text-xs leading-relaxed text-slate-100">
                      {row.code_preview}…
                    </pre>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-secondary/70">
                      Score /100
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="portal-input mt-2 tabular-nums shadow-inner"
                        placeholder="0–100"
                        value={scoreVal}
                        onChange={(e) => setGradeField(row.id, 'score', e.target.value)}
                      />
                    </label>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-secondary/70 md:col-span-2">
                      Feedback for student
                      <textarea
                        className="portal-input mt-2 min-h-[5rem] resize-y shadow-inner"
                        placeholder="Encouragement and next steps…"
                        rows={3}
                        value={feedbackVal}
                        onChange={(e) => setGradeField(row.id, 'feedback', e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn-portal-secondary mt-5 inline-flex items-center gap-2 px-8 py-3 text-sm font-bold shadow-lg"
                    onClick={() => saveGrade(row)}
                  >
                    <FaClipboardCheck className="h-4 w-4" aria-hidden />
                    Save grade
                  </button>
                </div>
              </div>
            )
          })}
          {submissionsFeed.length === 0 && (
            <p className="rounded-3xl border border-dashed border-secondary/25 bg-[#f8fbff]/60 py-14 text-center text-sm text-gray-500">
              No submissions yet.
            </p>
          )}
        </div>
        </section>
      </div>
      )}

      {activeSection === 'landing' && (
      <div className="space-y-6">
        <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-[#fff8ef]/80 via-white to-[#f8fbff] p-6 shadow-lg md:p-7">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#e89235] text-secondary shadow-lg ring-2 ring-white">
              <FaHeading className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black text-secondary md:text-3xl">Landing page content</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Hero, announcement bar, About strip, and contact lines shown on the marketing site. Gallery and partner logos
                have their own admin sections. Use{' '}
                <code className="rounded-md bg-secondary/10 px-2 py-0.5 font-mono text-xs text-secondary">/media/...</code>{' '}
                paths or full URLs; optional uploads use Supabase Storage bucket{' '}
                <code className="rounded-md bg-secondary/10 px-2 py-0.5 font-mono text-xs text-secondary">site-media</code>.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white p-6 shadow-xl md:p-8" id="landing">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
            <form onSubmit={persistLandingContent} className="relative space-y-5 pt-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                <span className="mb-2 flex items-center gap-2">
                  <FaHeading className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Hero title
                </span>
                <input
                  className="portal-input shadow-inner"
                  placeholder="Learn to code with confidence"
                  value={content.hero_title ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, hero_title: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                <span className="mb-2 flex items-center gap-2">
                  <FaImage className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Hero text
                </span>
                <textarea
                  className="portal-input min-h-[6rem] resize-y shadow-inner"
                  placeholder="Supporting line shown under the headline"
                  value={content.hero_text ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, hero_text: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                <span className="mb-2 flex items-center gap-2">
                  <FaLink className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Hero image URL (primary)
                </span>
                <input
                  className="portal-input font-mono text-sm shadow-inner"
                  placeholder="/media/hero.jpg"
                  value={content.hero_image_url ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, hero_image_url: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                <span className="mb-2 flex items-center gap-2">
                  <FaImage className="h-3.5 w-3.5 text-secondary/50" aria-hidden />
                  Secondary image URL (optional)
                </span>
                <input
                  className="portal-input font-mono text-sm shadow-inner"
                  placeholder="/media/Logo.png"
                  value={content.hero_image_url_secondary ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, hero_image_url_secondary: e.target.value }))}
                />
              </label>

              <div className="border-t border-secondary/10 pt-6">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">Announcement</p>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                  <span className="mb-2 flex items-center gap-2">
                    <FaBullhorn className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Top banner (optional)
                  </span>
                  <input
                    className="portal-input shadow-inner"
                    placeholder="e.g. Open house — Saturday 10am"
                    value={content.announcement_banner ?? ''}
                    onChange={(e) => setContent((p) => ({ ...p, announcement_banner: e.target.value }))}
                  />
                </label>
              </div>

              <div className="border-t border-secondary/10 pt-6">
                <p className="mb-4 font-heading text-sm font-bold text-secondary">About section (home)</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
                    <span className="mb-2 block">Eyebrow label</span>
                    <input
                      className="portal-input shadow-inner"
                      value={content.about_eyebrow ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, about_eyebrow: e.target.value }))}
                    />
                  </label>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
                    <span className="mb-2 block">Heading</span>
                    <input
                      className="portal-input shadow-inner"
                      value={content.about_heading ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, about_heading: e.target.value }))}
                    />
                  </label>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
                    <span className="mb-2 block">Lead paragraph</span>
                    <textarea
                      className="portal-input min-h-[5rem] resize-y shadow-inner"
                      value={content.about_lead ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, about_lead: e.target.value }))}
                    />
                  </label>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
                    <span className="mb-2 flex items-center gap-2">
                      <FaImage className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Side image URL
                    </span>
                    <input
                      className="portal-input font-mono text-sm shadow-inner"
                      placeholder="/media/gallery/..."
                      value={content.about_image_url ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, about_image_url: e.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-secondary/10 pt-6">
                <p className="mb-4 font-heading text-sm font-bold text-secondary">Contact block (display text)</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                    <span className="mb-2 flex items-center gap-2">
                      <FaEnvelope className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Email shown
                    </span>
                    <input
                      className="portal-input font-mono text-sm shadow-inner"
                      value={content.contact_email_display ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, contact_email_display: e.target.value }))}
                    />
                  </label>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                    <span className="mb-2 flex items-center gap-2">
                      <FaPhone className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Phone shown
                    </span>
                    <input
                      className="portal-input font-mono text-sm shadow-inner"
                      placeholder="+260 ..."
                      value={content.contact_phone_display ?? ''}
                      onChange={(e) => setContent((p) => ({ ...p, contact_phone_display: e.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-portal-primary mt-2 inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold shadow-lg">
                Save landing content
              </button>
            </form>
          </section>

          <aside className="sticky top-6 rounded-3xl border-2 border-dashed border-secondary/20 bg-gradient-to-b from-[#f8fbff] to-white p-6 shadow-inner md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/50">Live preview</p>
            <h3 className="font-heading mt-2 text-lg font-bold text-secondary">Marketing hero</h3>
            {content.hero_image_url ? (
              <img src={content.hero_image_url} alt="" className="mt-4 h-36 w-full rounded-2xl border border-secondary/10 object-cover shadow-md" />
            ) : (
              <div className="mt-4 flex h-36 items-center justify-center rounded-2xl border border-dashed border-secondary/20 bg-white text-sm text-gray-400">
                Add a primary image URL
              </div>
            )}
            <p className="font-heading mt-5 text-2xl font-black leading-tight text-secondary">{content.hero_title || 'Your headline'}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{content.hero_text || 'Supporting copy appears here.'}</p>
            {content.hero_image_url_secondary ? (
              <img
                src={content.hero_image_url_secondary}
                alt=""
                className="mt-6 mx-auto max-h-24 object-contain opacity-90"
              />
            ) : null}
          </aside>
        </div>
      </div>
      )}

      {activeSection === 'cmsGallery' && (
      <div className="space-y-6">
        <header className="rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-2xl text-primary shadow-lg ring-2 ring-white">
              <FaImages className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black tracking-tight text-secondary md:text-3xl">Site gallery</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Controls the &quot;Moments&quot; grid on the home page (same content family as the full Gallery page). Add image URLs or
                upload to Supabase Storage bucket <code className="rounded bg-secondary/10 px-1.5 py-0.5 font-mono text-xs">site-media</code>.
              </p>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white p-6 shadow-xl md:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-[#3d5a8a] to-primary" aria-hidden />
          <div className="grid gap-4 pt-2 md:grid-cols-3">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
              Eyebrow
              <input
                className="portal-input mt-1.5"
                value={content.gallery_eyebrow ?? ''}
                onChange={(e) => setContent((p) => ({ ...p, gallery_eyebrow: e.target.value }))}
              />
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
              Heading
              <input
                className="portal-input mt-1.5"
                value={content.gallery_heading ?? ''}
                onChange={(e) => setContent((p) => ({ ...p, gallery_heading: e.target.value }))}
              />
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-3">
              Subtitle
              <textarea
                className="portal-input mt-1.5 min-h-[4rem] resize-y"
                value={content.gallery_subtitle ?? ''}
                onChange={(e) => setContent((p) => ({ ...p, gallery_subtitle: e.target.value }))}
              />
            </label>
          </div>

          <div className="mt-8 space-y-4">
            <p className="font-heading text-sm font-bold text-secondary">Photos</p>
            {(content.gallery_items || []).map((item, idx) => (
              <div
                key={`gal-${idx}`}
                className="flex flex-col gap-3 rounded-2xl border border-secondary/12 bg-[#f8fbff]/40 p-4 md:flex-row md:items-end"
              >
                <label className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                  Title
                  <input
                    className="portal-input mt-1.5"
                    value={item.title}
                    onChange={(e) => patchGalleryItem(idx, 'title', e.target.value)}
                  />
                </label>
                <label className="min-w-0 flex-[2] text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                  Image URL
                  <input
                    className="portal-input mt-1.5 font-mono text-sm"
                    placeholder="/media/gallery/photo.jpeg"
                    value={item.image_url}
                    onChange={(e) => patchGalleryItem(idx, 'image_url', e.target.value)}
                  />
                </label>
                <div className="flex flex-wrap gap-2 md:pb-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-secondary/15 bg-white px-4 py-2 text-xs font-bold text-secondary shadow-sm hover:bg-[#f8fbff]">
                    <FaUpload className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        uploadGalleryFile(idx, e.target.files)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                    onClick={() => removeGalleryItem(idx)}
                  >
                    <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
                {item.image_url ? (
                  <div className="md:w-28 shrink-0">
                    <img src={item.image_url} alt="" className="h-20 w-full rounded-lg border border-secondary/10 object-cover md:h-24" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-portal-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold" onClick={addGalleryItem}>
              <FaPlus className="h-4 w-4" aria-hidden />
              Add photo
            </button>
            <button type="button" className="btn-portal-primary inline-flex items-center gap-2 px-8 py-3 text-sm font-bold shadow-lg" onClick={persistLandingContent}>
              Save gallery
            </button>
          </div>
        </section>
      </div>
      )}

      {activeSection === 'cmsPartners' && (
      <div className="space-y-6">
        <header className="rounded-3xl border border-secondary/12 bg-gradient-to-r from-white via-[#f8fbff] to-[#fff8ef]/60 p-6 shadow-lg md:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#1a2542] text-2xl text-primary shadow-lg ring-2 ring-white">
              <FaHandshake className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black tracking-tight text-secondary md:text-3xl">Partners &amp; outreach</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Logos on the home partners strip and on <strong className="text-secondary">/partners</strong>. Activity text appears only on the full partners page (cards below logos).
              </p>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border-2 border-secondary/15 bg-white p-6 shadow-xl md:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-amber-400 to-secondary" aria-hidden />
          <div className="space-y-4 pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
              Intro (both placements)
              <textarea
                className="portal-input mt-1.5 min-h-[4rem] resize-y"
                value={content.partners_intro ?? ''}
                onChange={(e) => setContent((p) => ({ ...p, partners_intro: e.target.value }))}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                Partners page title (hero)
                <input
                  className="portal-input mt-1.5"
                  value={content.partners_page_title ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, partners_page_title: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65 md:col-span-2">
                Partners page subtitle
                <textarea
                  className="portal-input mt-1.5 min-h-[3.5rem] resize-y"
                  value={content.partners_page_subtitle ?? ''}
                  onChange={(e) => setContent((p) => ({ ...p, partners_page_subtitle: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="font-heading text-sm font-bold text-secondary">Partner entries</p>
            {(content.partners_items || []).map((item, idx) => (
              <div key={`par-${idx}`} className="rounded-2xl border border-secondary/12 bg-[#f8fbff]/40 p-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                    Name
                    <input
                      className="portal-input mt-1.5"
                      value={item.name}
                      onChange={(e) => patchPartnerItem(idx, 'name', e.target.value)}
                    />
                  </label>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                    Logo URL
                    <input
                      className="portal-input mt-1.5 font-mono text-sm"
                      placeholder="/media/partner logos/logo.png"
                      value={item.logo_url ?? ''}
                      onChange={(e) => patchPartnerItem(idx, 'logo_url', e.target.value)}
                    />
                  </label>
                </div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary/65">
                  Activity / collaboration (shown on /partners)
                  <textarea
                    className="portal-input mt-1.5 min-h-[4rem] resize-y"
                    placeholder="Short paragraph about joint programs or workshops."
                    value={item.activity_summary ?? ''}
                    onChange={(e) => patchPartnerItem(idx, 'activity_summary', e.target.value)}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-secondary/15 bg-white px-4 py-2 text-xs font-bold text-secondary shadow-sm hover:bg-[#f8fbff]">
                    <FaUpload className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Upload logo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        uploadPartnerLogo(idx, e.target.files)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                    onClick={() => removePartnerItem(idx)}
                  >
                    <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                    Remove partner
                  </button>
                  {item.logo_url ? (
                    <img src={item.logo_url} alt="" className="ml-auto h-14 max-w-[10rem] object-contain" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-portal-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold" onClick={addPartnerItem}>
              <FaPlus className="h-4 w-4" aria-hidden />
              Add partner
            </button>
            <button type="button" className="btn-portal-primary inline-flex items-center gap-2 px-8 py-3 text-sm font-bold shadow-lg" onClick={persistLandingContent}>
              Save partners
            </button>
          </div>
        </section>
      </div>
      )}

      {activeSection === 'activity' && (
      <div className="space-y-8">
        <header className="relative overflow-hidden rounded-3xl border border-secondary/12 bg-white p-6 shadow-xl md:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/10" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Pipeline</p>
              <h2 className="font-heading mt-2 text-2xl font-black text-secondary md:text-3xl">Activity & submissions</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Search recent submissions by student or task, filter by grading state, then jump into Grading.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:max-w-md">
              <label className="relative flex-1 min-w-[12rem]">
                <span className="sr-only">Search</span>
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/35" aria-hidden />
                <input
                  className="portal-input w-full pl-10 shadow-md shadow-secondary/[0.04]"
                  placeholder="Search student or task…"
                  value={activityQuery}
                  onChange={(e) => setActivityQuery(e.target.value)}
                />
              </label>
              <select
                className="portal-input min-w-[11rem] font-heading font-semibold shadow-md shadow-secondary/[0.04]"
                value={activityStatus}
                onChange={(e) => setActivityStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="graded">Graded only</option>
                <option value="pending">Pending only</option>
              </select>
            </div>
          </div>
        </header>

        <section className="space-y-6" id="activity">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl border-2 border-secondary/20 bg-gradient-to-br from-white to-[#f8fbff] p-5 shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-secondary" aria-hidden />
            <p className="font-heading text-4xl font-black tabular-nums text-secondary">{activityCounts.total}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Total</p>
            <p className="mt-4 text-xs text-gray-500">Latest submissions</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" aria-hidden />
            <p className="font-heading text-4xl font-black tabular-nums text-emerald-900">{activityCounts.graded}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-800">Graded</p>
            <p className="mt-4 text-xs text-gray-500">Has a score</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/35 bg-gradient-to-br from-[#fff8ef] to-white p-5 shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden />
            <p className="font-heading text-4xl font-black tabular-nums text-secondary">{activityCounts.pending}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-900">Pending</p>
            <p className="mt-4 text-xs text-gray-500">Awaiting grading</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-secondary/12 bg-white shadow-xl shadow-secondary/[0.06]">
          <div className="flex flex-wrap items-center gap-2 border-b border-secondary/10 bg-gradient-to-r from-secondary/[0.06] to-transparent px-4 py-3 md:px-5">
            <span className="font-heading text-sm font-bold text-secondary">Submission log</span>
            <span className="ml-auto rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
              {filteredActivity.length} rows
            </span>
          </div>
          <div className="max-h-[26rem] overflow-auto text-sm">
            <table className="w-full min-w-[32rem] text-left">
              <thead className="portal-table-head sticky top-0 z-10 text-xs font-bold uppercase tracking-wider text-secondary">
                <tr>
                  <th className="px-4 py-3.5">When</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Task</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/[0.07] bg-white">
              {filteredActivity.map((row, ridx) => {
                const scored = row.score != null && row.score !== ''
                return (
                  <tr
                    key={row.id}
                    className={`transition ${
                      ridx % 2 === 0 ? 'bg-white' : 'bg-[#f8fbff]/35'
                    } hover:bg-primary/[0.05]`}
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{new Date(row.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-heading font-semibold text-secondary">{row.student_name}</td>
                    <td className="px-4 py-3.5 text-gray-700">{row.task_title}</td>
                    <td className="px-4 py-3.5">
                      {scored ? (
                        <span className="inline-flex min-w-[2.25rem] justify-center rounded-full border border-secondary/15 bg-gradient-to-b from-[#f8fbff] to-white px-2.5 py-1 text-xs font-bold tabular-nums text-secondary shadow-sm">
                          {Number(row.score).toFixed(0)}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-primary/35 bg-[#fff8ef] px-2.5 py-1 text-xs font-bold text-amber-950">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-secondary to-[#243652] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:from-[#243652] hover:to-secondary active:scale-[0.98]"
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
                  <td className="py-14 text-center text-sm text-gray-500" colSpan={5}>
                    No submissions match your filters.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
        </section>
      </div>
      )}

      {activeSection === 'msg' && (
        <div className="space-y-8">
          <header className="relative overflow-hidden rounded-3xl border border-secondary/12 bg-gradient-to-br from-secondary/[0.06] via-white to-primary/[0.08] p-6 shadow-xl md:p-8">
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                  <FaBullhorn className="text-primary" aria-hidden />
                  Broadcast center
                </p>
                <h2 className="font-heading mt-3 text-3xl font-black text-secondary md:text-4xl">Messages</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  Publish announcements for everyone or a single role. Only administrators can send portal messages.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && !adminMsgRead && (
                  <span className="rounded-2xl border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-bold text-secondary shadow-md">
                    Unread digest
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-2xl border border-secondary/15 bg-white/90 px-4 py-2 text-xs font-bold text-secondary shadow-md">
                  <FaInbox className="text-primary" aria-hidden />
                  {portalMsgs.length} published
                </span>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border-2 border-secondary/12 bg-white p-6 shadow-xl md:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-secondary/10 pb-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-[#1a2542] text-primary shadow-lg">
                <FaPaperPlane className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-secondary">Compose</h3>
                <p className="text-sm text-gray-500">Title, audience, and body — then publish.</p>
              </div>
            </div>
            <form
              className="grid gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#fff8ef]/50 via-white to-[#f8fbff]/40 p-5 md:grid-cols-2 md:p-6"
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
              <label className="block md:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-secondary/70">Message title</span>
                <input
                  className="portal-input mt-2 shadow-inner"
                  placeholder="Weekly review"
                  value={msgDraft.title}
                  onChange={(e) => setMsgDraft((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </label>
              <label className="block md:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-secondary/70">Audience</span>
                <select
                  className="portal-input mt-2 font-heading font-semibold shadow-inner"
                  value={msgDraft.target}
                  onChange={(e) => setMsgDraft((p) => ({ ...p, target: e.target.value }))}
                >
                  <option value="all">All users</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admins</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-secondary/70">Message body</span>
                <textarea
                  className="portal-input mt-2 min-h-[7rem] resize-y shadow-inner"
                  rows={4}
                  placeholder="Write announcement…"
                  value={msgDraft.body}
                  onChange={(e) => setMsgDraft((p) => ({ ...p, body: e.target.value }))}
                  required
                />
              </label>
              <div className="md:col-span-2">
                <button type="submit" className="btn-portal-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-lg">
                  <FaPaperPlane className="h-4 w-4" aria-hidden />
                  Publish message
                </button>
              </div>
            </form>

            <div
              className={`relative mt-8 overflow-hidden rounded-2xl border p-6 shadow-inner ${
                adminMsgRead
                  ? 'border-secondary/15 bg-[#f8fbff]/90'
                  : 'border-primary/35 bg-gradient-to-br from-[#fff8ef] to-white ring-2 ring-primary/20'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" aria-hidden />
              <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    {adminMsgRead ? <FaCheckDouble className="h-5 w-5" aria-hidden /> : <FaEnvelope className="h-5 w-5" aria-hidden />}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">System</p>
                    <p className="font-heading text-lg font-bold text-secondary">Weekly review</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      Check Users & roles for new accounts, then review Grading for pending scores.
                    </p>
                  </div>
                </div>
                {!adminMsgRead && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                    New
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => markRead()}
                className={
                  adminMsgRead
                    ? 'mt-5 rounded-full border-2 border-secondary/20 bg-white px-6 py-2.5 text-sm font-bold text-secondary shadow-sm hover:bg-white'
                    : 'btn-portal-primary mt-5 px-8 py-3 text-sm font-bold shadow-lg'
                }
              >
                <span className="inline-flex items-center gap-2">
                  <FaCheckDouble className="h-4 w-4" aria-hidden />
                  {adminMsgRead ? 'Marked as read' : 'Mark as read'}
                </span>
              </button>
            </div>

            <div className="mt-10">
              <h3 className="font-heading flex items-center gap-2 text-lg font-bold text-secondary">
                <FaInbox className="text-primary" aria-hidden />
                Recent published messages
              </h3>
              <div className="mt-4 space-y-3">
                {portalMsgs.slice(0, 8).map((m) => (
                  <article
                    key={m.id}
                    className={`overflow-hidden rounded-2xl border border-secondary/10 shadow-md transition hover:shadow-lg ${broadcastAccent(m.target)}`}
                  >
                    <div className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary ring-1 ring-secondary/15">
                          {m.target}
                        </span>
                        <time className="text-xs tabular-nums text-gray-500" dateTime={m.created_at}>
                          {new Date(m.created_at).toLocaleString()}
                        </time>
                      </div>
                      <p className="font-heading mt-3 text-base font-bold text-secondary">{m.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">{m.body}</p>
                    </div>
                  </article>
                ))}
                {portalMsgs.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-secondary/20 bg-[#f8fbff]/80 py-12 text-center text-sm text-gray-500">
                    No messages yet — publish one above.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShellLayout>
  )
}
