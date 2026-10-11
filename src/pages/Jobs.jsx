import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../api.js';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (kw = keyword, loc = location) => {
    setLoading(true);
    setError('');
    api
      .get(`/jobs?keyword=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc)}`)
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load('', ''); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const clear = () => {
    setKeyword('');
    setLocation('');
    load('', '');
  };

  return (
    <>
      <h1>Find your next role</h1>
      <p className="lede">Search open positions by job title or company, and narrow them by city.</p>

      <form className="search" onSubmit={onSearch}>
        <label>
          Title or company
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. Java developer" />
        </label>
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad" />
        </label>
        <button className="btn" type="submit">Search jobs</button>
        {(keyword || location) && <button className="btn btn-quiet" type="button" onClick={clear}>Clear</button>}
      </form>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="muted">Loading jobs…</p>}
      {!loading && !error && jobs.length === 0 && (
        <p className="empty">No jobs match your search. Try a different title or clear the location.</p>
      )}

      <ul className="rows">
        {jobs.map((j) => (
          <li key={j.id}>
            <Link to={`/jobs/${j.id}`} className="row">
              <div>
                <h3>{j.title}</h3>
                <p className="muted">{j.company} · {j.location}</p>
              </div>
              <div className="row-meta">
                {j.jobType && <span className="tag">{j.jobType}</span>}
                {j.salary && <span>{j.salary}</span>}
                <span className="muted">Posted {formatDate(j.postedAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
