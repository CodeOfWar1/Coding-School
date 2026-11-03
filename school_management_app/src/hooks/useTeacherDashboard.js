import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { computePassFail, clampScore } from '../utils/teacherGrading'
import { CLASS_SCHEMA as S } from '../lib/classSchema'

export function classDisplayName(row) {
  if (!row) return 'Class'
  return row.name || row.class_name || row.title || row.label || `Class ${String(row.id).slice(0, 8)}`
}

export function useTeacherDashboard(teacherId) {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [pupils, setPupils] = useState([])
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadClasses = useCallback(async () => {
    if (!teacherId) return

    const { data: links, error: linkErr } = await supabase
      .from(S.classTeachers)
      .select('class_id')
      .eq(S.teacherId, teacherId)

    if (linkErr) throw linkErr

    const classIds = (links || []).map((r) => r.class_id).filter(Boolean)
    if (!classIds.length) {
      setClasses([])
      setSelectedClassId(null)
      return
    }

    const { data: classRows, error: classErr } = await supabase
      .from(S.classes)
      .select('*')
      .in('id', classIds)

    if (classErr) throw classErr
    setClasses(classRows || [])
    setSelectedClassId((prev) =>
      prev && classIds.includes(prev) ? prev : classRows?.[0]?.id || null,
    )
  }, [teacherId])

  const loadPupils = useCallback(async (classId) => {
    if (!classId) {
      setPupils([])
      return
    }

    const { data, error: err } = await supabase
      .from(S.classStudents)
      .select(`
        *,
        profile:${S.studentUserId} (id, email, first_name, last_name, full_name)
      `)
      .eq(S.classId, classId)
      .order('created_at', { ascending: false })

    if (err) throw err
    setPupils(data || [])
  }, [])

  const loadTasks = useCallback(async (classId) => {
    if (!classId) {
      setTasks([])
      return
    }

    const { data, error: err } = await supabase
      .from('coding_tasks')
      .select('*')
      .eq(S.classId, classId)
      .order('deadline', { ascending: true })

    if (err) throw err
    setTasks(data || [])
  }, [])

  const loadSubmissions = useCallback(async (classId) => {
    if (!classId) {
      setSubmissions([])
      return
    }

    const { data: classTasks, error: taskErr } = await supabase
      .from('coding_tasks')
      .select('id')
      .eq(S.classId, classId)

    if (taskErr) throw taskErr
    const taskIds = (classTasks || []).map((t) => t.id)
    if (!taskIds.length) {
      setSubmissions([])
      return
    }

    const { data, error: err } = await supabase
      .from('coding_submissions')
      .select(`
        *,
        task:task_id (id, title, points_max, pass_threshold),
        student:student_id (id, email, first_name, last_name, full_name)
      `)
      .in('task_id', taskIds)
      .order('submitted_at', { ascending: false })

    if (err) throw err
    setSubmissions(data || [])
  }, [])

  const refreshAll = useCallback(async () => {
    if (!teacherId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await loadClasses()
    } catch (e) {
      setError(e.message || 'Failed to load teacher dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [teacherId, loadClasses])

  const refreshClassData = useCallback(async () => {
    if (!selectedClassId) return
    try {
      await Promise.all([
        loadPupils(selectedClassId),
        loadTasks(selectedClassId),
        loadSubmissions(selectedClassId),
      ])
    } catch (e) {
      setError(e.message || 'Failed to load class data')
    }
  }, [selectedClassId, loadPupils, loadTasks, loadSubmissions])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(() => {
    refreshClassData()
  }, [refreshClassData])

  const createTask = async (taskForm) => {
    if (!selectedClassId) throw new Error('Select a class first')
    const { error: err } = await supabase.from('coding_tasks').insert({
      class_id: selectedClassId,
      teacher_id: teacherId,
      title: taskForm.title.trim(),
      description: taskForm.description?.trim() || null,
      instructions: taskForm.instructions?.trim() || null,
      deadline: taskForm.deadline || null,
      points_max: Number(taskForm.points_max) || 100,
      pass_threshold: Number(taskForm.pass_threshold) || 60,
      published: !!taskForm.published,
      starter_code: taskForm.starter_code || null,
    })
    if (err) throw err
    await loadTasks(selectedClassId)
  }

  const updateTask = async (taskId, updates) => {
    const { error: err } = await supabase.from('coding_tasks').update(updates).eq('id', taskId)
    if (err) throw err
    await loadTasks(selectedClassId)
  }

  const deleteTask = async (taskId) => {
    const { error: err } = await supabase.from('coding_tasks').delete().eq('id', taskId)
    if (err) throw err
    await loadTasks(selectedClassId)
    await loadSubmissions(selectedClassId)
  }

  const gradeSubmission = async (submissionId, { score, feedback, pointsMax, passThreshold }) => {
    const clamped = clampScore(score, pointsMax)
    const pass_fail = computePassFail(clamped, pointsMax, passThreshold)

    const { error: err } = await supabase
      .from('coding_submissions')
      .update({
        score: clamped,
        pass_fail,
        feedback: feedback?.trim() || null,
        status: 'graded',
        graded_by: teacherId,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (err) throw err
    await loadSubmissions(selectedClassId)
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null

  const stats = {
    classCount: classes.length,
    pupilCount: pupils.length,
    taskCount: tasks.length,
    pendingGrades: submissions.filter((s) => s.status === 'submitted').length,
  }

  return {
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedClass,
    pupils,
    tasks,
    submissions,
    isLoading,
    error,
    stats,
    refreshAll,
    refreshClassData,
    createTask,
    updateTask,
    deleteTask,
    gradeSubmission,
    classDisplayName,
  }
}
