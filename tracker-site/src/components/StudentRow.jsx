import React, { useEffect, useRef, useState } from 'react'
import RewardBadge from './RewardBadge'
import { getRewards } from '../utils/achievements.mjs'
import RewardChest from '../assets/achievement-game/reward-chest.webp'
import LeaderCrown from '../assets/achievement-game/leader-crown-pedestal.webp'

function ScoreBadge({ value, maxScore, animate }) {
  const score = Number(value) || 0
  const ratio = maxScore ? score / maxScore : 0
  const state = score === 0 ? 'empty' : ratio <= 0.5 ? 'low' : ratio < 1 ? 'high' : 'max'
  return <span className={`score-badge score-${state}${animate ? ' score-changed' : ''}`} aria-label={`${score} out of ${maxScore}`}>
    <span>{score}</span>{state === 'max' && <span className="score-star" aria-hidden="true">★</span>}
  </span>
}

function ProgressRoute({ scores }) {
  const completed = scores.filter((score) => score > 0).length
  const currentIndex = completed >= scores.length ? -1 : scores.findIndex((score) => score === 0)
  return <div className="progress-route" aria-label={`${completed} of ${scores.length} assignments completed`}>
    <span className="route-track" aria-hidden="true">
      <span className="route-line" />
      {scores.map((score, index) => <span key={index} className={`route-dot${score > 0 ? ' complete' : ''}${index === currentIndex ? ' current' : ''}`} />)}
    </span>
    <span className={`route-chest${scores.length > 0 && completed === scores.length ? ' is-earned' : ''}`} aria-hidden="true"><img src={RewardChest} alt="" /></span>
  </div>
}

export default function StudentRow({ student, labels, groupId, achievementData }) {
  const name = student.name || student.id
  const initial = name?.[0]?.toUpperCase() || '?'
  const stats = achievementData.statsById[student.id]
  const rewards = getRewards(student.id, stats, achievementData)
  const isStudentOfMonth = achievementData.studentOfMonthIds.has(student.id)
  const previousScores = useRef(stats.scores)
  const [changedIndex, setChangedIndex] = useState(-1)
  const [animateMedal, setAnimateMedal] = useState(false)

  useEffect(() => {
    const index = stats.scores.findIndex((score, scoreIndex) => score !== previousScores.current[scoreIndex])
    previousScores.current = stats.scores
    if (index < 0) return undefined
    setChangedIndex(index)
    const timeout = window.setTimeout(() => setChangedIndex(-1), 650)
    return () => window.clearTimeout(timeout)
  }, [stats.scores.join('|')])

  useEffect(() => {
    if (!isStudentOfMonth) return undefined
    const month = new Date().toISOString().slice(0, 7)
    const key = `achievement-medal-seen:${groupId}:${student.id}:${month}`
    try {
      if (window.localStorage.getItem(key)) return undefined
      window.localStorage.setItem(key, '1')
    } catch {
      // Private browsing can block storage; the award still remains visible.
    }
    setAnimateMedal(true)
    const timeout = window.setTimeout(() => setAnimateMedal(false), 1100)
    return () => window.clearTimeout(timeout)
  }, [groupId, isStudentOfMonth, student.id])

  return <tr>
    <th scope="row" className="name-cell">
      <div className="student-profile">
        <div className="avatar" aria-hidden="true">{initial}</div>
        <div className="profile-details">
          <div className="name-line">
            <span className="name-text">{name}</span>
            {isStudentOfMonth && <span className={`month-medal${animateMedal ? ' medal-arrival' : ''}`} aria-label="Student of the Month">
              <img src={LeaderCrown} alt="" aria-hidden="true" />{animateMedal && <span className="medal-particles" aria-hidden="true"><i /><i /><i /></span>}
            </span>}
          </div>
          <div className="profile-meta"><span className={`level-badge level-${stats.level.toLowerCase().replace(' ', '-')}`}>{stats.level}</span><span className="xp-label">{stats.xp} XP</span></div>
          <div className="personal-progress" aria-label={`${stats.progress}% of available XP`}><span style={{ width: `${stats.progress}%` }} /></div>
          <div className="student-achievement-row">
            <div className="reward-list" aria-label="Earned rewards">
              {rewards.length ? rewards.map((reward) => <RewardBadge key={reward.id} reward={reward} />) : <span className="no-rewards">Next reward ahead</span>}
            </div>
            <ProgressRoute scores={stats.scores} />
          </div>
        </div>
      </div>
    </th>
    {stats.scores.map((value, index) => <td key={index} data-label={labels[index]}><ScoreBadge value={value} maxScore={achievementData.maxScore} animate={changedIndex === index} /></td>)}
  </tr>
}
