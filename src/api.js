// Small fetch wrapper. In dev, Vite proxies /api to http://localhost:8080.
// For a deployed build, set VITE_API_URL (e.g. https://myserver.com/api).
const BASE = import.meta.env.VITE_API_URL || '/api'

export const getToken = () => localStorage.getItem('token')
export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'))

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: form ? form : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running on port 8080.')
  }

  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('auth-expired'))
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`)
  return data
}

const qs = (obj) => {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => v !== '' && v != null && p.set(k, v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  // auth
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  me: () => request('/auth/me'),

  // jobs
  searchJobs: (params) => request('/jobs' + qs(params)),
  getJob: (id) => request(`/jobs/${id}`),
  myJobs: () => request('/jobs/mine'),
  createJob: (b) => request('/jobs', { method: 'POST', body: b }),
  updateJob: (id, b) => request(`/jobs/${id}`, { method: 'PUT', body: b }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // applications
  apply: (jobId, coverLetter) =>
    request(`/applications/jobs/${jobId}`, { method: 'POST', body: { coverLetter } }),
  myApplications: () => request('/applications/mine'),
  applicantsFor: (jobId) => request(`/applications/job/${jobId}`),
  setStatus: (id, status) => request(`/applications/${id}/status`, { method: 'PUT', body: { status } }),

  // profiles
  getCandidate: () => request('/profile/candidate'),
  saveCandidate: (b) => request('/profile/candidate', { method: 'PUT', body: b }),
  uploadResume: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('/profile/resume', { method: 'POST', form })
  },
  getCompany: () => request('/profile/company'),
  saveCompany: (b) => request('/profile/company', { method: 'PUT', body: b }),

  // admin
  stats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
  setUserActive: (id, value) => request(`/admin/users/${id}/active?value=${value}`, { method: 'PUT' }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminJobs: () => request('/admin/jobs'),
  setJobActive: (id, value) => request(`/admin/jobs/${id}/active?value=${value}`, { method: 'PUT' }),
  adminDeleteJob: (id) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),
}

// Resume download needs the auth header, so we fetch it as a blob and save it.
export async function downloadResume(userId, fallbackName = 'resume') {
  const res = await fetch(`${BASE}/profile/resume/${userId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || 'Could not download the resume')
  }
  const cd = res.headers.get('Content-Disposition') || ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd)
  const name = match ? decodeURIComponent(match[1]) : fallbackName
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
