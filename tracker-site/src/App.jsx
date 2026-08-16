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
  const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID || 'Yic6ABeP1jY9WtQ5SatIgmz3vEk2'

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

  if (checking) return <div className="app"><div className="loading">Проверяю доступ...</div></div>
  if (!user || !authorized) return <div className="app"><GroupLogin group={group} /></div>

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <h1>English Homework Tracker</h1>
          <h2>Welcome to {group.name}</h2>
          <p className="tag">Learn, practise and make progress!</p>
        </div>
        <div className="hero-illustration">
          <img src={Corgi} alt="Corgi mascot" className="corgi-png" loading="lazy" />
        </div>
      </header>
      <main>
        <div className="tracker-toolbar"><span>Открыта {group.name.toLowerCase()}</span><button type="button" className="btn btn-ghost" onClick={()=>signOut(auth)}>Выйти</button></div>
        <TrackerTable group={group} />
      </main>
      
    </div>
  )
}
