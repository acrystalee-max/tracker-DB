import React, { useEffect, useState } from 'react'
import { subscribeStudents, subscribeHomeworkLabels, updateHomeworkLabels, DEFAULT_HOMEWORK_LABELS, MAX_HOMEWORKS, createStudent, updateStudent, deleteStudent } from '../services/studentsService'
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

  function addHomework(){
    if(draft.length >= MAX_HOMEWORKS) return
    setDraft([...draft, `Homework ${draft.length + 1}`])
  }

  return (
    <form className="card homework-labels" onSubmit={submit}>
      <div className="homework-labels-title">Homework titles</div>
      <div className="homework-labels-grid">
        {draft.map((value, index)=>(
          <label key={index}>
            Homework {index + 1}
            <input
              value={value}
              onChange={(e)=>setDraft(draft.map((item, i)=>i === index ? e.target.value : item))}
              placeholder={`Homework ${index + 1}`}
            />
          </label>
        ))}
      </div>
      <div className="homework-label-actions">
        <button type="button" className="btn btn-info" onClick={addHomework} disabled={draft.length >= MAX_HOMEWORKS}>
          {draft.length >= MAX_HOMEWORKS ? '10 homework columns added' : '+ Add homework column'}
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save titles'}
        </button>
      </div>
    </form>
  )
}

export default function StudentsEditor({ user, groupId }){
  const [students, setStudents] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [homeworkLabels, setHomeworkLabels] = useState(DEFAULT_HOMEWORK_LABELS)
  const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID || 'Yic6ABePljY9WtQ5SatIgmz3vEk2'

  useEffect(()=>{
    setStudents(null)
    setEditing(null)
    setAdding(false)
    const unsub = subscribeStudents(groupId, (list)=>{ setStudents(list); setError(null) }, (e)=>{ console.error(e); setError('Unable to load data') })
    return unsub
  },[groupId])

  useEffect(()=>{
    setHomeworkLabels(DEFAULT_HOMEWORK_LABELS)
    const unsub = subscribeHomeworkLabels(groupId, setHomeworkLabels, (e)=>console.error('Homework title loading error', e))
    return unsub
  },[groupId])

  const canEdit = user && adminUid && user.uid === adminUid

  async function handleCreate(data){
    await createStudent(groupId, data)
    setAdding(false)
  }

  async function handleUpdate(id, data){
    await updateStudent(groupId, id, data)
    setEditing(null)
  }

  async function handleDelete(id){
    if(!confirm('Delete this student?')) return
    await deleteStudent(groupId, id)
  }

  if (error) return <div className="error">{error}</div>
  if (students === null) return <div className="loading">Loading...</div>

  return (
    <div>
      {!canEdit && <div className="notice">You do not have editing access.</div>}
      {canEdit && <HomeworkLabelsEditor labels={homeworkLabels} onSave={(labels)=>updateHomeworkLabels(groupId, labels)} />}
      {canEdit && <div className="student-create-controls">
        <button type="button" className="btn btn-primary" onClick={()=>setAdding(!adding)}>
          {adding ? 'Close form' : '+ Add student'}
        </button>
      </div>}
      {canEdit && adding && <StudentForm labels={homeworkLabels} onSubmit={handleCreate} submitLabel="Add student" onCancel={()=>setAdding(false)} />}
      <div className="table-wrap"><table className="tracker">
        <thead><tr><th>Name</th>{homeworkLabels.map((label, index)=><th key={index}>{label}</th>)}<th>Actions</th></tr></thead>
        <tbody>
          {students.map(s=> (
            <tr key={s.id}>
              <td>{s.name || s.id}</td>
              {homeworkLabels.map((_, index)=><td key={index}>{s[`hw${index + 1}`] ?? '-'}</td>)}
              <td>
                {canEdit && <><button className="btn-edit" onClick={()=>setEditing(s)}>Edit</button><button className="btn-delete" onClick={()=>handleDelete(s.id)}>Delete</button></>}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {editing && <div className="modal"><StudentForm labels={homeworkLabels} initial={editing} onSubmit={(data)=>handleUpdate(editing.id,data)} submitLabel="Save" onCancel={()=>setEditing(null)} /></div>}
    </div>
  )
}
