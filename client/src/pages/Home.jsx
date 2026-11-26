import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ResultCard from '../ResultCard';

export default function Home() {
  const { token } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(e) {
    e.preventDefault();                       // Enter key submits the form without reloading
    if (!barcode.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await api(`/api/product/${barcode.trim()}`, { token }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Check a product</h1>
      <p className="muted">Enter a barcode to see how it rates for you.</p>

      <form className="search" onSubmit={lookup}>
        <input className="input" inputMode="numeric" value={barcode}
               onChange={(e) => setBarcode(e.target.value)} placeholder="Barcode number" />
        <button className="btn" disabled={loading}>{loading ? 'Checking...' : 'Check'}</button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && <ResultCard result={result} />}
    </div>
  );
}