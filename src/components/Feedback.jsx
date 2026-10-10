export const ErrorNote = ({ children }) => (children ? <div className="note error" role="alert">{children}</div> : null)
export const OkNote = ({ children }) => (children ? <div className="note ok" role="status">{children}</div> : null)
