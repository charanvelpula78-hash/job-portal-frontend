import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ErrorNote } from '../components/Feedback'
import StatusBadge from '../components/StatusBadge'
import { fmtDate } from '../components/util'

export default function MyApplications() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.myApplications().then(setList).catch((e) => setError(e.message))
  }, [])

  return (
    <div className="narrow">
      <h1>My applications</h1>
      <ErrorNote>{error}</ErrorNote>
      {!list && !error && <p className="muted">Loading...</p>}
      {list && list.length === 0 && (
        <div className="empty">
          <h3>You haven't applied for anything yet</h3>
          <p><Link to="/jobs">Browse open jobs</Link> and apply to the ones that fit.</p>
        </div>
      )}
      {list && list.length > 0 && (
        <ul className="joblist">
          {list.map((a) => (
            <li key={a.id} className="jobrow static">
              <div>
                <h3><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></h3>
                <div className="company">{a.companyName}</div>
                <span className="muted">Applied {fmtDate(a.appliedAt)}</span>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
