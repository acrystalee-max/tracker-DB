import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import TrackerTable from './components/TrackerTable'
import GroupLogin from './components/GroupLogin'
import Corgi from './assets/london-corgi.webp'
import { auth, db } from './services/firebase'
import { getRequestedGroup } from './config/groups'

export default function App() {
  const group = getRequestedGroup()
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
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
          await signOut(auth)
          return
        }
        setUser(currentUser)
        setAuthorized(true)
      } catch (error) {
        console.error('Group access check error', error)
        setAuthorized(false)
      } finally {
        setChecking(false)
      }
    })
  }, [adminUid, group.id])

  if (checking) return <div className="app"><div className="loading">Checking access...</div></div>
  if (!user || !authorized) return <div className="app"><GroupLogin group={group} /></div>

  return (
    <div className="app">
      <div className="tracker-toolbar"><span><i aria-hidden="true" />Viewing {group.name}</span><button type="button" className="btn btn-ghost" onClick={()=>signOut(auth)}>Sign out <b aria-hidden="true">↗</b></button></div>
      <header className="hero">
        <div className="hero-text">
          <p className="hero-kicker">Welcome to {group.name}</p>
          <h1>Achievement Academy</h1>
          <p className="tag">Complete your homework, earn XP and unlock rewards!</p>
        </div>
        <div className="hero-illustration">
          <img src={Corgi} alt="Corgi mascot" className="corgi-png" loading="lazy" />
        </div>
      </header>
      <main>
        <TrackerTable group={group} />
      </main>
      
    </div>
  )
}
