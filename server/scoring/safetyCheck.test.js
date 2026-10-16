const { safetyCheck } = require('./safetyCheck');

// A product with safe defaults; each test overrides what it needs
const p = (o) => ({
  allergens: [], traces: [], dietTags: [], ingredientsText: 'water, sugar', ...o,
});

test('contains the allergen: avoid', () => {
  const r = safetyCheck(p({ allergens: ['en:milk'] }), { allergens: ['en:milk'] });
  expect(r.level).toBe('avoid');
});

test('only traces of the allergen: warning', () => {
  const r = safetyCheck(p({ traces: ['en:nuts'] }), { allergens: ['en:nuts'] });
  expect(r.level).toBe('warning');
});

test('allergic user, no allergen or ingredient data: warning, never ok', () => {
  const r = safetyCheck(p({ ingredientsText: '' }), { allergens: ['en:peanuts'] });
  expect(r.level).toBe('warning');
});

test('allergic user, ingredients listed, no allergens found: ok', () => {
  const r = safetyCheck(p({}), { allergens: ['en:peanuts'] });
  expect(r.level).toBe('ok');
});

test('allergen the user did not select is ignored', () => {
  const r = safetyCheck(p({ allergens: ['en:milk'] }), { allergens: ['en:peanuts'] });
  expect(r.level).toBe('ok');
});

test('vegetarian user, non-vegetarian product: avoid', () => {
  const r = safetyCheck(p({ dietTags: ['en:non-vegetarian'] }), { vegetarian: true });
  expect(r.level).toBe('avoid');
});

test('vegetarian user, status unknown: warning', () => {
  const r = safetyCheck(p({ dietTags: [] }), { vegetarian: true });
  expect(r.level).toBe('warning');
});

test('vegetarian user, confirmed vegetarian: ok', () => {
  const r = safetyCheck(p({ dietTags: ['en:vegetarian'] }), { vegetarian: true });
  expect(r.level).toBe('ok');
});

test('avoid beats warning when both apply', () => {
  const r = safetyCheck(
    p({ traces: ['en:nuts'], dietTags: ['en:non-vegetarian'] }),
    { allergens: ['en:nuts'], vegetarian: true }
  );
  expect(r.level).toBe('avoid');
  expect(r.alerts.length).toBe(2);   // both problems are still reported
});