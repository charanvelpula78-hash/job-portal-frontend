import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Job Portal</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Browse jobs</NavLink>
          {user?.role === 'CANDIDATE' && <NavLink to="/applications">My applications</NavLink>}
          {user?.role === 'RECRUITER' && <NavLink to="/recruiter">Recruiter dashboard</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="muted">{user.name}</span>
              <button className="btn btn-quiet" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-quiet" to="/login">Sign in</Link>
              <Link className="btn" to="/register">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
