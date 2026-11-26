import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// mode is 'login' or 'signup'
export default function Login({ mode }) {
  const { authenticate } = useAuth();
  const navigate = useNavigate();                 // lets us change page from code
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();                           // stop the browser reloading the page
    setBusy(true);
    setError('');
    try {
      await authenticate(mode, email, password);
      navigate('/');                              // success: go to the home page
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

    return (
    <form className="card form" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <input className="input" type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" placeholder="Password (8+ characters)" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      <button className="btn" disabled={busy}>
        {busy ? 'Please wait...' : (mode === 'login' ? 'Log in' : 'Sign up')}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}