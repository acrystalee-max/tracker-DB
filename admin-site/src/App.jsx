import React, { useEffect, useState } from 'react'
import { auth } from './services/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LoginForm from './components/LoginForm'
import StudentsEditor from './components/StudentsEditor'

import CorgiSmall from './assets/corgi-small.svg'

export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=>{
      setUser(u)
      setLoading(false)
    })
    return unsub
  },[])

  return (
    <div className="app">
      <header className="admin-header">
        <div className="admin-title">
          <div className="title-main">English Tracker Admin</div>
          <div className="title-sub">Group Gr1 Management</div>
        </div>
        <div className="header-right">
          <img src={CorgiSmall} alt="corgi" className="corgi-small" />
        </div>
      </header>
      <main>
        {loading ? <div className="loading">Проверка сессии...</div> : (
          user ? (
            <div>
              <div className="controls">
                <button onClick={()=>signOut(auth)}>Выйти</button>
              </div>
              <StudentsEditor user={user} />
            </div>
          ) : (
            <LoginForm />
          )
        )}
      </main>
    </div>
  )
}
