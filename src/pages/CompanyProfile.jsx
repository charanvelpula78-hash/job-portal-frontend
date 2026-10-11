import { useEffect, useState } from 'react'
import { api } from '../api'
import { ErrorNote, OkNote } from '../components/Feedback'

export default function CompanyProfile() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    api.getCompany().then((c) => setForm({
      companyName: c.companyName || '', website: c.website || '', location: c.location || '', description: c.description || '',
    })).catch((e) => setError(e.message))
  }, [])

  if (!form) return error ? <ErrorNote>{error}</ErrorNote> : <p className="muted">Loading...</p>
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    try { await api.saveCompany(form); setOk('Company profile saved.') } catch (err) { setError(err.message) }
  }

  return (
    <div className="narrow">
      <h1>Company profile</h1>
      <p className="muted">This name is shown on every job you post.</p>
      <ErrorNote>{error}</ErrorNote>
      <OkNote>{ok}</OkNote>
      <form className="panel stack" onSubmit={save}>
        <label>Company name
          <input value={form.companyName} onChange={set('companyName')} required />
        </label>
        <div className="row2">
          <label>Website
            <input value={form.website} onChange={set('website')} placeholder="https://" />
          </label>
          <label>Location
            <input value={form.location} onChange={set('location')} />
          </label>
        </div>
        <label>About the company
          <textarea rows={5} value={form.description} onChange={set('description')} />
        </label>
        <button className="btn">Save company</button>
      </form>
    </div>
  )
}
