import React, { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import TrackerTable from './components/TrackerTable'
import GroupLogin from './components/GroupLogin'
import MonthTabs from './components/MonthTabs'
import Corgi from './assets/london-corgi.webp'
import { auth, db } from './services/firebase'
import { getRequestedGroup } from './config/groups'
import { getInitialMonth } from './config/months'

export default function App() {
  const group = getRequestedGroup()
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [accessError, setAccessError] = useState('')
  const [monthId, setMonthId] = useState(getInitialMonth)
  const [groupName, setGroupName] = useState(group.name)
  const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID || 'Yic6ABePljY9WtQ5SatIgmz3vEk2'

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setChecking(true)
      if (!currentUser) {
        setUser(null)
        setAuthorized(false)
        setChecking(false)
        return
      }

      try {
        let allowed = currentUser.uid === adminUid
        if (!allowed) {
          const access = await getDoc(doc(db, 'groupAccess', currentUser.uid))
          allowed = access.exists() && access.data().groupId === group.id
        }
        if (!allowed) {
          setAccessError('Your password is correct, but this group access needs to be repaired in the Admin panel.')
          await signOut(auth)
          return
        }
        setAccessError('')
        setUser(currentUser)
        setAuthorized(true)
      } catch (error) {
        console.error('Group access check error', error)
        setAuthorized(false)
        setAccessError('Unable to verify group access. Please ask your teacher to repair it in the Admin panel.')
      } finally {
        setChecking(false)
      }
    })
  }, [adminUid, group.id])

  useEffect(() => {
    if (!authorized) {
      setGroupName(group.name)
      return undefined
    }
    return onSnapshot(doc(db, group.id, 'groupProfile'), (snapshot) => {
      const savedName = snapshot.exists() ? String(snapshot.data().displayName || '').trim() : ''
      setGroupName(savedName || group.name)
    }, (error) => console.error('Group name error', error))
  }, [authorized, group.id, group.name])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('month', monthId)
    window.history.replaceState({}, '', url)
  }, [monthId])

  if (checking) return <div className="app"><div className="loading">Checking access...</div></div>
  if (!user || !authorized) return <div className="app"><GroupLogin group={group} accessError={accessError} onAttempt={() => setAccessError('')} /></div>

  const displayGroup = { ...group, name: groupName }

  return (
    <div className="app">
      <div className="tracker-toolbar"><span><i aria-hidden="true" />Viewing {displayGroup.name}</span><button type="button" className="btn btn-ghost" onClick={()=>signOut(auth)}>Sign out <b aria-hidden="true">↗</b></button></div>
      <header className="hero">
        <div className="hero-text">
          <p className="hero-kicker">{displayGroup.name}</p>
          <p className="hero-welcome">Welcome</p>
          <h1>Step Up!</h1>
          <p className="tag">Do your homework, claim your prize — watch your English rise!</p>
          <p className="hero-teacher">Your teacher Olesia Nikolaevna</p>
        </div>
        <div className="hero-illustration">
          <img src={Corgi} alt="Corgi mascot" className="corgi-png" loading="lazy" />
        </div>
      </header>
      <main>
        <MonthTabs value={monthId} onChange={setMonthId} />
        <TrackerTable group={displayGroup} monthId={monthId} />
      </main>
      
    </div>
  )
}
