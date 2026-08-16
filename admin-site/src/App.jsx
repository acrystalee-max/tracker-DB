import React, { useEffect, useState } from 'react'
import { auth } from './services/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LoginForm from './components/LoginForm'
import StudentsEditor from './components/StudentsEditor'
import GroupAccessSetup from './components/GroupAccessSetup'
import { GROUPS, getGroup } from './config/groups'

import CorgiSmall from './assets/corgi-small.svg'

export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedGroupId, setSelectedGroupId] = useState('Gr1')
  const [copyMessage, setCopyMessage] = useState('')
  const selectedGroup = getGroup(selectedGroupId)

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
          <div className="title-sub">Управление шестью группами</div>
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
              <section className="group-navigation card">
                <div className="group-tabs" role="tablist" aria-label="Выбор группы">
                  {GROUPS.map((group)=><button
                    key={group.id}
                    type="button"
                    className={group.id === selectedGroupId ? 'group-tab active' : 'group-tab'}
                    onClick={()=>{ setSelectedGroupId(group.id); setCopyMessage('') }}
                  >{group.name}</button>)}
                </div>
                <div className="group-link-row">
                  <div><strong>{selectedGroup.name}</strong><div className="group-link-help">У каждой группы своя ссылка и свой пароль.</div></div>
                  <button type="button" className="btn btn-info" onClick={async()=>{
                    const url = new URL('../tracker/', window.location.href)
                    url.searchParams.set('group', selectedGroup.id)
                    await navigator.clipboard.writeText(url.toString())
                    setCopyMessage('Ссылка скопирована')
                  }}>Скопировать ссылку группы</button>
                  {copyMessage && <span className="copy-message">{copyMessage}</span>}
                </div>
              </section>
              <GroupAccessSetup group={selectedGroup} />
              <StudentsEditor user={user} groupId={selectedGroup.id} />
            </div>
          ) : (
            <LoginForm />
          )
        )}
      </main>
    </div>
  )
}
