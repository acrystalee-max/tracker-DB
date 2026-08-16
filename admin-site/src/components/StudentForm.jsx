import React, { useState } from 'react'

export default function StudentForm({ initial = {}, onSubmit, submitLabel='Save', onCancel, labels = [] }){
  const [name, setName] = useState(initial.name || '')
  const [scores, setScores] = useState(()=>Object.fromEntries(
    labels.map((_, index)=>[`hw${index + 1}`, initial[`hw${index + 1}`] ?? 0])
  ))
  const [saving, setSaving] = useState(false)

  async function submit(e){
    e.preventDefault()
    const trimmed = name.trim()
    if(!trimmed){ alert('Student name is required'); return }
    setSaving(true)
    try{
      await onSubmit({ name: trimmed, ...scores })
    }finally{ setSaving(false) }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <label>Student name<input value={name} onChange={e=>setName(e.target.value)} /></label>
      <div className="hw-row">
        {labels.map((label, index)=>{
          const key = `hw${index + 1}`
          return <label key={key}>{label || `Homework ${index + 1}`}<input type="number" value={scores[key] ?? 0} onChange={e=>setScores({...scores, [key]: Number(e.target.value)})} /></label>
        })}
      </div>
      <div className="actions">
        <button type="submit" className="btn-add" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
