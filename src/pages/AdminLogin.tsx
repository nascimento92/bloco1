import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/moradores'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (login(pin)) {
      navigate(from, { replace: true })
    } else {
      setError('PIN incorreto. Tente novamente.')
      setPin('')
    }
    setLoading(false)
  }

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <h2>🔐 Acesso Administrativo</h2>
        <p className="login-subtitle">Insira o PIN para continuar</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={8}
              value={pin}
              onChange={e => setPin(e.target.value)}
              className={error ? 'input-error' : ''}
              autoFocus
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading || pin.length === 0}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
