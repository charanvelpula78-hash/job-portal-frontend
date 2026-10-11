import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyApplications from './pages/MyApplications.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './AuthContext.jsx';

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/applications" element={<RequireRole role="CANDIDATE"><MyApplications /></RequireRole>} />
          <Route path="/recruiter" element={<RequireRole role="RECRUITER"><RecruiterDashboard /></RequireRole>} />
          <Route path="/admin" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
          <Route path="*" element={<p className="empty">That page doesn't exist. <a href="/">Browse jobs</a></p>} />
        </Routes>
      </main>
    </>
  );
}
