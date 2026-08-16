import React, { useEffect, useState } from 'react'
import { auth } from './services/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LoginForm from './components/LoginForm'
import StudentsEditor from './components/StudentsEditor'
import GroupAccessSetup from './components/GroupAccessSetup'
import MonthTabs from './components/MonthTabs'
import { GROUPS, getGroup } from './config/groups'
import { getCurrentMonthId } from './config/months'
import { saveGroupName, subscribeGroupNames } from './services/groupService'

import CorgiSmall from './assets/corgi-small.svg'

export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedGroupId, setSelectedGroupId] = useState('Gr1')
  const [selectedMonthId, setSelectedMonthId] = useState(getCurrentMonthId)
  const [copyMessage, setCopyMessage] = useState('')
  const [groupNames, setGroupNames] = useState({})
  const [groupNameDraft, setGroupNameDraft] = useState('')
  const [groupNameMessage, setGroupNameMessage] = useState('')
  const baseGroup = getGroup(selectedGroupId)
  const selectedGroup = { ...baseGroup, name: groupNames[selectedGroupId] || baseGroup.name }

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=>{
      setUser(u)
      setLoading(false)
    })
    return unsub
  },[])

  useEffect(() => {
    if (!user) return undefined
    return subscribeGroupNames(setGroupNames, (error) => console.error('Group names error', error))
  }, [user])

  useEffect(() => {
    setGroupNameDraft(selectedGroup.name)
    setGroupNameMessage('')
  }, [selectedGroupId, selectedGroup.name])

  return (
    <div className="app">
      <header className="admin-header">
        <div className="admin-title">
          <div className="title-main">English Tracker Admin</div>
          <div className="title-sub">Manage six groups</div>
        </div>
        <div className="header-right">
          <img src={CorgiSmall} alt="corgi" className="corgi-small" />
        </div>
      </header>
      <main>
        {loading ? <div className="loading">Checking session...</div> : (
          user ? (
            <div>
              <div className="controls">
                <button onClick={()=>signOut(auth)}>Sign out</button>
              </div>
              <section className="group-navigation card">
                <div className="group-tabs" role="tablist" aria-label="Choose a group">
                  {GROUPS.map((group)=><button
                    key={group.id}
                    type="button"
                    className={group.id === selectedGroupId ? 'group-tab active' : 'group-tab'}
                    onClick={()=>{ setSelectedGroupId(group.id); setCopyMessage('') }}
                  >{groupNames[group.id] || group.name}</button>)}
                </div>
                <div className="group-link-row">
                  <div className="group-name-editor">
                    <label>Group name
                      <input maxLength="40" value={groupNameDraft} onChange={(event) => setGroupNameDraft(event.target.value)} />
                    </label>
                    <button type="button" className="btn btn-primary" onClick={async()=>{
                      setGroupNameMessage('')
                      try {
                        const savedName = await saveGroupName(selectedGroup.id, groupNameDraft)
                        setGroupNames((current) => ({ ...current, [selectedGroup.id]: savedName }))
                        setGroupNameMessage('Name saved')
                      } catch (error) {
                        setGroupNameMessage(error.message || 'Unable to save name')
                      }
                    }}>Save name</button>
                    {groupNameMessage && <span className="copy-message">{groupNameMessage}</span>}
                  </div>
                  <button type="button" className="btn btn-info" onClick={async()=>{
                    const url = new URL('../tracker/', window.location.href)
                    url.searchParams.set('group', selectedGroup.id)
                    url.searchParams.set('month', selectedMonthId)
                    await navigator.clipboard.writeText(url.toString())
                    setCopyMessage('Link copied')
                  }}>Copy group link</button>
                  {copyMessage && <span className="copy-message">{copyMessage}</span>}
                </div>
              </section>
              <GroupAccessSetup group={selectedGroup} />
              <MonthTabs value={selectedMonthId} onChange={setSelectedMonthId} />
              <StudentsEditor user={user} groupId={selectedGroup.id} monthId={selectedMonthId} />
            </div>
          ) : (
            <LoginForm />
          )
        )}
      </main>
    </div>
  )
}
