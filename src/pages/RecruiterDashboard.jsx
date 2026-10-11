import { useEffect, useState } from 'react';
import { api, formatDate, STATUS_LABELS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const EMPTY = { title: '', location: '', jobType: 'Full-time', salary: '', description: '' };

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [openJob, setOpenJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const loadJobs = () =>
    api.get(`/jobs/recruiter/${user.id}`).then(setJobs).catch((e) => setError(e.message));

  useEffect(() => { loadJobs(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/jobs', { ...form, company: user.company || user.name, recruiterId: user.id });
      setForm(EMPTY);
      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleApplicants = async (job) => {
    if (openJob === job.id) return setOpenJob(null);
    setOpenJob(job.id);
    setApplicants(await api.get(`/applications/job/${job.id}`));
  };

  const setStatus = async (appId, status) => {
    const updated = await api.put(`/applications/${appId}/status`, { status });
    setApplicants((list) => list.map((a) => (a.id === appId ? updated : a)));
  };

  const toggleActive = async (job) => {
    await api.put(`/jobs/${job.id}/active?value=${!job.active}`);
    loadJobs();
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and all of its applications?`)) return;
    await api.del(`/jobs/${job.id}`);
    if (openJob === job.id) setOpenJob(null);
    loadJobs();
  };

  return (
    <>
      <h1>Recruiter dashboard</h1>

      <section>
        <h2>Post a vacancy</h2>
        <form className="form" onSubmit={post}>
          <div className="grid2">
            <label>Job title<input required value={form.title} onChange={set('title')} /></label>
            <label>Location<input required value={form.location} onChange={set('location')} /></label>
            <label>Job type
              <select value={form.jobType} onChange={set('jobType')}>
                <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
              </select>
            </label>
            <label>Salary (optional)<input value={form.salary} onChange={set('salary')} placeholder="e.g. 6-8 LPA" /></label>
          </div>
          <label>Description<textarea required rows="5" value={form.description} onChange={set('description')} /></label>
          {error && <p className="alert">{error}</p>}
          <button className="btn">Post job</button>
        </form>
      </section>

      <section>
        <h2>Your vacancies</h2>
        {jobs.length === 0 && <p className="empty">You haven't posted any jobs yet. Use the form above to post your first one.</p>}
        <ul className="rows">
          {jobs.map((j) => (
            <li key={j.id} className="block">
              <div className="row static">
                <div>
                  <h3>{j.title} {!j.active && <span className="tag tag-off">Closed</span>}</h3>
                  <p className="muted">{j.location} · {j.jobType} · Posted {formatDate(j.postedAt)}</p>
                </div>
                <div className="actions">
                  <button className="btn btn-quiet" onClick={() => toggleApplicants(j)}>
                    {openJob === j.id ? 'Hide applicants' : 'View applicants'}
                  </button>
                  <button className="btn btn-quiet" onClick={() => toggleActive(j)}>{j.active ? 'Close job' : 'Reopen job'}</button>
                  <button className="btn btn-danger" onClick={() => remove(j)}>Delete</button>
                </div>
              </div>

              {openJob === j.id && (
                <div className="applicants">
                  {applicants.length === 0 && <p className="muted">No one has applied yet.</p>}
                  {applicants.map((a) => (
                    <div key={a.id} className="applicant">
                      <div>
                        <strong>{a.candidate.name}</strong>
                        <p className="muted">{a.candidate.email}{a.candidate.phone ? ` · ${a.candidate.phone}` : ''}</p>
                        {a.candidate.skills && <p>Skills: {a.candidate.skills}</p>}
                        {a.coverNote && <p className="prose">“{a.coverNote}”</p>}
                        <p className="muted">Applied {formatDate(a.appliedAt)}</p>
                      </div>
                      <label className="status-pick">
                        Status
                        <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
                          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
