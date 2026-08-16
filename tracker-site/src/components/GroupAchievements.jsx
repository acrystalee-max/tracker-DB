import React from 'react'
import HomeworkArtifact from '../assets/achievement-game/homework-artifact.webp'
import StarPlatform from '../assets/achievement-game/star-energy-platform.webp'
import ProgressRocket from '../assets/achievement-game/progress-rocket-gauge.webp'
import LeaderCrown from '../assets/achievement-game/leader-crown-pedestal.webp'

const cards = [
  { key: 'totalCompleted', label: 'Homework Completed', caption: 'Great start!', image: HomeworkArtifact, tone: 'completed' },
  { key: 'totalStars', label: 'Stars Earned', caption: 'Keep collecting stars!', image: StarPlatform, tone: 'stars' },
  { key: 'groupProgress', label: 'Group Progress', image: ProgressRocket, tone: 'progress' },
  { key: 'currentLeader', label: 'Current Leader', caption: 'Top XP this month', image: LeaderCrown, tone: 'leader' },
]

export default function GroupAchievements({ summary }) {
  const progress = Math.max(0, Math.min(100, Number(summary.groupProgress) || 0))
  const leader = String(summary.currentLeader || 'No scores yet')
  const leaderInitial = leader === 'No scores yet' ? '–' : leader.trim().charAt(0).toUpperCase()

  return <section className="achievements-section" aria-labelledby="group-achievements-title">
    <div className="section-heading achievements-heading">
      <div>
        <p className="eyebrow">Monthly overview</p>
        <h2 id="group-achievements-title">Monthly Overview</h2>
      </div>
    </div>
    <div className="achievement-grid">
      {cards.map(({ key, label, caption, image, tone }) => {
        const isProgress = key === 'groupProgress'
        const isLeader = key === 'currentLeader'
        const value = isProgress ? `${progress}%` : isLeader ? leader : summary[key]

        return <article className={`achievement-card achievement-card-${tone}`} key={key}>
          <span className="achievement-art" aria-hidden="true"><img src={image} alt="" /></span>
          <div className="achievement-copy">
            {isLeader && <span className="leader-mini"><span>{leaderInitial}</span> Leader</span>}
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
