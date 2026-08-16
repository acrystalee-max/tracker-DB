export const MONTHS = [
  { id: 'january', name: 'January', art: '❄️', tone: 'winter' },
  { id: 'february', name: 'February', art: '💎', tone: 'winter' },
  { id: 'march', name: 'March', art: '🌱', tone: 'spring' },
  { id: 'april', name: 'April', art: '🌦️', tone: 'spring' },
  { id: 'may', name: 'May', art: '🌼', tone: 'spring' },
  { id: 'june', name: 'June', art: '☀️', tone: 'summer' },
  { id: 'july', name: 'July', art: '🏖️', tone: 'summer' },
  { id: 'august', name: 'August', art: '🌻', tone: 'summer' },
  { id: 'september', name: 'September', art: '🍎', tone: 'autumn' },
  { id: 'october', name: 'October', art: '🍁', tone: 'autumn' },
  { id: 'november', name: 'November', art: '🌧️', tone: 'autumn' },
  { id: 'december', name: 'December', art: '🎄', tone: 'winter' },
]

export const LEGACY_MONTH_ID = 'august'

export function getInitialMonth() {
  const requested = new URLSearchParams(window.location.search).get('month')
  if (MONTHS.some((month) => month.id === requested)) return requested
  return MONTHS[new Date().getMonth()]?.id || LEGACY_MONTH_ID
}

export function getMonth(monthId) {
  return MONTHS.find((month) => month.id === monthId) || MONTHS.find((month) => month.id === LEGACY_MONTH_ID)
}
