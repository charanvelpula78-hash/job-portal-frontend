import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { homeFor, useAuth } from '../auth'
import { ErrorNote } from '../components/Feedback'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await api.login(form)
      signIn(res)
      navigate(location.state?.from || homeFor(res.user.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth" onSubmit={submit}>
        <h1>Log in</h1>
        <p className="muted">Use the account you registered as a candidate or recruiter.</p>
        <ErrorNote>{error}</ErrorNote>
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} required autoFocus />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="muted center">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  )
}
