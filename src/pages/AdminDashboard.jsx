import { useEffect, useState } from 'react';
import { api, formatDate } from '../api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/jobs')])
      .then(([s, u, j]) => { setStats(s); setUsers(u); setJobs(j); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their jobs and applications will be deleted too.`)) return;
    try { await api.del(`/admin/users/${u.id}`); load(); } catch (e) { setError(e.message); }
  };

  const removeJob = async (j) => {
    if (!window.confirm(`Delete "${j.title}" and its applications?`)) return;
    try { await api.del(`/admin/jobs/${j.id}`); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <h1>Administration</h1>
      {error && <p className="alert">{error}</p>}

      {stats && (
        <dl className="stats">
          <div><dt>Candidates</dt><dd>{stats.candidates}</dd></div>
          <div><dt>Recruiters</dt><dd>{stats.recruiters}</dd></div>
          <div><dt>Job postings</dt><dd>{stats.jobs}</dd></div>
          <div><dt>Applications</dt><dd>{stats.applications}</dd></div>
        </dl>
      )}

      <h2>Users</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role.toLowerCase()}</td>
                <td>{u.role !== 'ADMIN' && <button className="btn btn-danger" onClick={() => removeUser(u)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Job postings</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Posted</th><th></th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td><td>{j.company}</td><td>{j.location}</td><td>{formatDate(j.postedAt)}</td>
                <td><button className="btn btn-danger" onClick={() => removeJob(j)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
