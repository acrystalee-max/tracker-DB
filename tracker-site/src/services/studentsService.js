import { collection, doc, onSnapshot, query } from 'firebase/firestore'
import { db } from './firebase'

const SETTINGS_ID = 'trackerSettings'
const MAX_HOMEWORKS = 10
const VALID_GROUPS = new Set(['Gr1', 'Gr2', 'Gr3', 'Gr4', 'Gr5', 'Gr6'])
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

export function subscribeStudents(groupId, onUpdate, onError) {
  const q = query(collection(db, safeGroup(groupId)))
  return onSnapshot(q, (snapshot) => {
    const students = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if(doc.id !== SETTINGS_ID && data.type !== 'settings') students.push({ id: doc.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(groupId, onUpdate, onError) {
  return onSnapshot(doc(db, safeGroup(groupId), SETTINGS_ID), (snapshot) => {
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    onUpdate(normalizeHomeworkLabels(saved))
  }, onError)
}
