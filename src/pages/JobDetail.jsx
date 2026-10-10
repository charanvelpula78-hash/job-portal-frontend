import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ErrorNote, OkNote } from '../components/Feedback'
import { fmtDate, skillList } from '../components/util'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  const [cover, setCover] = useState('')
  const [applied, setApplied] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.getJob(id).then(setJob).catch((e) => setError(e.message))
  }, [id])

  // Find out whether this candidate already applied.
  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      api.myApplications().then((list) => setApplied(list.some((a) => String(a.jobId) === String(id)))).catch(() => {})
    }
  }, [user, id])

  const apply = async () => {
    setError('')
    setBusy(true)
    try {
      await api.apply(id, cover)
      setApplied(true)
      setMsg('Application sent. You can follow its status under My applications.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !job) return <div className="empty"><h2>Job not available</h2><p>{error}</p><Link to="/jobs">Back to all jobs</Link></div>
  if (!job) return <p className="muted">Loading...</p>

  return (
    <div className="detail">
      <article>
        <Link to="/jobs" className="back">All jobs</Link>
        <h1>{job.title}</h1>
        <p className="company">{job.companyName}</p>
        <div className="chips">
          {job.location && <span className="chip solid">{job.location}</span>}
          {job.jobType && <span className="chip solid">{job.jobType}</span>}
          {job.experience && <span className="chip solid">{job.experience}</span>}
          {job.salary && <span className="chip solid">{job.salary}</span>}
        </div>

        <h3>About the role</h3>
        <p className="prose">{job.description}</p>

        {skillList(job.skills).length > 0 && (
          <>
            <h3>Skills needed</h3>
            <div className="chips">{skillList(job.skills).map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </>
        )}
        <p className="muted">Posted {fmtDate(job.createdAt)}</p>
      </article>

      <aside className="panel applybox">
        {!user && (
          <>
            <h3>Interested in this role?</h3>
            <p className="muted">Log in as a candidate to apply.</p>
            <button className="btn" onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}>Log in to apply</button>
            <Link to="/register" className="center muted">Create an account</Link>
          </>
        )}
        {user?.role === 'CANDIDATE' && (
          applied ? (
            <>
              <h3>You applied for this job</h3>
              <OkNote>{msg}</OkNote>
              <Link className="btn ghost" to="/applications">View my applications</Link>
            </>
          ) : (
            <>
              <h3>Apply for this job</h3>
              <ErrorNote>{error}</ErrorNote>
              <label>Cover note (optional)
                <textarea rows={5} value={cover} onChange={(e) => setCover(e.target.value)}
                  placeholder="Tell the recruiter why you are a good fit." />
              </label>
              <button className="btn" onClick={apply} disabled={busy}>{busy ? 'Sending...' : 'Send application'}</button>
              <small className="muted">Your profile and resume are shared with the recruiter. <Link to="/profile">Update profile</Link></small>
            </>
          )
        )}
        {user && user.role !== 'CANDIDATE' && (
          <p className="muted">Only candidate accounts can apply for jobs.</p>
        )}
      </aside>
    </div>
  )
}
