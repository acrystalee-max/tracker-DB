import React from 'react'
import { MONTHS } from '../config/months'

export default function MonthTabs({ value, onChange }) {
  return <nav className="month-panel" aria-label="Choose a month">
    <div className="month-panel-title"><span aria-hidden="true">✦</span> Choose your month</div>
    <div className="month-tabs" role="tablist" aria-label="Tracker months">
      {MONTHS.map((month) => <button
        key={month.id}
        type="button"
        role="tab"
        aria-selected={value === month.id}
        className={`month-tab month-${month.tone}${value === month.id ? ' active' : ''}`}
        onClick={() => onChange(month.id)}
      >
        <span className="month-art" aria-hidden="true"><img src={month.art} alt="" /></span>
        <span>{month.name}</span>
      </button>)}
    </div>
  </nav>
}
