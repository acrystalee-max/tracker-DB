import React, { useState } from 'react'
import { signInWithEmail } from '../services/authService'

export default function LoginForm(){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await signInWithEmail(email, password)
    }catch(e){
      console.error(e)
      setError('Unable to sign in. Check your email and password.')
    }finally{setLoading(false)}
  }

  return (
    <div className="card">
      <h3>Admin sign in</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleLogin}>
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  )
}
