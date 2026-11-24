import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
  const { token, email, logout } = useAuth();

  return (
    <div style={{ maxWidth: 520, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Link to="/">Scanwise</Link>
        {token ? (
          <>
            <span>{email}</span>
            <button onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/signup" element={<Login mode="signup" />} />
      </Routes>
    </div>
  );
}