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
      let credential = null
      let lastError = null
      for (const email of group.accountEmails) {
        try {
          credential = await signInWithEmailAndPassword(auth, email, password)
          break
        } catch (loginError) {
          lastError = loginError
          if (loginError.code !== 'auth/invalid-credential' && loginError.code !== 'auth/wrong-password' && loginError.code !== 'auth/user-not-found') throw loginError
        }
      }
      if (!credential) throw lastError || new Error('No matching group account')
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
