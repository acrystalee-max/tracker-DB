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
  const [resetMode, setResetMode] = useState(false)

  useEffect(() => {
    let active = true
    setChecking(true)
    setMessage('')
    setResetMode(false)
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
      let accessEmail = group.accountEmail
      let repaired = false
      if (resetMode) {
        for (const email of group.accountEmails.slice(1)) {
          try {
            credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
            accessEmail = email
            break
          } catch (authError) {
            if (authError.code !== 'auth/email-already-in-use') throw authError
          }
        }
        if (!credential) throw new Error('No replacement group accounts are available.')
      } else {
        try {
          credential = await createUserWithEmailAndPassword(secondaryAuth, group.accountEmail, password)
        } catch (authError) {
          if (authError.code !== 'auth/email-already-in-use') throw authError
          credential = await signInWithEmailAndPassword(secondaryAuth, group.accountEmail, password)
          repaired = true
        }
      }
      await setDoc(doc(db, 'groupAccess', credential.user.uid), {
        groupId: group.id,
        email: accessEmail,
        [resetMode ? 'resetAt' : repaired ? 'repairedAt' : 'createdAt']: serverTimestamp(),
      }, { merge: true })
      await setDoc(doc(db, 'groupDirectory', group.id), {
        uid: credential.user.uid,
        email: accessEmail,
        configuredAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
      setPassword('')
      setConfirmation('')
      setConfigured(true)
      setMessage(resetMode ? 'A new group password is active. The old password is no longer needed.' : repaired ? 'Existing access repaired. The current group password now works.' : 'Access created. Share only the group link and chosen password.')
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
      <div className="group-access-actions">
        <button type="button" className="btn btn-info" onClick={() => { setResetMode(false); setConfigured(false); setMessage('') }}>Repair access</button>
        <button type="button" className="btn btn-primary" onClick={() => { setResetMode(true); setConfigured(false); setMessage('') }}>Set new password</button>
      </div>
    </div>
  }

  return (
    <form className="group-access card" onSubmit={createAccess}>
      <div>
        <div className="group-access-title">{resetMode ? 'Set a new password' : 'Create or repair access'} for {group.name}</div>
        <div className="group-access-help">{resetMode ? 'Choose a new password. You do not need to know the old one.' : 'For an existing group, enter its current password.'} The password is never stored in the database.</div>
        <button
          type="button"
          className="group-access-mode-toggle"
          onClick={() => {
            setResetMode((current) => !current)
            setPassword('')
            setConfirmation('')
            setMessage('')
          }}
        >
          {resetMode ? 'Use current password instead' : "Don't know the old password? Set a new one"}
        </button>
      </div>
      <div className="group-access-fields">
        <label>Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label>Repeat password
          <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : resetMode ? 'Activate new password' : 'Create or repair access'}</button>
      {message && <div className="group-access-message">{message}</div>}
    </form>
  )
}
