import React, { useEffect, useMemo, useState } from 'react'
import { subscribeStudents, subscribeHomeworkLabels, subscribeHomeworkLink, DEFAULT_HOMEWORK_LABELS } from '../services/studentsService'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import StudentRow from './StudentRow'
import GroupAchievements from './GroupAchievements'
import { buildAchievementData } from '../utils/achievements.mjs'
import { getMonth } from '../config/months'
import HomeworkArtifact from '../assets/achievement-game/homework-artifact.webp'

export default function TrackerTable({ group, monthId }) {
  const [students, setStudents] = useState(null)
  const [error, setError] = useState(null)
  const [homeworkLabels, setHomeworkLabels] = useState(DEFAULT_HOMEWORK_LABELS)
  const [homeworkLink, setHomeworkLink] = useState('')

  useEffect(() => subscribeStudents(group.id, monthId, (list) => {
    setStudents(list)
    setError(null)
  }, (issue) => {
    console.error('Firestore error', issue)
    setError('Unable to load data. Please try again later.')
  }), [group.id, monthId])

  useEffect(() => {
    setHomeworkLabels(DEFAULT_HOMEWORK_LABELS)
    return subscribeHomeworkLabels(group.id, monthId, setHomeworkLabels, (issue) => console.error('Homework labels error', issue))
  }, [group.id, monthId])

  useEffect(() => {
    setHomeworkLink('')
    return subscribeHomeworkLink(group.id, monthId, setHomeworkLink, (issue) => console.error('Homework link error', issue))
  }, [group.id, monthId])
  const achievementData = useMemo(() => buildAchievementData(students || [], homeworkLabels), [students, homeworkLabels])
  const month = getMonth(monthId)

  if (error) return <ErrorState message={error} />
  if (students === null) return <LoadingState />

  return <>
    <GroupAchievements summary={achievementData.summary} monthName={month.name} />
    <section className="students-section" aria-labelledby="students-title">
      <div className="section-heading students-heading">
        <div><p className="eyebrow">Live scoreboard · {month.name}</p><h2 id="students-title">{group.name}</h2></div>
        <div className="scoreboard-actions">
          {homeworkLink && <a className="homework-link-button" href={homeworkLink} target="_blank" rel="noreferrer">
            <img src={HomeworkArtifact} alt="" aria-hidden="true" />
            <span>Homework is here</span>
          </a>}
          <span className="student-count">{students.length} {students.length === 1 ? 'student' : 'students'}</span>
        </div>
      </div>
      {students.length === 0 ? <div className="empty">No students yet. This group is ready when you are.</div> : <div className="table-wrap" tabIndex="0" aria-label={`${group.name} homework scores; scroll horizontally for more assignments`}>
        <table className="tracker">
          <thead><tr><th className="name-cell">Student</th>{homeworkLabels.map((label, index) => <th key={`${label}-${index}`}>{label}</th>)}</tr></thead>
          <tbody>{students.map((student) => <StudentRow key={student.id} student={student} labels={homeworkLabels} groupId={group.id} achievementData={achievementData} />)}</tbody>
        </table>
      </div>}
    </section>
  </>
}
