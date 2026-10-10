import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Protected from './components/Protected'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import CandidateProfile from './pages/CandidateProfile'
import MyApplications from './pages/MyApplications'
import RecruiterDashboard from './pages/RecruiterDashboard'
import JobForm from './pages/JobForm'
import Applicants from './pages/Applicants'
import CompanyProfile from './pages/CompanyProfile'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route path="/profile" element={<Protected roles={['CANDIDATE']}><CandidateProfile /></Protected>} />
          <Route path="/applications" element={<Protected roles={['CANDIDATE']}><MyApplications /></Protected>} />

          <Route path="/recruiter" element={<Protected roles={['RECRUITER']}><RecruiterDashboard /></Protected>} />
          <Route path="/recruiter/jobs/new" element={<Protected roles={['RECRUITER']}><JobForm /></Protected>} />
          <Route path="/recruiter/jobs/:id/edit" element={<Protected roles={['RECRUITER']}><JobForm /></Protected>} />
          <Route path="/recruiter/jobs/:id/applicants" element={<Protected roles={['RECRUITER']}><Applicants /></Protected>} />
          <Route path="/recruiter/company" element={<Protected roles={['RECRUITER']}><CompanyProfile /></Protected>} />

          <Route path="/admin" element={<Protected roles={['ADMIN']}><AdminDashboard /></Protected>} />

          <Route path="*" element={<div className="empty"><h2>Page not found</h2><p>The page you are looking for does not exist.</p></div>} />
        </Routes>
      </main>
    </>
  )
}
