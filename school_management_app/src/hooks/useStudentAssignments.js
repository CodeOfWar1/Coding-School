import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CLASS_SCHEMA as S } from '../lib/classSchema'
import { classDisplayName } from './useTeacherDashboard'

export function useStudentAssignments(studentUserId) {
  const [classes, setClasses] = useState([])
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!studentUserId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: memberships, error: memErr } = await supabase
        .from(S.classStudents)
        .select('class_id')
        .eq(S.studentUserId, studentUserId)

      if (memErr) throw memErr

      const classIds = (memberships || []).map((m) => m.class_id).filter(Boolean)
      if (!classIds.length) {
        setClasses([])
        setTasks([])
        setSubmissions([])
        setIsLoading(false)
        return
      }

      const { data: classRows, error: classErr } = await supabase
        .from(S.classes)
        .select('*')
        .in('id', classIds)

      if (classErr) throw classErr
      setClasses(classRows || [])

      const { data: taskRows, error: taskErr } = await supabase
        .from('coding_tasks')
        .select('*')
        .in(S.classId, classIds)
        .eq('published', true)
        .order('deadline', { ascending: true })

      if (taskErr) throw taskErr
      setTasks(taskRows || [])

      const { data: subRows, error: subErr } = await supabase
        .from('coding_submissions')
        .select('*')
        .eq('student_id', studentUserId)
        .order('submitted_at', { ascending: false })

      if (subErr) throw subErr
      setSubmissions(subRows || [])
    } catch (e) {
      setError(e.message || 'Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }, [studentUserId])

  useEffect(() => {
    load()
  }, [load])

  const getSubmissionForTask = useCallback(
    (taskId) => submissions.find((s) => s.task_id === taskId),
    [submissions],
  )

  const submitAssignment = async (taskId, codeBody) => {
    if (!studentUserId) throw new Error('Not signed in')
    const trimmed = String(codeBody ?? '').trim()
    if (!trimmed) throw new Error('Please enter your code before submitting')

    const existing = getSubmissionForTask(taskId)
    if (existing?.status === 'graded') {
      throw new Error('This assignment is already graded. Contact your teacher for a revision.')
    }

    const payload = {
      task_id: taskId,
      student_id: studentUserId,
      code_body: trimmed,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }

    if (existing) {
      const { error: err } = await supabase
        .from('coding_submissions')
        .update({
          code_body: payload.code_body,
          status: 'submitted',
          submitted_at: payload.submitted_at,
          score: null,
          pass_fail: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
        })
        .eq('id', existing.id)
      if (err) throw err
    } else {
      const { error: err } = await supabase.from('coding_submissions').insert(payload)
      if (err) throw err
    }

    await load()
  }

  return {
    classes,
    tasks,
    submissions,
    isLoading,
    error,
    refresh: load,
    getSubmissionForTask,
    submitAssignment,
    classDisplayName,
  }
}
