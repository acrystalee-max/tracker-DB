import React, { useState } from 'react'

export default function StudentForm({ initial = {}, onSubmit, submitLabel='Сохранить', onCancel }){
  const [name, setName] = useState(initial.name || '')
  const [hw1, setHw1] = useState(initial.hw1 ?? 0)
  const [hw2, setHw2] = useState(initial.hw2 ?? 0)
  const [hw3, setHw3] = useState(initial.hw3 ?? 0)
  const [hw4, setHw4] = useState(initial.hw4 ?? 0)
  const [hw5, setHw5] = useState(initial.hw5 ?? 0)
  const [saving, setSaving] = useState(false)

  async function submit(e){
    e.preventDefault()
    const trimmed = name.trim()
    if(!trimmed){ alert('Имя обязательно'); return }
    setSaving(true)
    try{
      await onSubmit({ name: trimmed, hw1, hw2, hw3, hw4, hw5 })
    }finally{ setSaving(false) }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <label>Name<input value={name} onChange={e=>setName(e.target.value)} /></label>
      <div className="hw-row">
        <label>Homework 1<input type="number" value={hw1} onChange={e=>setHw1(Number(e.target.value))} /></label>
        <label>Homework 2<input type="number" value={hw2} onChange={e=>setHw2(Number(e.target.value))} /></label>
        <label>Homework 3<input type="number" value={hw3} onChange={e=>setHw3(Number(e.target.value))} /></label>
        <label>Homework 4<input type="number" value={hw4} onChange={e=>setHw4(Number(e.target.value))} /></label>
        <label>Homework 5<input type="number" value={hw5} onChange={e=>setHw5(Number(e.target.value))} /></label>
      </div>
      <div className="actions">
        <button type="submit" className="btn-add" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
