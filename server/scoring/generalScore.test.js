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

test('Nutella-like: grade E with 31 points gives base 8', () => {
  // t = (31 - 19) / 21 = 0.571; 19 - 0.571 * 19 = 8.14 -> 8
  expect(generalScore(make({ nutriScore: 'e', nutriScorePoints: 31 })).score).toBe(8);
});

test('within one letter, worse points give a lower score', () => {
  const better = generalScore(make({ nutriScore: 'e', nutriScorePoints: 26 })).score;  // 13
  const worse  = generalScore(make({ nutriScore: 'e', nutriScorePoints: 31 })).score;  // 8
  expect(better).toBeGreaterThan(worse);
});

test('best end of grade E gives 19, far beyond the worst end gives 0', () => {
  expect(generalScore(make({ nutriScore: 'e', nutriScorePoints: 19 })).score).toBe(19);
  expect(generalScore(make({ nutriScore: 'e', nutriScorePoints: 50 })).score).toBe(0);
});

test('grade A with 0 points stays Excellent (81)', () => {
  // t = 15 / 16 = 0.9375; 100 - 0.9375 * 20 = 81.25 -> 81
  const r = generalScore(make({ nutriScore: 'a', nutriScorePoints: 0 }));
  expect(r.score).toBe(81);
  expect(r.band).toBe('Excellent');
});

test('the letter wins when the points disagree with it', () => {
  // grade E but only 5 points (inconsistent data): clamped to the top of E's range
  expect(generalScore(make({ nutriScore: 'e', nutriScorePoints: 5 })).score).toBe(19);
});

test('drinks use their own ranges: grade E, 14 points gives 15', () => {
  // t = (14 - 10) / 20 = 0.2; 19 - 0.2 * 19 = 15.2 -> 15
  expect(generalScore(make({ nutriScore: 'e', nutriScorePoints: 14, isBeverage: true })).score).toBe(15);
});

test('missing points fall back to the fixed letter value', () => {
  expect(generalScore(make({ nutriScore: 'e' })).score).toBe(20);
});