import React, { useEffect, useState } from 'react'
import { subscribeStudents, subscribeHomeworkLabels, updateHomeworkLabels, DEFAULT_HOMEWORK_LABELS, createStudent, updateStudent, deleteStudent } from '../services/studentsService'
import StudentForm from './StudentForm'

function HomeworkLabelsEditor({ labels, onSave }){
  const [draft, setDraft] = useState(labels)
  const [saving, setSaving] = useState(false)

  useEffect(()=>setDraft(labels), [labels])

  async function submit(e){
    e.preventDefault()
    setSaving(true)
    try{
      await onSave(draft)
    }finally{
      setSaving(false)
    }
  }

  return (
    <form className="card homework-labels" onSubmit={submit}>
      <div className="homework-labels-title">Названия домашних заданий</div>
      <div className="homework-labels-grid">
        {draft.map((value, index)=>(
          <label key={index}>
            Домашняя работа {index + 1}
            <input
              value={value}
              onChange={(e)=>setDraft(draft.map((item, i)=>i === index ? e.target.value : item))}
              placeholder={`Homework ${index + 1}`}
            />
          </label>
        ))}
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Сохраняю...' : 'Сохранить названия'}
      </button>
    </form>
  )
}

export default function StudentsEditor({ user }){
  const [students, setStudents] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [homeworkLabels, setHomeworkLabels] = useState(DEFAULT_HOMEWORK_LABELS)
  const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID || 'Yic6ABeP1jY9WtQ5SatIgmz3vEk2'

  useEffect(()=>{
    const unsub = subscribeStudents((list)=>{ setStudents(list); setError(null) }, (e)=>{ console.error(e); setError('Ошибка загрузки') })
    return unsub
  },[])

  useEffect(()=>{
    const unsub = subscribeHomeworkLabels(setHomeworkLabels, (e)=>console.error('Ошибка загрузки названий', e))
    return unsub
  },[])

  const canEdit = user && adminUid && user.uid === adminUid

  async function handleCreate(data){
    await createStudent(data)
  }

  async function handleUpdate(id, data){
    await updateStudent(id, data)
    setEditing(null)
  }

  async function handleDelete(id){
    if(!confirm('Удалить ученика?')) return
    await deleteStudent(id)
  }

  if (error) return <div className="error">{error}</div>
  if (students === null) return <div className="loading">Загрузка...</div>

  return (
    <div>
      {!canEdit && <div className="notice">У вас нет доступа к редактированию.</div>}
      {canEdit && <HomeworkLabelsEditor labels={homeworkLabels} onSave={updateHomeworkLabels} />}
      {canEdit && <StudentForm labels={homeworkLabels} onSubmit={handleCreate} submitLabel="Добавить" />}
      <table className="tracker">
        <thead><tr><th>Name</th>{homeworkLabels.map((label, index)=><th key={index}>{label}</th>)}<th>Actions</th></tr></thead>
        <tbody>
          {students.map(s=> (
            <tr key={s.id}>
              <td>{s.name || s.id}</td>
              {[1,2,3,4,5].map(n=><td key={n}>{s[`hw${n}`] ?? '-'}</td>)}
              <td>
                {canEdit && <><button className="btn-edit" onClick={()=>setEditing(s)}>Edit</button><button className="btn-delete" onClick={()=>handleDelete(s.id)}>Delete</button></>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <div className="modal"><StudentForm labels={homeworkLabels} initial={editing} onSubmit={(data)=>handleUpdate(editing.id,data)} submitLabel="Сохранить" onCancel={()=>setEditing(null)} /></div>}
    </div>
  )
}
