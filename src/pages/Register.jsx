import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { homeFor, useAuth } from '../auth'
import { ErrorNote } from '../components/Feedback'

export default function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CANDIDATE', companyName: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await api.register(form)
      signIn(res)
      navigate(homeFor(res.user.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth" onSubmit={submit}>
        <h1>Create your account</h1>
        <ErrorNote>{error}</ErrorNote>

        <div className="segmented" role="radiogroup" aria-label="Account type">
          <button type="button" role="radio" aria-checked={form.role === 'CANDIDATE'}
            className={form.role === 'CANDIDATE' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'CANDIDATE' })}>
            I'm looking for a job
          </button>
          <button type="button" role="radio" aria-checked={form.role === 'RECRUITER'}
            className={form.role === 'RECRUITER' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'RECRUITER' })}>
            I'm hiring
          </button>
        </div>

        <label>Full name
          <input value={form.name} onChange={set('name')} required />
        </label>
        {form.role === 'RECRUITER' && (
          <label>Company name
            <input value={form.companyName} onChange={set('companyName')} required />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
          <small className="muted">At least 6 characters</small>
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  )
}
