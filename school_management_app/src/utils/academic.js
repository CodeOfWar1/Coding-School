/** @param {object} s */
export function submissionTime(s) {
  if (!s) return 0
  const t = s.submitted_at || s.created_at
  return t ? new Date(t).getTime() : 0
}

/**
 * Latest submission per task (by submitted_at / created_at).
 * @param {number|string} taskId
 * @param {object[]} submissions
 */
export function latestSubmissionForTask(taskId, submissions) {
  const list = (submissions ?? []).filter((x) => String(x.task_id) === String(taskId))
  if (!list.length) return null
  return [...list].sort((a, b) => submissionTime(b) - submissionTime(a))[0]
}

/**
 * @param {object[]} tasks
 * @param {object[]} submissions
 */
export function completionPercent(tasks, submissions) {
  const total = tasks?.length ?? 0
  if (!total) return 0
  const done = new Set((submissions ?? []).map((s) => s.task_id).filter(Boolean)).size
  return Math.round((done / total) * 1000) / 10
}

/**
 * @param {'pending'|'submitted'|'graded'} status
 */
export function taskStatus(_task, latestSub) {
  if (!latestSub) return 'pending'
  const hasFeedback = latestSub.feedback != null && String(latestSub.feedback).trim() !== ''
  const hasScore = latestSub.score != null && latestSub.score !== ''
  if (hasFeedback || hasScore) return 'graded'
  return 'submitted'
}

/**
 * Radar chart config for “skill balance” (parent/admin view), derived from average score.
 * @param {number} avg — average grade 0–100
 */
export function buildSkillRadarFromAvg(avg) {
  const base = Math.min(100, Math.max(35, Number(avg) || 70))
  return {
    labels: ['Logic', 'Debugging', 'Style', 'Speed', 'Tests'],
    datasets: [
      {
        label: 'Skill profile',
        data: [
          Math.round(base * 0.95),
          Math.round(base * 0.88),
          Math.round(base * 0.92),
          Math.round(base * 0.85),
          Math.round(base * 0.9),
        ],
        backgroundColor: 'rgba(37, 99, 235, 0.22)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
      },
    ],
  }
}
