import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function History() {
  const { token } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/history', { token })
      .then((data) => setScans(data.scans))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

  return (
    <div>
      <h2>My scans</h2>
      {scans.length === 0 && <p>No scans yet. Look up a product on the home page.</p>}
      {scans.map((s) => (
        <div key={s._id} style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
          <strong>{s.name}</strong> <span>{s.brand}</span>
          <div>
            Score: {s.score} ({s.band})
            {s.safetyLevel && s.safetyLevel !== 'ok' && (
              <span style={{ color: s.safetyLevel === 'avoid' ? 'crimson' : 'darkorange' }}>
                {' '}· {s.safetyLevel}
              </span>
            )}
          </div>
          <small>{new Date(s.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}