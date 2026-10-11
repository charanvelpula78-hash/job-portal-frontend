import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, STATUS_LABELS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function MyApplications() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/applications/candidate/${user.id}`).then(setItems).catch((e) => setError(e.message));
  }, [user.id]);

  return (
    <>
      <h1>My applications</h1>
      {error && <p className="alert">{error}</p>}
      {!items && !error && <p className="muted">Loading…</p>}
      {items && items.length === 0 && (
        <p className="empty">You haven't applied for any jobs yet. <Link to="/">Browse open jobs</Link></p>
      )}
      <ul className="rows">
        {items?.map((a) => (
          <li key={a.id} className="row static">
            <div>
              <h3><Link to={`/jobs/${a.job.id}`}>{a.job.title}</Link></h3>
              <p className="muted">{a.job.company} · {a.job.location}</p>
            </div>
            <div className="row-meta">
              <span className={`status status-${a.status}`}>{STATUS_LABELS[a.status]}</span>
              <span className="muted">Applied {formatDate(a.appliedAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
