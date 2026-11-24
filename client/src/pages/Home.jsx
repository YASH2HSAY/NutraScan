import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { token } = useAuth();                    // present only when logged in
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await api(`/api/product/${barcode}`, { token }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input value={barcode} onChange={(e) => setBarcode(e.target.value)}
             placeholder="Enter a barcode" />
      <button onClick={lookup} disabled={loading}>{loading ? 'Looking up...' : 'Look up'}</button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {result && (
        <div>
          <h2>{result.product.name}</h2>
          <p>{result.product.brand}</p>
          <p>Score: {result.rating.final.score} ({result.rating.final.band})</p>
          {result.rating.safety && result.rating.safety.alerts.map((a, i) => (
            <p key={i} style={{ color: a.level === 'avoid' ? 'crimson' : 'darkorange' }}>
              {a.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}