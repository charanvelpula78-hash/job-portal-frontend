const LABELS = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', SELECTED: 'Selected', REJECTED: 'Rejected' }

export default function StatusBadge({ status }) {
  return <span className={`badge ${status.toLowerCase()}`}>{LABELS[status] || status}</span>
}
