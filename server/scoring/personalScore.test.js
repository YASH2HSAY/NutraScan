const { personalScore } = require('./personalScore');

// Helper: a product with only the nutrition values we care about
const product = (nutrition) => ({ nutrition });
const general = { score: 60 };

test('diabetes: very high sugar (12 g) takes off 15', () => {
  // 60 - 15 = 45
  const r = personalScore(product({ sugars: 12 }), { conditions: ['diabetes'] }, general);
  expect(r.score).toBe(45);
});

test('diabetes: medium sugar (7 g) takes off 7', () => {
  expect(personalScore(product({ sugars: 7 }), { conditions: ['diabetes'] }, general).score).toBe(53);
});

test('diabetes: sugar between 2.5 and 5 g changes nothing', () => {
  expect(personalScore(product({ sugars: 4 }), { conditions: ['diabetes'] }, general).score).toBe(60);
});

test('diabetes: very low sugar (2 g) adds 3', () => {
  expect(personalScore(product({ sugars: 2 }), { conditions: ['diabetes'] }, general).score).toBe(63);
});

test('no sugar data: score unchanged and condition listed as unchecked', () => {
  const r = personalScore(product({ sugars: null }), { conditions: ['diabetes'] }, general);
  expect(r.score).toBe(60);
  expect(r.unchecked).toContain('Diabetes');
});

test('two conditions add up: 60 - 15 (sugar 12) - 15 (salt 2) = 30', () => {
  const r = personalScore(product({ sugars: 12, salt: 2 }),
                          { conditions: ['diabetes', 'hypertension'] }, general);
  expect(r.score).toBe(30);
});

test('personal score is clamped at 0', () => {
  // General score 10, minus 15 would be -5, so it must become 0
  expect(personalScore(product({ sugars: 12 }), { conditions: ['diabetes'] }, { score: 10 }).score).toBe(0);
});

test('no conditions selected: personal score equals general score', () => {
  expect(personalScore(product({ sugars: 12 }), { conditions: [] }, general).score).toBe(60);
});