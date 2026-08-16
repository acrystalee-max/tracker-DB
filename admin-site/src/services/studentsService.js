import { db } from './firebase'
import { collection, doc, setDoc, deleteDoc, deleteField, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, query } from 'firebase/firestore'

const SETTINGS_ID = 'trackerSettings'
const VALID_GROUPS = new Set(['Gr1', 'Gr2', 'Gr3', 'Gr4', 'Gr5', 'Gr6'])
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

export function subscribeStudents(groupId, onUpdate, onError){
  const q = query(collection(db, safeGroup(groupId)))
  return onSnapshot(q, (snapshot)=>{
    const students = []
    snapshot.forEach((docSnap)=>{
      const data = docSnap.data()
      if(docSnap.id !== SETTINGS_ID && data.type !== 'settings') students.push({ id: docSnap.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(groupId, onUpdate, onError){
  const ref = doc(db, safeGroup(groupId), SETTINGS_ID)
  return onSnapshot(ref, (snapshot)=>{
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    onUpdate(normalizeHomeworkLabels(saved))
  }, onError)
}

export async function updateHomeworkLabels(groupId, labels){
  const normalized = normalizeHomeworkLabels(labels)
  return setDoc(doc(db, safeGroup(groupId), SETTINGS_ID), {
    type: 'settings',
    homeworkLabels: normalized,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createStudent(groupId, data){
  const homework = Object.fromEntries(
    Object.entries(data).filter(([key])=>/^hw([1-9]|10)$/.test(key))
  )
  const payload = {
    name: data.name.trim(),
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

export async function updateStudent(groupId, id, data){
  const ref = doc(db, safeGroup(groupId), id)
  const previousSnapshot = await getDoc(ref)
  const previous = previousSnapshot.exists() ? previousSnapshot.data() : {}
  const updates = { ...data, updatedAt: serverTimestamp() }
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
