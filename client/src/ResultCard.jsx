export default function ResultCard({ result }) {
  const { product, rating } = result;
  const { general, personal, safety, final } = rating;

  const estimated = general.confidence !== 'high';
  const alerts = safety ? safety.alerts : [];
  const unchecked = personal ? personal.unchecked : [];

  return (
    <article className="card result">
      <div className="result-head">
        {product.imageUrl && <img className="result-img" src={product.imageUrl} alt={product.name} />}
        <div className="result-title">
          <h2>{product.name}</h2>
          <p className="muted">{product.brand}</p>
        </div>
      </div>

      <div className={`score band-${final.band.toLowerCase()}`}>
        <span className="score-num">{final.score === null ? '?' : final.score}</span>
        <span className="score-band">{final.band}</span>
      </div>

      {estimated && (
        <p className="note">
          Estimated rating: {general.confidence === 'none'
            ? 'there is not enough data to rate this product.'
            : 'this product has no Nutri-Score grade, so the rating is less precise.'}
        </p>
      )}

      {alerts.map((a, i) => (
        <div key={i} className={`alert ${a.level === 'avoid' ? 'alert-avoid' : 'alert-warn'}`}>
          {a.level === 'avoid' ? 'Avoid: ' : 'Warning: '}{a.message}
        </div>
      ))}

      {unchecked.length > 0 && (
        <p className="note">Could not check (missing data): {unchecked.join(', ')}</p>
      )}

      {!personal && (
        <p className="muted">
          This is the general rating. Log in and set your health profile for a personalised one.
        </p>
      )}

      <details>
        <summary>Why this score?</summary>
        <p><strong>General rating: {general.score === null ? 'n/a' : general.score}</strong></p>
        <ul>{general.breakdown.map((line, i) => <li key={i}>{line}</li>)}</ul>
        {personal && personal.breakdown.length > 0 && (
          <>
            <p><strong>Adjusted for you</strong></p>
            <ul>{personal.breakdown.map((line, i) => <li key={i}>{line}</li>)}</ul>
          </>
        )}
      </details>

      <p className="fineprint">
        An informational guide, not medical advice. Product data comes from the community
        database Open Food Facts and can be incomplete: always check the label if you have allergies.
      </p>
    </article>
  );
}