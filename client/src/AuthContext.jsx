import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start from what is saved in the browser, so a refresh keeps you logged in
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [email, setEmail] = useState(() => localStorage.getItem('email'));

  // mode is 'login' or 'signup': both return a token
  async function authenticate(mode, emailInput, password) {
    const data = await api(`/api/auth/${mode}`, {
      method: 'POST',
      body: { email: emailInput, password },
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.user.email);
    setToken(data.token);
    setEmail(data.user.email);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ token, email, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A short way for components to read the login state
export function useAuth() {
  return useContext(AuthContext);
}