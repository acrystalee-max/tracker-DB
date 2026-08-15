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
      setError('Не удалось войти. Проверьте email и пароль.')
    }finally{setLoading(false)}
  }

  return (
    <div className="card">
      <h3>Вход в админ-панель</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleLogin}>
        <label>Электронная почта<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Пароль<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        <button type="submit" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
      </form>
    </div>
  )
}
