import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ErrorNote } from '../components/Feedback'
import { fmtDate } from '../components/util'

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState(null)
  const [error, setError] = useState('')

  const load = () => api.myJobs().then(setJobs).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and its ${job.applicantCount} application(s)?`)) return
    try { await api.deleteJob(job.id); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="narrow wide">
      <div className="headrow">
        <h1>My job postings</h1>
        <Link className="btn" to="/recruiter/jobs/new">Post a job</Link>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!jobs && !error && <p className="muted">Loading...</p>}
      {jobs && jobs.length === 0 && (
        <div className="empty">
          <h3>No jobs posted yet</h3>
          <p>Post your first opening and candidates can start applying.</p>
          <Link className="btn" to="/recruiter/jobs/new">Post a job</Link>
        </div>
      )}
      {jobs && jobs.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Location</th><th>Posted</th><th>Applicants</th><th>Visibility</th><th></th></tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                <td>{j.location || '-'}</td>
                <td>{fmtDate(j.createdAt)}</td>
                <td><Link to={`/recruiter/jobs/${j.id}/applicants`}>{j.applicantCount} view</Link></td>
                <td>{j.active ? 'Live' : <span title="Hidden by an administrator">Hidden</span>}</td>
                <td className="actions">
                  <Link className="btn ghost small" to={`/recruiter/jobs/${j.id}/edit`}>Edit</Link>
                  <button className="btn danger small" onClick={() => remove(j)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
