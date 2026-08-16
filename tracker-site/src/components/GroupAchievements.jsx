import React from 'react'

const items = [
  ['Homework Completed', 'totalCompleted', '✓'],
  ['Stars Earned', 'totalStars', '★'],
  ['Group Progress', 'groupProgress', '↗'],
  ['Current Leader', 'currentLeader', '♛'],
]

export default function GroupAchievements({ summary }) {
  return <section className="achievements-section" aria-labelledby="group-achievements-title">
    <div className="section-heading"><div><p className="eyebrow">Monthly overview</p><h2 id="group-achievements-title">Group Achievements This Month</h2></div></div>
    <div className="achievement-grid">
      {items.map(([label, key, icon]) => <article className="achievement-card" key={key}>
        <span className="achievement-icon" aria-hidden="true">{icon}</span>
        <div><strong>{key === 'groupProgress' ? `${summary[key]}%` : summary[key]}</strong><span>{label}</span></div>
      </article>)}
    </div>
  </section>
}
