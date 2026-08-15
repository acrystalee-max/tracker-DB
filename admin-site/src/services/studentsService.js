import { db } from './firebase'
import { collection, doc, setDoc, deleteDoc, getDoc, addDoc, serverTimestamp, updateDoc, onSnapshot, query } from 'firebase/firestore'

const GROUP = import.meta.env.VITE_FIREBASE_GROUP_COLLECTION || 'Gr1'

export function subscribeStudents(onUpdate, onError){
  const q = query(collection(db, GROUP))
  return onSnapshot(q, (snapshot)=>{
    const students = []
    snapshot.forEach((docSnap)=>students.push({ id: docSnap.id, ...docSnap.data() }))
    onUpdate(students)
  }, onError)
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
