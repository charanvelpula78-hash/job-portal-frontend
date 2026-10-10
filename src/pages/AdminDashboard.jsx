import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ErrorNote } from '../components/Feedback'
import { fmtDate } from '../components/util'

export default function AdminDashboard() {
  const { user: me } = useAuth()
  const [tab, setTab] = useState('users')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [error, setError] = useState('')

  const loadAll = () => {
    api.stats().then(setStats).catch((e) => setError(e.message))
    api.adminUsers().then(setUsers).catch((e) => setError(e.message))
    api.adminJobs().then(setJobs).catch((e) => setError(e.message))
  }
  useEffect(loadAll, [])

  const run = async (fn) => {
    setError('')
    try { await fn(); loadAll() } catch (e) { setError(e.message) }
  }

  return (
    <div className="narrow wide">
      <h1>Administration</h1>
      <ErrorNote>{error}</ErrorNote>

      {stats && (
        <dl className="stats">
          <div><dd>{stats.candidates}</dd><dt>Candidates</dt></div>
          <div><dd>{stats.recruiters}</dd><dt>Recruiters</dt></div>
          <div><dd>{stats.activeJobs}<small>/{stats.jobs}</small></dd><dt>Live jobs</dt></div>
          <div><dd>{stats.applications}</dd><dt>Applications</dt></div>
        </dl>
      )}

      <div className="tabs">
        <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'jobs' ? 'on' : ''} onClick={() => setTab('jobs')}>Job postings</button>
      </div>

      {tab === 'users' && users && (
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role.charAt(0) + u.role.slice(1).toLowerCase()}</td>
                <td>{fmtDate(u.createdAt)}</td>
                <td>{u.active ? 'Active' : <strong>Blocked</strong>}</td>
                <td className="actions">
                  {u.id !== me.id && u.role !== 'ADMIN' && (
                    <>
                      <button className="btn ghost small" onClick={() => run(() => api.setUserActive(u.id, !u.active))}>
                        {u.active ? 'Block' : 'Unblock'}
                      </button>
                      <button className="btn danger small" onClick={() => {
                        if (window.confirm(`Delete ${u.name}? Their jobs and applications are deleted too.`)) run(() => api.deleteUser(u.id))
                      }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'jobs' && jobs && (
        jobs.length === 0 ? <div className="empty"><h3>No job postings yet</h3></div> : (
          <table className="table">
            <thead><tr><th>Title</th><th>Company</th><th>Posted</th><th>Applicants</th><th>Visibility</th><th></th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                  <td>{j.companyName}</td>
                  <td>{fmtDate(j.createdAt)}</td>
                  <td>{j.applicantCount}</td>
                  <td>{j.active ? 'Live' : <strong>Hidden</strong>}</td>
                  <td className="actions">
                    <button className="btn ghost small" onClick={() => run(() => api.setJobActive(j.id, !j.active))}>
                      {j.active ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn danger small" onClick={() => {
                      if (window.confirm(`Delete "${j.title}" permanently?`)) run(() => api.adminDeleteJob(j.id))
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  )
}
