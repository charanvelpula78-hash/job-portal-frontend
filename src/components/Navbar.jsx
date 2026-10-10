import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const links = !user
    ? [['/jobs', 'Browse jobs']]
    : user.role === 'CANDIDATE'
    ? [['/jobs', 'Browse jobs'], ['/applications', 'My applications'], ['/profile', 'My profile']]
    : user.role === 'RECRUITER'
    ? [['/recruiter', 'My jobs'], ['/recruiter/jobs/new', 'Post a job'], ['/recruiter/company', 'Company']]
    : [['/admin', 'Dashboard'], ['/jobs', 'Live jobs']]

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">Jobline</Link>
        <nav className="nav">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-right">
          {user ? (
            <>
              <span className="who">{user.name}</span>
              <button className="btn ghost small" onClick={() => { signOut(); navigate('/login') }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost small">Log in</Link>
              <Link to="/register" className="btn small">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
