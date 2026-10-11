import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(setJob).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      api.get(`/applications/candidate/${user.id}`)
        .then((list) => setApplied(list.some((a) => String(a.job.id) === String(id))))
        .catch(() => {});
    }
  }, [user, id]);

  const apply = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/applications', { jobId: Number(id), candidateId: user.id, coverNote });
      setApplied(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!job) return error ? <p className="alert">{error}</p> : <p className="muted">Loading job…</p>;

  return (
    <article className="detail">
      <Link to="/" className="muted">Back to all jobs</Link>
      <h1>{job.title}</h1>
      <p className="lede">{job.company} · {job.location}</p>
      <p className="facts">
        {job.jobType && <span className="tag">{job.jobType}</span>}
        {job.salary && <span>{job.salary}</span>}
        <span className="muted">Posted {formatDate(job.postedAt)}</span>
      </p>

      <h2>About the role</h2>
      <p className="prose">{job.description}</p>

      <section className="apply">
        {!user && (
          <p><Link to="/login">Sign in</Link> as a candidate to apply for this job.</p>
        )}
        {user && user.role !== 'CANDIDATE' && <p className="muted">Only candidate accounts can apply for jobs.</p>}
        {user?.role === 'CANDIDATE' && applied && (
          <p className="ok">You've applied for this job. Track it under <Link to="/applications">My applications</Link>.</p>
        )}
        {user?.role === 'CANDIDATE' && !applied && (
          <form onSubmit={apply}>
            <label>
              Cover note (optional)
              <textarea rows="5" value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell the recruiter why you're a good fit." />
            </label>
            {error && <p className="alert">{error}</p>}
            <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Apply for this job'}</button>
          </form>
        )}
      </section>
    </article>
  );
}
