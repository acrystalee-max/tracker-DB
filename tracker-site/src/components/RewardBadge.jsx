import React, { useState } from 'react'

export default function RewardBadge({ reward }) {
  const [open, setOpen] = useState(false)
  return <span className={`reward-wrap reward-${reward.id}${open ? ' is-open' : ''}`}>
    <button type="button" className="reward-badge" aria-label={`${reward.label}: ${reward.description}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} onBlur={() => setOpen(false)}>
      <span aria-hidden="true">{reward.icon}</span>
    </button>
    <span className="reward-tooltip" role="tooltip">{reward.description}</span>
  </span>
}
