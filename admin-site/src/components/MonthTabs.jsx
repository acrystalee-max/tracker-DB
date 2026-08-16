import React from 'react'
import { MONTHS } from '../config/months'

export default function MonthTabs({ value, onChange }) {
  return <section className="month-panel card" aria-labelledby="month-panel-title">
    <div className="month-panel-title" id="month-panel-title">Choose a month</div>
    <div className="month-tabs" role="tablist" aria-label="Tracker months">
      {MONTHS.map((month) => <button
        key={month.id}
        type="button"
        role="tab"
        aria-selected={value === month.id}
        className={`month-tab month-${month.tone}${value === month.id ? ' active' : ''}`}
        onClick={() => onChange(month.id)}
      >
        <span className="month-art" aria-hidden="true">{month.art}</span>
        <span>{month.name}</span>
      </button>)}
    </div>
  </section>
}
