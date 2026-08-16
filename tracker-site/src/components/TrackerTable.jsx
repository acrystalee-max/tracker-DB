import React, { useEffect, useState } from 'react'
import { subscribeStudents, subscribeHomeworkLabels, DEFAULT_HOMEWORK_LABELS } from '../services/studentsService'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import StudentRow from './StudentRow'

export default function TrackerTable() {
  const [students, setStudents] = useState(null)
  const [error, setError] = useState(null)
  const [homeworkLabels, setHomeworkLabels] = useState(DEFAULT_HOMEWORK_LABELS)

  useEffect(() => {
    const unsub = subscribeStudents((list) => {
      setStudents(list)
      setError(null)
    }, (e) => {
      console.error('Firestore error', e)
      setError('Unable to load data. Please try later.')
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = subscribeHomeworkLabels(setHomeworkLabels, (e) => console.error('Homework labels error', e))
    return () => unsub()
  }, [])

  if (error) return <ErrorState message={error} />
  if (students === null) return <LoadingState />
  if (students.length === 0) return <div className="empty">No students yet.</div>

  return (
    <section className="card students-card">
      <h3 className="card-title">Group Gr1</h3>
      <div className="card-body">
        <div className="table-wrap">
          <table className="tracker">
          <thead>
            <tr>
              <th>Name</th>
              {homeworkLabels.map((label, index) => <th key={index}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <StudentRow key={s.id} student={s} labels={homeworkLabels} />
            ))}
          </tbody>
          </table>
        </div>

        <div className="students-list-mobile">
          {students.map((s) => (
            <div key={s.id} className="student-card-mobile">
              <StudentRow student={s} labels={homeworkLabels} mobile />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
