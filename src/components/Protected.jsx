import { Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../auth'

export default function Protected({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="muted">Loading...</p>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}
