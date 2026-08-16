import { collection, doc, onSnapshot, query } from 'firebase/firestore'
import { db } from './firebase'
import { LEGACY_MONTH_ID, MONTHS } from '../config/months'

const SETTINGS_ID = 'trackerSettings'
const MAX_HOMEWORKS = 10
const VALID_GROUPS = new Set(['Gr1', 'Gr2', 'Gr3', 'Gr4', 'Gr5', 'Gr6'])
const VALID_MONTHS = new Set(MONTHS.map((month) => month.id))
export const DEFAULT_HOMEWORK_LABELS = [1, 2, 3, 4, 5].map((n) => `Homework ${n}`)

function normalizeHomeworkLabels(labels) {
  if (!Array.isArray(labels) || labels.length === 0) return DEFAULT_HOMEWORK_LABELS
  return labels.slice(0, MAX_HOMEWORKS).map((value, index) => {
    return typeof value === 'string' && value.trim() ? value.trim() : `Homework ${index + 1}`
  })
}

function safeGroup(groupId) {
  return VALID_GROUPS.has(groupId) ? groupId : 'Gr1'
}

function safeMonth(monthId) {
  return VALID_MONTHS.has(monthId) ? monthId : LEGACY_MONTH_ID
}

function settingsId(monthId) {
  const month = safeMonth(monthId)
  return month === LEGACY_MONTH_ID ? SETTINGS_ID : `${SETTINGS_ID}_${month}`
}

function belongsToMonth(data, monthId) {
  return (data.monthId || LEGACY_MONTH_ID) === safeMonth(monthId)
}

export function subscribeStudents(groupId, monthId, onUpdate, onError) {
  const q = query(collection(db, safeGroup(groupId)))
  return onSnapshot(q, (snapshot) => {
    const students = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if(data.type !== 'settings' && belongsToMonth(data, monthId)) students.push({ id: doc.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(groupId, monthId, onUpdate, onError) {
  return onSnapshot(doc(db, safeGroup(groupId), settingsId(monthId)), (snapshot) => {
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    onUpdate(normalizeHomeworkLabels(saved))
  }, onError)
}
