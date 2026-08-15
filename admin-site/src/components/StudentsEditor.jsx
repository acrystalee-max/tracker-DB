import React, { useEffect, useState } from 'react'
import { subscribeStudents, createStudent, updateStudent, deleteStudent } from '../services/studentsService'
import StudentForm from './StudentForm'

export default function StudentsEditor({ user }){
  const [students, setStudents] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID

  useEffect(()=>{
    const unsub = subscribeStudents((list)=>{ setStudents(list); setError(null) }, (e)=>{ console.error(e); setError('Ошибка загрузки') })
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
      {canEdit && <StudentForm onSubmit={handleCreate} submitLabel="Добавить" />}
      <table className="tracker">
        <thead><tr><th>Name</th><th>Homework 1</th><th>Homework 2</th><th>Homework 3</th><th>Homework 4</th><th>Homework 5</th><th>Actions</th></tr></thead>
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
      {editing && <div className="modal"><StudentForm initial={editing} onSubmit={(data)=>handleUpdate(editing.id,data)} submitLabel="Сохранить" onCancel={()=>setEditing(null)} /></div>}
    </div>
  )
}
