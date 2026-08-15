import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from './firebase'

const GROUP = import.meta.env.VITE_FIREBASE_GROUP_COLLECTION || 'Gr1'

export function subscribeStudents(onUpdate, onError) {
  const q = query(collection(db, GROUP))
  return onSnapshot(q, (snapshot) => {
    const students = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      students.push({ id: doc.id, ...data })
    })
    onUpdate(students)
  }, onError)
}
