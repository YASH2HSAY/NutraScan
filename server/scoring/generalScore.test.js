const { generalScore } = require('./generalScore');

// A small helper so each test only states what differs
const make = (overrides) => ({
  nutriScore: null, nova: null, additives: [], labels: [],
  nutrition: { sugars: null, saturatedFat: null, salt: null, fiber: null, proteins: null },
  ...overrides,
});

test('Nutri-Score A with NOVA 1 scores 94', () => {
  expect(generalScore(make({ nutriScore: 'a', nova: 1 })).score).toBe(94);
});

test('additive penalty is capped at -10', () => {
  const eight = Array(8).fill('en:e330');
  expect(generalScore(make({ nutriScore: 'c', nova: 2, additives: eight })).score).toBe(46); // 56 + 0 - 10
})

test('organic label adds 3', () => {
  expect(generalScore(make({ nutriScore: 'c', nova: 2, labels: ['en:organic'] })).score).toBe(59); // 56 + 0 + 3
});

test('score never goes below 0', () => {
  const eight = Array(8).fill('en:e330');
  expect(generalScore(make({ nutriScore: 'e', nova: 4, additives: eight })).score).toBe(0);
});

test('no grade: high sugar, low fat and salt', () => {
  // 65 - 12 (sugar 30) + 2 (sat fat 0.5) + 2 (salt 0.1) + 0 (NOVA 2) = 57
  const p = make({ nova: 2, nutrition: { sugars: 30, saturatedFat: 0.5, salt: 0.1, fiber: null, proteins: null } });
  expect(generalScore(p).score).toBe(57);
});

test('no grade: fibre and protein bonuses', () => {
  // 65 - 4 - 4 - 4 (all medium) + 4 (fibre 4) + 4 (protein 9) = 61
  const p = make({ nutrition: { sugars: 10, saturatedFat: 3, salt: 1, fiber: 4, proteins: 9 } });
  expect(generalScore(p).score).toBe(61);
});

test('only NOVA known: NOVA 4 base is 30, confidence low', () => {
  const r = generalScore(make({ nova: 4 }));
  expect(r.score).toBe(30);
  expect(r.confidence).toBe('low');
});

test('nothing known: no score', () => {
  expect(generalScore(make({})).score).toBeNull();
});