import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'High blood pressure' },
  { id: 'heart', label: 'Heart health' },
  { id: 'weightLoss', label: 'Weight loss' },
];

const ALLERGENS = [
  { id: 'en:milk', label: 'Milk' },
  { id: 'en:eggs', label: 'Eggs' },
  { id: 'en:peanuts', label: 'Peanuts' },
  { id: 'en:nuts', label: 'Tree nuts' },
  { id: 'en:soybeans', label: 'Soy' },
  { id: 'en:gluten', label: 'Gluten' },
  { id: 'en:fish', label: 'Fish' },
  { id: 'en:sesame-seeds', label: 'Sesame' },
];

export default function Profile() {
  const { token } = useAuth();
  const [conditions, setConditions] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [vegetarian, setVegetarian] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load the saved profile once the page opens (and again if the token changes)
  useEffect(() => {
    api('/api/profile', { token })
      .then((data) => {
        setConditions(data.healthProfile.conditions);
        setAllergens(data.healthProfile.allergens);
        setVegetarian(data.healthProfile.vegetarian);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Add the id if it's missing, remove it if present, always as a NEW array
  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function save(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/api/profile', { method: 'PUT', token, body: { conditions, allergens, vegetarian } });
      setMessage('Saved. Your ratings are now personalised.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={save}>
      <h2>My health profile</h2>

      <h3>Health conditions</h3>
      {CONDITIONS.map((c) => (
        <label key={c.id} style={{ display: 'block' }}>
          <input type="checkbox" checked={conditions.includes(c.id)}
                 onChange={() => toggle(conditions, setConditions, c.id)} /> {c.label}
        </label>
      ))}

      <h3>Allergies</h3>
      {ALLERGENS.map((a) => (
        <label key={a.id} style={{ display: 'block' }}>
          <input type="checkbox" checked={allergens.includes(a.id)}
                 onChange={() => toggle(allergens, setAllergens, a.id)} /> {a.label}
        </label>
      ))}

      <h3>Diet</h3>
      <label>
        <input type="checkbox" checked={vegetarian}
               onChange={(e) => setVegetarian(e.target.checked)} /> Vegetarian
      </label>

      <p><button>Save profile</button></p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <p style={{ fontSize: 12, color: '#666' }}>
        Ratings are an informational guide, not medical advice. Always check the label if you have allergies.
      </p>
    </form>
  );
}