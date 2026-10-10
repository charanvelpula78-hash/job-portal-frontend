import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, downloadResume } from '../api'
import { ErrorNote } from '../components/Feedback'
import StatusBadge from '../components/StatusBadge'
import { fmtDate, skillList } from '../components/util'

const STATUSES = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED']
const LABEL = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', SELECTED: 'Selected', REJECTED: 'Rejected' }

export default function Applicants() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.getJob(id).then(setJob).catch(() => {})
    api.applicantsFor(id).then(setList).catch((e) => setError(e.message))
  }, [id])

  const change = async (a, status) => {
    setError('')
    try {
      const updated = await api.setStatus(a.id, status)
      setList(list.map((x) => (x.id === a.id ? updated : x)))
    } catch (e) { setError(e.message) }
  }

  const shown = list?.filter((a) => filter === 'ALL' || a.status === filter)

  return (
    <div className="narrow wide">
      <Link to="/recruiter" className="back">My jobs</Link>
      <h1>Applicants{job ? `: ${job.title}` : ''}</h1>
      <ErrorNote>{error}</ErrorNote>

      {list && (
        <div className="tabs">
          {['ALL', ...STATUSES].map((s) => (
            <button key={s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'All' : LABEL[s]} ({s === 'ALL' ? list.length : list.filter((a) => a.status === s).length})
            </button>
          ))}
        </div>
      )}

      {!list && !error && <p className="muted">Loading...</p>}
      {shown && shown.length === 0 && (
        <div className="empty"><h3>No applicants here</h3><p>Applications will appear as candidates apply.</p></div>
      )}

      {shown?.map((a) => (
        <article key={a.id} className="panel applicant">
          <div className="headrow">
            <div>
              <h3>{a.candidateName}</h3>
              <div className="muted">{a.candidateEmail}{a.phone ? ` · ${a.phone}` : ''} · applied {fmtDate(a.appliedAt)}</div>
              {a.headline && <p>{a.headline}</p>}
            </div>
            <StatusBadge status={a.status} />
          </div>
          {skillList(a.skills).length > 0 && (
            <div className="chips">{skillList(a.skills).map((s) => <span key={s} className="chip">{s}</span>)}</div>
          )}
          {a.education && <p><strong>Education:</strong> {a.education}</p>}
          {a.experience && <p><strong>Experience:</strong> {a.experience}</p>}
          {a.coverLetter && <blockquote>{a.coverLetter}</blockquote>}
          <div className="actions">
            <label className="inline">Status
              <select value={a.status} onChange={(e) => change(a, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
              </select>
            </label>
            {a.hasResume
              ? <button className="btn ghost small" onClick={() => downloadResume(a.candidateId).catch((e) => setError(e.message))}>Download resume</button>
              : <span className="muted">No resume uploaded</span>}
          </div>
        </article>
      ))}
    </div>
  )
}
