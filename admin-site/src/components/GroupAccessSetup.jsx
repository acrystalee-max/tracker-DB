import React, { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
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
      .then((snapshot) => {
        if (active) setConfigured(snapshot.exists())
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
      const credential = await createUserWithEmailAndPassword(secondaryAuth, group.accountEmail, password)
      await setDoc(doc(db, 'groupAccess', credential.user.uid), {
        groupId: group.id,
        email: group.accountEmail,
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'groupDirectory', group.id), {
        uid: credential.user.uid,
        email: group.accountEmail,
        configuredAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
      setPassword('')
      setConfirmation('')
      setConfigured(true)
      setMessage('Access created. Share only the group link and chosen password.')
    } catch (error) {
      console.error('Group access setup error', error)
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Access for this group already exists. Use Firebase Authentication to change its password.')
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
    return <div className="group-access-status group-access-ready">Password access is configured for this group.</div>
  }

  return (
    <form className="group-access card" onSubmit={createAccess}>
      <div>
        <div className="group-access-title">Create a password for {group.name}</div>
        <div className="group-access-help">The password is not displayed or stored in the database. Save it before creating access.</div>
      </div>
      <div className="group-access-fields">
        <label>Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label>Repeat password
          <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create group access'}</button>
      {message && <div className="group-access-message">{message}</div>}
    </form>
  )
}
