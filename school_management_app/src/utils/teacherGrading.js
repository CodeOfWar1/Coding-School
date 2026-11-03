/**
 * Points + pass/fail: pass when score >= pass_threshold (absolute points).
 * @param {number|null|undefined} score
 * @param {number} pointsMax
 * @param {number} passThreshold
 * @returns {'pass'|'fail'|null}
 */
export function computePassFail(score, pointsMax, passThreshold) {
  if (score == null || Number.isNaN(Number(score))) return null
  const max = Number(pointsMax) || 100
  const threshold = Number(passThreshold)
  const effectiveThreshold =
    threshold > 0 && threshold <= max ? threshold : Math.round(max * 0.6)
  return Number(score) >= effectiveThreshold ? 'pass' : 'fail'
}

export function clampScore(score, pointsMax) {
  const max = Number(pointsMax) || 100
  const n = Number(score)
  if (Number.isNaN(n)) return null
  return Math.min(max, Math.max(0, n))
}

export function passFailLabel(passFail) {
  if (passFail === 'pass') return 'Pass'
  if (passFail === 'fail') return 'Fail'
  return '—'
}
