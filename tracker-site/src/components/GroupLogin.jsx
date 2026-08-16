import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function GroupLogin({ group, accessError = '', onAttempt }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    onAttempt?.()
    try {
      await signInWithEmailAndPassword(auth, group.accountEmail, password)
    } catch (loginError) {
      console.error('Group login error', loginError)
      setError('Incorrect password. Check it and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="group-login-wrap">
      <form className="group-login card" onSubmit={submit}>
        <div className="group-login-badge">{group.id}</div>
        <h2>Sign in to {group.name}</h2>
        <p>Enter the password provided by your teacher.</p>
        <label>Group password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </label>
        {(error || accessError) && <div className="login-error">{error || accessError}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading || !password}>
          {loading ? 'Checking...' : 'Open tracker'}
        </button>
      </form>
    </main>
  )
}
