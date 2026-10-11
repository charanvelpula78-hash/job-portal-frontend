import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'CANDIDATE', name: '', email: '', password: '', phone: '', company: '', skills: '', about: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await api.post('/auth/register', form);
      signIn(user);
      navigate(user.role === 'RECRUITER' ? '/recruiter' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isRecruiter = form.role === 'RECRUITER';

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Create your account</h1>

      <fieldset className="choice">
        <legend>I want to</legend>
        <label><input type="radio" name="role" value="CANDIDATE" checked={!isRecruiter} onChange={set('role')} /> Find a job</label>
        <label><input type="radio" name="role" value="RECRUITER" checked={isRecruiter} onChange={set('role')} /> Hire people</label>
      </fieldset>

      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Password (6+ characters)<input type="password" required minLength="6" value={form.password} onChange={set('password')} /></label>
      <label>Phone<input value={form.phone} onChange={set('phone')} /></label>

      {isRecruiter ? (
        <label>Company<input required value={form.company} onChange={set('company')} /></label>
      ) : (
        <>
          <label>Skills (comma-separated)<input value={form.skills} onChange={set('skills')} placeholder="Java, React, SQL" /></label>
          <label>About you<textarea rows="3" value={form.about} onChange={set('about')} /></label>
        </>
      )}

      {error && <p className="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
    </form>
  );
}
