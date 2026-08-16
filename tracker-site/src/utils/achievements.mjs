export const XP_PER_ASSIGNMENT = 40

const asScore = (value) => {
  const score = Number(value)
  return Number.isFinite(score) && score > 0 ? score : 0
}

export function getMaxScore(students = [], assignmentCount = 0) {
  let observedMaximum = 0
  students.forEach((student) => {
    for (let index = 1; index <= assignmentCount; index += 1) observedMaximum = Math.max(observedMaximum, asScore(student[`hw${index}`]))
  })
  return Math.max(4, observedMaximum)
}

export function scoreToXp(score, maxScore = 4) {
  if (!maxScore || asScore(score) === 0) return 0
  return Math.round(Math.min(asScore(score), maxScore) / maxScore * XP_PER_ASSIGNMENT)
}

export function getStudentStats(student, assignmentCount, maxScore = 4) {
  const scores = Array.from({ length: assignmentCount }, (_, index) => asScore(student[`hw${index + 1}`]))
  const completed = scores.filter((score) => score > 0).length
  const stars = scores.filter((score) => score >= maxScore).length
  const xp = scores.reduce((total, score) => total + scoreToXp(score, maxScore), 0)
  const maxXp = assignmentCount * XP_PER_ASSIGNMENT
  const progress = maxXp ? Math.round(xp / maxXp * 100) : 0
  const level = completed === 0 ? 'New Student' : progress < 40 ? 'Bronze' : progress < 80 ? 'Silver' : 'Gold'
  const perfectStreak = scores.some((_, start) => scores.slice(start, start + 5).length === 5 && scores.slice(start, start + 5).every((score) => score > 0))
  return { scores, completed, stars, xp, maxXp, progress, level, perfectStreak }
}

function timestampToMillis(value) {
  if (!value) return null
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  if (value instanceof Date) return value.getTime()
  const millis = typeof value === 'number' ? value : Date.parse(value)
  return Number.isFinite(millis) ? millis : null
}

function completionTime(student, assignmentIndex) {
  const key = `hw${assignmentIndex + 1}`
  return timestampToMillis(student.homeworkCompletedAt?.[key] ?? student.scoreUpdatedAt?.[key])
}

export function buildAchievementData(students = [], labels = []) {
  const assignmentCount = labels.length
  const maxScore = getMaxScore(students, assignmentCount)
  const statsById = Object.fromEntries(students.map((student) => [student.id, getStudentStats(student, assignmentCount, maxScore)]))
  const totalCompleted = Object.values(statsById).reduce((sum, stats) => sum + stats.completed, 0)
  const totalStars = Object.values(statsById).reduce((sum, stats) => sum + stats.stars, 0)
  const possible = students.length * assignmentCount
  const groupProgress = possible ? Math.round(totalCompleted / possible * 100) : 0

  const ranked = [...students].sort((left, right) => {
    const a = statsById[left.id]
    const b = statsById[right.id]
    return b.xp - a.xp || b.stars - a.stars || b.completed - a.completed || String(left.name || left.id).localeCompare(String(right.name || right.id))
  })
  const currentLeader = ranked.length && statsById[ranked[0].id].xp > 0 ? (ranked[0].name || ranked[0].id) : 'No scores yet'
  const top = ranked[0] ? statsById[ranked[0].id] : null
  const studentOfMonthIds = new Set(top && top.xp > 0 ? ranked.filter((student) => {
    const stats = statsById[student.id]
    return stats.xp === top.xp && stats.stars === top.stars && stats.completed === top.completed
  }).map((student) => student.id) : [])

  let currentAssignment = -1
  for (let index = 0; index < assignmentCount; index += 1) {
    if (students.some((student) => asScore(student[`hw${index + 1}`]) > 0)) currentAssignment = index
  }
  let fastFinisherId = null
  if (currentAssignment >= 0) {
    const finishers = students.map((student) => ({ id: student.id, time: completionTime(student, currentAssignment) }))
      .filter(({ time }) => time !== null).sort((a, b) => a.time - b.time)
    fastFinisherId = finishers[0]?.id || null
  }

  return { maxScore, statsById, summary: { totalCompleted, totalStars, groupProgress, currentLeader }, studentOfMonthIds, fastFinisherId }
}

export function getRewards(studentId, stats, achievementData) {
  return [
    stats.stars > 0 && { id: 'homework-star', icon: '⭐', label: 'Homework Star', description: 'Earned for a top homework score' },
    achievementData.fastFinisherId === studentId && { id: 'fast-finisher', icon: '⚡', label: 'Fast Finisher', description: 'First to complete the assignment' },
    stats.perfectStreak && { id: 'perfect-streak', icon: '🔥', label: 'Perfect Streak', description: 'Completed five assignments in a row' },
    achievementData.studentOfMonthIds.has(studentId) && { id: 'student-of-month', icon: '🏆', label: 'Student of the Month', description: 'Highest XP this month' },
  ].filter(Boolean)
}
