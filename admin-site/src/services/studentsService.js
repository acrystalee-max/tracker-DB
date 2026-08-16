import { db } from './firebase'
import { collection, doc, setDoc, deleteDoc, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, query } from 'firebase/firestore'

const GROUP = import.meta.env.VITE_FIREBASE_GROUP_COLLECTION || 'Gr1'
const SETTINGS_ID = 'trackerSettings'
export const MAX_HOMEWORKS = 10
export const DEFAULT_HOMEWORK_LABELS = [1, 2, 3, 4, 5].map((n) => `Homework ${n}`)

function normalizeHomeworkLabels(labels){
  if(!Array.isArray(labels) || labels.length === 0) return DEFAULT_HOMEWORK_LABELS
  return labels.slice(0, MAX_HOMEWORKS).map((value, index)=>{
    return typeof value === 'string' && value.trim() ? value.trim() : `Homework ${index + 1}`
  })
}

export function subscribeStudents(onUpdate, onError){
  const q = query(collection(db, GROUP))
  return onSnapshot(q, (snapshot)=>{
    const students = []
    snapshot.forEach((docSnap)=>{
      const data = docSnap.data()
      if(docSnap.id !== SETTINGS_ID && data.type !== 'settings') students.push({ id: docSnap.id, ...data })
    })
    onUpdate(students)
  }, onError)
}

export function subscribeHomeworkLabels(onUpdate, onError){
  const ref = doc(db, GROUP, SETTINGS_ID)
  return onSnapshot(ref, (snapshot)=>{
    const saved = snapshot.exists() ? snapshot.data().homeworkLabels : null
    onUpdate(normalizeHomeworkLabels(saved))
  }, onError)
}

export async function updateHomeworkLabels(labels){
  const normalized = normalizeHomeworkLabels(labels)
  return setDoc(doc(db, GROUP, SETTINGS_ID), {
    type: 'settings',
    homeworkLabels: normalized,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createStudent(data){
  const homework = Object.fromEntries(
    Object.entries(data).filter(([key])=>/^hw([1-9]|10)$/.test(key))
  )
  const payload = {
    name: data.name.trim(),
    ...homework,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  // prefer auto-id
  return addDoc(collection(db, GROUP), payload)
}

export async function updateStudent(id, data){
  const ref = doc(db, GROUP, id)
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteStudent(id){
  const ref = doc(db, GROUP, id)
  return deleteDoc(ref)
}

export async function getStudent(id){
  const ref = doc(db, GROUP, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
