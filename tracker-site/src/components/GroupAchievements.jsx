import React from 'react'

const cards = [
  { key: 'totalCompleted', label: 'Homework Completed', caption: 'Great start!', icon: '✓', tone: 'completed' },
  { key: 'totalStars', label: 'Stars Earned', caption: 'Keep collecting stars!', icon: '★', tone: 'stars' },
  { key: 'groupProgress', label: 'Group Progress', icon: '↗', tone: 'progress' },
  { key: 'currentLeader', label: 'Current Leader', caption: 'Top XP this month', icon: '♛', tone: 'leader' },
]

export default function GroupAchievements({ summary }) {
  const progress = Math.max(0, Math.min(100, Number(summary.groupProgress) || 0))
  const leader = String(summary.currentLeader || 'No scores yet')
  const leaderInitial = leader === 'No scores yet' ? '–' : leader.trim().charAt(0).toUpperCase()

  return <section className="achievements-section" aria-labelledby="group-achievements-title">
    <div className="section-heading achievements-heading">
      <div>
        <p className="eyebrow">Monthly overview</p>
        <h2 id="group-achievements-title">Group Achievements This Month</h2>
      </div>
    </div>
    <div className="achievement-grid">
      {cards.map(({ key, label, caption, icon, tone }) => {
        const isProgress = key === 'groupProgress'
        const isLeader = key === 'currentLeader'
        const value = isProgress ? `${progress}%` : isLeader ? leader : summary[key]

        return <article className={`achievement-card achievement-card-${tone}`} key={key}>
          <span className="achievement-icon" aria-hidden="true">
            {isLeader ? <span className="leader-avatar">{leaderInitial}</span> : icon}
            {tone === 'stars' && <span className="star-sparkles"><i>✦</i><i>✦</i><i>✦</i></span>}
            {isLeader && <span className="leader-crown">♛</span>}
          </span>
          <div className="achievement-copy">
            <strong title={isLeader ? leader : undefined}>{value}</strong>
            <span className="achievement-label">{label}</span>
            {isProgress && <div className="group-progress-track" aria-label={`Group progress: ${progress}%`}>
              <span style={{ width: `${progress}%` }} />
            </div>}
            <small>{isProgress ? `${progress}% of the group goal` : caption}</small>
          </div>
        </article>
      })}
    </div>
  </section>
}
