import septemberArt from '../assets/months/september.webp'
import octoberArt from '../assets/months/october.webp'
import novemberArt from '../assets/months/november.webp'
import decemberArt from '../assets/months/december.webp'
import januaryArt from '../assets/months/january.webp'
import februaryArt from '../assets/months/february.webp'
import marchArt from '../assets/months/march.webp'
import aprilArt from '../assets/months/april.webp'
import mayArt from '../assets/months/may.webp'

export const MONTHS = [
  { id: 'september', name: 'September', art: septemberArt, tone: 'autumn' },
  { id: 'october', name: 'October', art: octoberArt, tone: 'autumn' },
  { id: 'november', name: 'November', art: novemberArt, tone: 'autumn' },
  { id: 'december', name: 'December', art: decemberArt, tone: 'winter' },
  { id: 'january', name: 'January', art: januaryArt, tone: 'winter' },
  { id: 'february', name: 'February', art: februaryArt, tone: 'winter' },
  { id: 'march', name: 'March', art: marchArt, tone: 'spring' },
  { id: 'april', name: 'April', art: aprilArt, tone: 'spring' },
  { id: 'may', name: 'May', art: mayArt, tone: 'spring' },
]

export const LEGACY_MONTH_ID = 'september'

const CALENDAR_MONTH_IDS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

export function getInitialMonth() {
  const requested = new URLSearchParams(window.location.search).get('month')
  if (MONTHS.some((month) => month.id === requested)) return requested
  const currentMonthId = CALENDAR_MONTH_IDS[new Date().getMonth()]
  return MONTHS.some((month) => month.id === currentMonthId) ? currentMonthId : LEGACY_MONTH_ID
}

export function getMonth(monthId) {
  return MONTHS.find((month) => month.id === monthId) || MONTHS.find((month) => month.id === LEGACY_MONTH_ID)
}
