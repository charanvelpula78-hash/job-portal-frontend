import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { ErrorNote } from '../components/Feedback'
import { JOB_TYPES } from '../components/util'

const EMPTY = { title: '', description: '', location: '', jobType: 'Full-time', salary: '', skills: '', experience: '' }

export default function JobForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (id) {
      api.getJob(id).then((j) => setForm({
        title: j.title, description: j.description, location: j.location || '',
        jobType: j.jobType || 'Full-time', salary: j.salary || '', skills: j.skills || '', experience: j.experience || '',
      })).catch((e) => setError(e.message))
    }
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      if (id) await api.updateJob(id, form)
      else await api.createJob(form)
      navigate('/recruiter')
    } catch (err) {
      setError(err.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="narrow">
      <h1>{id ? 'Edit job' : 'Post a job'}</h1>
      <ErrorNote>{error}</ErrorNote>
      <form className="panel stack" onSubmit={submit}>
        <label>Job title
          <input value={form.title} onChange={set('title')} required />
        </label>
        <label>Description
          <textarea rows={8} value={form.description} onChange={set('description')} required
            placeholder="What will the person do? What do you expect from them?" />
        </label>
        <div className="row2">
          <label>Location
            <input value={form.location} onChange={set('location')} placeholder="Hyderabad, or Remote" />
          </label>
          <label>Job type
            <select value={form.jobType} onChange={set('jobType')}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <div className="row2">
          <label>Salary
            <input value={form.salary} onChange={set('salary')} placeholder="e.g. 6-8 LPA" />
          </label>
          <label>Experience
            <input value={form.experience} onChange={set('experience')} placeholder="e.g. 0-2 years" />
          </label>
        </div>
        <label>Skills (comma separated)
          <input value={form.skills} onChange={set('skills')} placeholder="Java, Spring Boot, MySQL" />
        </label>
        <div className="actions">
          <button className="btn" disabled={busy}>{busy ? 'Saving...' : id ? 'Save changes' : 'Publish job'}</button>
          <button type="button" className="btn ghost" onClick={() => navigate('/recruiter')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
