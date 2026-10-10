import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ErrorNote } from '../components/Feedback'
import { JOB_TYPES, fmtDate, skillList } from '../components/util'

export default function Jobs() {
  const [filters, setFilters] = useState({ keyword: '', location: '', type: '' })
  const [applied, setApplied] = useState(filters)
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.searchJobs({ ...applied, page, size: 8 }).then(setData).catch((e) => setError(e.message))
  }, [applied, page])

  const search = (e) => {
    e?.preventDefault()
    setPage(0)
    setApplied(filters)
  }
  const pickType = (type) => {
    const next = { ...filters, type }
    setFilters(next)
    setPage(0)
    setApplied(next)
  }

  return (
    <>
      <section className="finder">
        <h1>Find work that fits your skills</h1>
        <form className="searchbar" onSubmit={search}>
          <input placeholder="Job title or skill, e.g. Java, designer" aria-label="Keyword"
            value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
          <input placeholder="City or 'Remote'" aria-label="Location"
            value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          <button className="btn">Search jobs</button>
        </form>
      </section>

      <div className="split">
        <aside className="filters">
          <h3>Job type</h3>
          {['', ...JOB_TYPES].map((t) => (
            <button key={t || 'all'} className={`filter ${filters.type === t ? 'on' : ''}`} onClick={() => pickType(t)}>
              {t || 'All types'}
            </button>
          ))}
        </aside>

        <section>
          <ErrorNote>{error}</ErrorNote>
          {!data && !error && <p className="muted">Loading jobs...</p>}
          {data && (
            <>
              <p className="muted count">{data.totalElements} {data.totalElements === 1 ? 'job' : 'jobs'} found</p>
              {data.content.length === 0 && (
                <div className="empty">
                  <h3>No jobs match your search</h3>
                  <p>Try a broader keyword or clear the location and job type.</p>
                </div>
              )}
              <ul className="joblist">
                {data.content.map((j) => (
                  <li key={j.id}>
                    <Link to={`/jobs/${j.id}`} className="jobrow">
                      <div>
                        <h3>{j.title}</h3>
                        <div className="company">{j.companyName}</div>
                        <div className="chips">
                          {skillList(j.skills).slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}
                        </div>
                      </div>
                      <div className="jobmeta">
                        {j.location && <span>{j.location}</span>}
                        {j.jobType && <span>{j.jobType}</span>}
                        {j.salary && <strong>{j.salary}</strong>}
                        <span className="muted">{fmtDate(j.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {data.totalPages > 1 && (
                <div className="pager">
                  <button className="btn ghost small" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
                  <span>Page {data.page + 1} of {data.totalPages}</span>
                  <button className="btn ghost small" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
