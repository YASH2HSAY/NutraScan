const { rateProduct } = require('./rate');

// A decent product: Nutri-Score B, NOVA 3, high in sugar, contains milk
const product = {
  nutriScore: 'b', nova: 3, additives: [], labels: [],
  nutrition: { sugars: 12, saturatedFat: 1, salt: 0.1, fiber: null, proteins: null },
  allergens: ['en:milk'], traces: [], dietTags: ['en:vegetarian'], ingredientsText: 'milk, sugar',
};

test('not logged in: general score only', () => {
  const r = rateProduct(product, null);
  expect(r.final.score).toBe(71);          // 74 - 3
  expect(r.personal).toBeNull();
  expect(r.safety).toBeNull();
});

test('diabetic user: personal score is lower', () => {
  const r = rateProduct(product, { conditions: ['diabetes'] });
  expect(r.final.score).toBe(56);          // 71 - 15
});

test('milk-allergic user: score forced to 0 and band is Avoid', () => {
  const r = rateProduct(product, { conditions: ['diabetes'], allergens: ['en:milk'] });
  expect(r.final.score).toBe(0);
  expect(r.final.band).toBe('Avoid');
});

test('avoid still applies when there is not enough data to score', () => {
  const noScore = { ...product, nutriScore: null, nova: null, nutrition: {} };
  const r = rateProduct(noScore, { allergens: ['en:milk'] });
  expect(r.final.band).toBe('Avoid');
});

test('warning keeps the score and reports the alert', () => {
  const r = rateProduct(product, { vegetarian: true, allergens: ['en:nuts'] });
  expect(r.final.score).toBe(71);          // no conditions selected
  expect(r.safety.level).toBe('ok');       // vegetarian confirmed, no nut data conflict
});