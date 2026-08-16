import { collection, doc, onSnapshot, query } from 'firebase/firestore'
import { db } from './firebase'

const GROUP = import.meta.env.VITE_FIREBASE_GROUP_COLLECTION || 'Gr1'
const SETTINGS_ID = 'trackerSettings'
export const DEFAULT_HOMEWORK_LABELS = [1, 2, 3, 4, 5].map((n) => `Homework ${n}`)

export function subscribeStudents(onUpdate, onError) {
  const q = query(collection(db, GROUP))
  return onSnapshot(q, (snapshot) => {
    const students = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if(doc.id !== SETTINGS_ID && data.type !== 'settings') students.push({ id: doc.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(onUpdate, onError) {
  return onSnapshot(doc(db, GROUP, SETTINGS_ID), (snapshot) => {
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    const labels = DEFAULT_HOMEWORK_LABELS.map((fallback, index) => {
      const value = Array.isArray(saved) ? saved[index] : null
      return typeof value === 'string' && value.trim() ? value.trim() : fallback
    })
    onUpdate(labels)
  }, onError)
}
