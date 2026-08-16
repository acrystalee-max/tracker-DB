import { db } from './firebase'
import { collection, doc, setDoc, deleteDoc, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, query } from 'firebase/firestore'

const GROUP = import.meta.env.VITE_FIREBASE_GROUP_COLLECTION || 'Gr1'
const SETTINGS_ID = '__settings__'
export const DEFAULT_HOMEWORK_LABELS = [1, 2, 3, 4, 5].map((n) => `Homework ${n}`)

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
    const labels = DEFAULT_HOMEWORK_LABELS.map((fallback, index)=>{
      const value = Array.isArray(saved) ? saved[index] : null
      return typeof value === 'string' && value.trim() ? value.trim() : fallback
    })
    onUpdate(labels)
  }, onError)
}

export async function updateHomeworkLabels(labels){
  const normalized = DEFAULT_HOMEWORK_LABELS.map((fallback, index)=>{
    const value = labels[index]
    return typeof value === 'string' && value.trim() ? value.trim() : fallback
  })
  return setDoc(doc(db, GROUP, SETTINGS_ID), {
    type: 'settings',
    homeworkLabels: normalized,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createStudent(data){
  const payload = {
    name: data.name.trim(),
    hw1: data.hw1 ?? 0,
    hw2: data.hw2 ?? 0,
    hw3: data.hw3 ?? 0,
    hw4: data.hw4 ?? 0,
    hw5: data.hw5 ?? 0,
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
