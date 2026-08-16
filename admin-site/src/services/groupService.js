import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { GROUPS } from '../config/groups'
import { db } from './firebase'

const PROFILE_ID = 'groupProfile'

export function subscribeGroupNames(onUpdate, onError) {
  let names = {}
  const unsubscribers = GROUPS.map((group) => onSnapshot(doc(db, group.id, PROFILE_ID), (snapshot) => {
    const displayName = snapshot.exists() ? String(snapshot.data().displayName || '').trim() : ''
    names = { ...names, [group.id]: displayName || group.name }
    onUpdate(names)
  }, onError))

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}

export async function saveGroupName(groupId, displayName) {
  const normalized = String(displayName || '').trim().replace(/\s+/g, ' ').slice(0, 40)
  if (!normalized) throw new Error('Group name cannot be empty.')

  await setDoc(doc(db, groupId, PROFILE_ID), {
    type: 'settings',
    displayName: normalized,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  return normalized
}
