import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
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
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">Scanwise</Link>

          <nav className="topnav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/profile">My health</NavLink>
          </nav>

          <div className="account">
            {token ? (
              <>
                <span className="email">{email}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                <Link to="/signup" className="btn btn-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login mode="login" />} />
          <Route path="/signup" element={<Login mode="signup" />} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/history" element={<Protected><History /></Protected>} />
        </Routes>
      </main>

      {/* Phones only (hidden on laptops by the media query) */}
      <nav className="bottomnav">
        <NavLink to="/history">History</NavLink>
        <Link to="/" className="scan-fab" aria-label="Scan a product">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
            <path d="M8 9v6M12 9v6M16 9v6" />
          </svg>
        </Link>
        <NavLink to="/profile">My health</NavLink>
      </nav>
    </>
  );
}