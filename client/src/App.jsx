import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import History from './pages/History';

// Send logged-out visitors to the login page
function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { token, email, logout } = useAuth();

  return (
    <div style={{ maxWidth: 520, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link to="/">Scanwise</Link>
        {token ? (
          <>
            <Link to="/history">History</Link>
            <Link to="/profile">My health</Link>
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
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
      </Routes>
    </div>
  );
}