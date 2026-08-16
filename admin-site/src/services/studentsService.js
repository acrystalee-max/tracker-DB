import { db } from './firebase'
import { collection, doc, setDoc, deleteDoc, deleteField, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, query } from 'firebase/firestore'
import { LEGACY_MONTH_ID, MONTHS } from '../config/months'

const SETTINGS_ID = 'trackerSettings'
const VALID_GROUPS = new Set(['Gr1', 'Gr2', 'Gr3', 'Gr4', 'Gr5', 'Gr6'])
const VALID_MONTHS = new Set(MONTHS.map((month) => month.id))
export const MAX_HOMEWORKS = 10
export const DEFAULT_HOMEWORK_LABELS = [1, 2, 3, 4, 5].map((n) => `Homework ${n}`)

function normalizeHomeworkLabels(labels){
  if(!Array.isArray(labels) || labels.length === 0) return DEFAULT_HOMEWORK_LABELS
  return labels.slice(0, MAX_HOMEWORKS).map((value, index)=>{
    return typeof value === 'string' && value.trim() ? value.trim() : `Homework ${index + 1}`
  })
}

function safeGroup(groupId){
  return VALID_GROUPS.has(groupId) ? groupId : 'Gr1'
}

function safeMonth(monthId){
  return VALID_MONTHS.has(monthId) ? monthId : LEGACY_MONTH_ID
}

function settingsId(monthId){
  const month = safeMonth(monthId)
  return month === LEGACY_MONTH_ID ? SETTINGS_ID : `${SETTINGS_ID}_${month}`
}

function belongsToMonth(data, monthId){
  return (data.monthId || LEGACY_MONTH_ID) === safeMonth(monthId)
}

export function subscribeStudents(groupId, monthId, onUpdate, onError){
  const q = query(collection(db, safeGroup(groupId)))
  return onSnapshot(q, (snapshot)=>{
    const students = []
    snapshot.forEach((docSnap)=>{
      const data = docSnap.data()
      if(data.type !== 'settings' && belongsToMonth(data, monthId)) students.push({ id: docSnap.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(groupId, monthId, onUpdate, onError){
  const ref = doc(db, safeGroup(groupId), settingsId(monthId))
  return onSnapshot(ref, (snapshot)=>{
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    onUpdate(normalizeHomeworkLabels(saved))
  }, onError)
}

export function subscribeHomeworkLink(groupId, monthId, onUpdate, onError){
  const ref = doc(db, safeGroup(groupId), settingsId(monthId))
  return onSnapshot(ref, (snapshot)=>{
    const saved = snapshot.exists() ? String(snapshot.data().homeworkUrl || '').trim() : ''
    onUpdate(/^https?:\/\//i.test(saved) ? saved : '')
  }, onError)
}

export async function updateHomeworkLabels(groupId, monthId, labels){
  const normalized = normalizeHomeworkLabels(labels)
  return setDoc(doc(db, safeGroup(groupId), settingsId(monthId)), {
    type: 'settings',
    monthId: safeMonth(monthId),
    homeworkLabels: normalized,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function updateHomeworkLink(groupId, monthId, value){
  const trimmed = String(value || '').trim()
  let homeworkUrl = deleteField()
  if(trimmed){
    const parsed = new URL(trimmed)
    if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Enter a full link beginning with https://')
    homeworkUrl = parsed.toString()
  }
  return setDoc(doc(db, safeGroup(groupId), settingsId(monthId)), {
    type: 'settings',
    monthId: safeMonth(monthId),
    homeworkUrl,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createStudent(groupId, monthId, data){
  const homework = Object.fromEntries(
    Object.entries(data).filter(([key])=>/^hw([1-9]|10)$/.test(key))
  )
  const payload = {
    name: data.name.trim(),
    monthId: safeMonth(monthId),
    ...homework,
    homeworkCompletedAt: Object.fromEntries(
      Object.entries(homework).filter(([, value])=>Number(value) > 0).map(([key])=>[key, serverTimestamp()])
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  // prefer auto-id
  return addDoc(collection(db, safeGroup(groupId)), payload)
}

export async function updateStudent(groupId, monthId, id, data){
  const ref = doc(db, safeGroup(groupId), id)
  const previousSnapshot = await getDoc(ref)
  const previous = previousSnapshot.exists() ? previousSnapshot.data() : {}
  const updates = { ...data, monthId: safeMonth(monthId), updatedAt: serverTimestamp() }
  Object.entries(data).forEach(([key, value])=>{
    if(!/^hw([1-9]|10)$/.test(key)) return
    const oldScore = Number(previous[key]) || 0
    const newScore = Number(value) || 0
    if(oldScore <= 0 && newScore > 0) updates[`homeworkCompletedAt.${key}`] = serverTimestamp()
    if(oldScore > 0 && newScore <= 0) updates[`homeworkCompletedAt.${key}`] = deleteField()
  })
  return updateDoc(ref, updates)
}

export async function deleteStudent(groupId, id){
  const ref = doc(db, safeGroup(groupId), id)
  return deleteDoc(ref)
}

export async function getStudent(groupId, id){
  const ref = doc(db, safeGroup(groupId), id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
