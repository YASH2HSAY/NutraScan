// Turn Open Food Facts' messy product into our clean format
function normalizeProduct(p, barcode) {
  const n = p.nutriments || {};

  
  const num = (value) => (typeof value === 'number' ? value : null);

  return {
    barcode,
    name: p.product_name || 'Unknown product',
    brand: p.brands || '',
    imageUrl: p.image_front_url || '',
    ingredientsText: p.ingredients_text || '',
    nutrition: {
      energyKcal:   num(n['energy-kcal_100g']),
      sugars:       num(n.sugars_100g),
      saturatedFat: num(n['saturated-fat_100g']),
      salt:         num(n.salt_100g),
      fiber:        num(n.fiber_100g),
      proteins:     num(n.proteins_100g),
    },
    allergens: p.allergens_tags || [],
    additives: p.additives_tags || [],
    labels: p.labels_tags || [],
    nutriScore: p.nutriscore_grade || null,
    nova: p.nova_group || null,
  };
}

module.exports = normalizeProduct;