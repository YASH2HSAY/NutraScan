const normalizeProduct = require('./normalizeProduct');

test('keeps real numbers and turns missing values into null', () => {
  const fake = { nutriments: { sugars_100g: 0, salt_100g: 1.2 } };   // sugars is a real zero
  const r = normalizeProduct(fake, '123');
  expect(r.nutrition.sugars).toBe(0);        // 0 stays 0: a genuine value
  expect(r.nutrition.salt).toBe(1.2);
  expect(r.nutrition.fiber).toBeNull();      // missing stays null, not 0
});

test('copies allergens, traces and diet tags', () => {
  const fake = {
    allergens_tags: ['en:milk'],
    traces_tags: ['en:nuts'],
    ingredients_analysis_tags: ['en:non-vegetarian'],
  };
  const r = normalizeProduct(fake, '123');
  expect(r.allergens).toEqual(['en:milk']);
  expect(r.traces).toEqual(['en:nuts']);
  expect(r.dietTags).toEqual(['en:non-vegetarian']);
});

test('an empty product still gets safe defaults', () => {
  const r = normalizeProduct({}, '123');
  expect(r.name).toBe('Unknown product');
  expect(r.allergens).toEqual([]);
});

test('reads Nutri-Score points and beverage flag', () => {
  const fake = { nutriscore_score: 31, nutriscore_data: { is_beverage: 0 } };
  const r = normalizeProduct(fake, '123');
  expect(r.nutriScorePoints).toBe(31);
  expect(r.isBeverage).toBe(false);
});

test('a Nutri-Score of 0 is kept, a missing one becomes null', () => {
  expect(normalizeProduct({ nutriscore_score: 0 }, '1').nutriScorePoints).toBe(0);
  expect(normalizeProduct({}, '1').nutriScorePoints).toBeNull();
});