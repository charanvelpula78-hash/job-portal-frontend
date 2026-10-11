export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const skillList = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [])

export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']
