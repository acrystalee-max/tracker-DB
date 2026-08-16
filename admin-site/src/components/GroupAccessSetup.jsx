import React, { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { deleteApp, getApps, initializeApp } from 'firebase/app'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, firebaseConfig } from '../services/firebase'

export default function GroupAccessSetup({ group }) {
  const [configured, setConfigured] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    setChecking(true)
    setMessage('')
    getDoc(doc(db, 'groupDirectory', group.id))
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          if (active) setConfigured(false)
          return
        }
        const uid = snapshot.data().uid
        const accessSnapshot = uid ? await getDoc(doc(db, 'groupAccess', uid)) : null
        const valid = accessSnapshot?.exists() && accessSnapshot.data().groupId === group.id
        if (!valid && uid) {
          await setDoc(doc(db, 'groupAccess', uid), {
            groupId: group.id,
            email: group.accountEmail,
            repairedAt: serverTimestamp(),
          }, { merge: true })
          if (active) setMessage('Group access was repaired automatically.')
        }
        if (active) setConfigured(Boolean(uid))
      })
      .catch(() => {
        if (active) setConfigured(false)
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => { active = false }
  }, [group.id])

  async function createAccess(event) {
    event.preventDefault()
    setMessage('')
    if (password.length < 6) {
      setMessage('The password must contain at least 6 characters.')
      return
    }
    if (password !== confirmation) {
      setMessage('The passwords do not match.')
      return
    }

    setSaving(true)
    const appName = `group-access-${group.id}`
    const existing = getApps().find((app) => app.name === appName)
    const secondaryApp = existing || initializeApp(firebaseConfig, appName)
    const secondaryAuth = getAuth(secondaryApp)

    try {
      let credential
      let repaired = false
      try {
        credential = await createUserWithEmailAndPassword(secondaryAuth, group.accountEmail, password)
      } catch (authError) {
        if (authError.code !== 'auth/email-already-in-use') throw authError
        credential = await signInWithEmailAndPassword(secondaryAuth, group.accountEmail, password)
        repaired = true
      }
      await setDoc(doc(db, 'groupAccess', credential.user.uid), {
        groupId: group.id,
        email: group.accountEmail,
        [repaired ? 'repairedAt' : 'createdAt']: serverTimestamp(),
      }, { merge: true })
      await setDoc(doc(db, 'groupDirectory', group.id), {
        uid: credential.user.uid,
        email: group.accountEmail,
        configuredAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
      setPassword('')
      setConfirmation('')
      setConfigured(true)
      setMessage(repaired ? 'Existing access repaired. The current group password now works.' : 'Access created. Share only the group link and chosen password.')
    } catch (error) {
      console.error('Group access setup error', error)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setMessage('This group account already exists. Enter its current password to repair access.')
      } else {
        setMessage('Unable to create access. Check Firebase Authentication settings.')
      }
    } finally {
      setSaving(false)
      if (!existing) await deleteApp(secondaryApp)
    }
  }

  if (checking) return <div className="group-access-status">Checking group access...</div>
  if (configured) {
    return <div className="group-access-status group-access-ready">
      <span>Password access is configured for this group.{message && <> {message}</>}</span>
      <button type="button" className="btn btn-info" onClick={() => { setConfigured(false); setMessage('') }}>Repair access</button>
    </div>
  }

  return (
    <form className="group-access card" onSubmit={createAccess}>
      <div>
        <div className="group-access-title">Create or repair access for {group.name}</div>
        <div className="group-access-help">For an existing group, enter its current password. The password is never stored in the database.</div>
      </div>
      <div className="group-access-fields">
        <label>Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label>Repeat password
          <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Checking...' : 'Create or repair access'}</button>
      {message && <div className="group-access-message">{message}</div>}
    </form>
  )
}
