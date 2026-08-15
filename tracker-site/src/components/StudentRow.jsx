import React from 'react'

function Badge({ value }){
  const v = value === null || value === undefined ? '-' : value
  const cls = value === 0 || v === '-' ? 'badge badge-empty' : (value === 1 ? 'badge badge-success' : 'badge badge-positive')
  return <span className={cls}>{v}</span>
}

export default function StudentRow({ student, mobile }) {
  const name = student.name || student.id
  const initial = (name && name[0]) ? name[0].toUpperCase() : '?'
  const hw = [1,2,3,4,5].map((n) => student[`hw${n}`] ?? null)

  if (mobile) {
    return (
      <div className="student-card">
        <div className="student-head">
          <div className="avatar">{initial}</div>
          <div className="student-name">{name}</div>
        </div>
        <div className="student-hw">
          {hw.map((v, i) => (
            <div key={i} className="hw-item">
              <div className="hw-label">Homework {i+1}</div>
              <Badge value={v} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <tr>
      <td className="name-cell">
        <div className="row-name">
          <div className="avatar">{initial}</div>
          <div className="name-text">{name}</div>
        </div>
      </td>
      {hw.map((v, i) => (
        <td key={i}><Badge value={v} /></td>
      ))}
    </tr>
  )
}
