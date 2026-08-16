import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function GroupLogin({ group }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, group.accountEmail, password)
    } catch (loginError) {
      console.error('Group login error', loginError)
      setError('Неверный пароль. Проверьте его и попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="group-login-wrap">
      <form className="group-login card" onSubmit={submit}>
        <div className="group-login-badge">{group.id}</div>
        <h2>Вход в {group.name.toLowerCase()}</h2>
        <p>Введите пароль, который вы получили от преподавателя.</p>
        <label>Пароль группы
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading || !password}>
          {loading ? 'Проверяю...' : 'Открыть трекер'}
        </button>
      </form>
    </main>
  )
}
