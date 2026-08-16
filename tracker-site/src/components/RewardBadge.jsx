import React, { useState } from 'react'
import HomeworkStar from '../assets/achievement-game/star-energy-platform.webp'
import FastFinisher from '../assets/achievement-game/progress-rocket-gauge.webp'
import PerfectStreak from '../assets/achievement-game/perfect-streak-trophy.webp'
import StudentOfMonth from '../assets/achievement-game/leader-crown-pedestal.webp'

const rewardImages = {
  'homework-star': HomeworkStar,
  'fast-finisher': FastFinisher,
  'perfect-streak': PerfectStreak,
  'student-of-month': StudentOfMonth,
}

export default function RewardBadge({ reward }) {
  const [open, setOpen] = useState(false)
  return <span className={`reward-wrap reward-${reward.id}${open ? ' is-open' : ''}`}>
    <button type="button" className="reward-badge" aria-label={`${reward.label}: ${reward.description}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} onBlur={() => setOpen(false)}>
      <img src={rewardImages[reward.id]} alt="" aria-hidden="true" />
    </button>
    <span className="reward-tooltip" role="tooltip">{reward.description}</span>
  </span>
}
