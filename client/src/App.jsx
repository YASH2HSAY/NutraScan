import { useState } from 'react';

// Where the API lives (from client/.env)
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // State: things the screen depends on
  const [barcode, setBarcode] = useState('');     // what the user typed
  const [result, setResult] = useState(null);     // the API answer, or null
  const [error, setError] = useState('');         // an error message, or ''
  const [loading, setLoading] = useState(false);  // are we waiting for the API?

  async function lookup() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/product/${barcode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);          // runs whether it worked or failed
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Scanwise</h1>

      <input
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Enter a barcode"
      />
      <button onClick={lookup} disabled={loading}>
        {loading ? 'Looking up...' : 'Look up'}
      </button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {result && (
        <div>
          <h2>{result.product.name}</h2>
          <p>{result.product.brand}</p>
          <p>
            Score: {result.rating.final.score} ({result.rating.final.band})
          </p>
        </div>
      )}
    </div>
  );
}

export default App;