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
      setMessage('Пароль должен содержать не менее 6 символов.')
      return
    }
    if (password !== confirmation) {
      setMessage('Пароли не совпадают.')
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
      setMessage('Доступ создан. Передайте группе только ссылку и выбранный пароль.')
    } catch (error) {
      console.error('Group access setup error', error)
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Доступ для этой группы уже создавался. Для смены пароля используйте Firebase Authentication.')
      } else {
        setMessage('Не удалось создать доступ. Проверьте настройки Firebase Authentication.')
      }
    } finally {
      setSaving(false)
      if (!existing) await deleteApp(secondaryApp)
    }
  }

  if (checking) return <div className="group-access-status">Проверяю доступ группы...</div>
  if (configured) {
    return <div className="group-access-status group-access-ready">Доступ по паролю для этой группы настроен.</div>
  }

  return (
    <form className="group-access card" onSubmit={createAccess}>
      <div>
        <div className="group-access-title">Создать пароль для {group.name.toLowerCase()}</div>
        <div className="group-access-help">Пароль нигде не показывается и не сохраняется в базе. Запишите его перед созданием доступа.</div>
      </div>
      <div className="group-access-fields">
        <label>Пароль
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label>Повторите пароль
          <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Создаю...' : 'Создать доступ группы'}</button>
      {message && <div className="group-access-message">{message}</div>}
    </form>
  )
}
