const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// One place for every API call: adds JSON headers and the login token
export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),   // only if logged in
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));            // tolerate an empty body
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}