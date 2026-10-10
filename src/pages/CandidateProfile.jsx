import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { downloadResume } from '../api'
import { ErrorNote, OkNote } from '../components/Feedback'

export default function CandidateProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    api.getCandidate().then((p) => setForm({
      headline: p.headline || '', phone: p.phone || '', location: p.location || '',
      skills: p.skills || '', education: p.education || '', experience: p.experience || '',
      resumeName: p.resumeName || '',
    })).catch((e) => setError(e.message))
  }, [])

  if (!form) return error ? <ErrorNote>{error}</ErrorNote> : <p className="muted">Loading...</p>
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    try {
      await api.saveCandidate(form)
      setOk('Profile saved.')
    } catch (err) { setError(err.message) }
  }

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(''); setOk('')
    try {
      const p = await api.uploadResume(file)
      setForm({ ...form, resumeName: p.resumeName || '' })
      setOk('Resume uploaded.')
    } catch (err) { setError(err.message) }
    fileRef.current.value = ''
  }

  return (
    <div className="narrow">
      <h1>My profile</h1>
      <p className="muted">{user.name} · {user.email}</p>
      <ErrorNote>{error}</ErrorNote>
      <OkNote>{ok}</OkNote>

      <form className="panel stack" onSubmit={save}>
        <label>Headline
          <input value={form.headline} onChange={set('headline')} placeholder="e.g. Final-year CSE student, Java and React" />
        </label>
        <div className="row2">
          <label>Phone
            <input value={form.phone} onChange={set('phone')} />
          </label>
          <label>Location
            <input value={form.location} onChange={set('location')} />
          </label>
        </div>
        <label>Skills (comma separated)
          <input value={form.skills} onChange={set('skills')} placeholder="Java, Spring Boot, React, MySQL" />
        </label>
        <label>Education
          <textarea rows={3} value={form.education} onChange={set('education')} />
        </label>
        <label>Experience
          <textarea rows={4} value={form.experience} onChange={set('experience')} />
        </label>
        <button className="btn">Save profile</button>
      </form>

      <div className="panel stack">
        <h3>Resume</h3>
        {form.resumeName ? (
          <p>
            Current file: <strong>{form.resumeName}</strong>{' '}
            <button className="link" onClick={() => downloadResume(user.id).catch((e) => setError(e.message))}>Download</button>
          </p>
        ) : <p className="muted">No resume uploaded yet.</p>}
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={upload} />
        <small className="muted">PDF, DOC or DOCX, up to 5 MB. Uploading again replaces the old file.</small>
      </div>
    </div>
  )
}
