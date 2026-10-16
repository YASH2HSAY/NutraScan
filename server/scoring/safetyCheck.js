// How serious each level is, so we can keep the worst one
const SEVERITY = { ok: 0, warning: 1, avoid: 2 };

function safetyCheck(product, profile) {
  const alerts = [];                 // list of { level, message }
  let level = 'ok';                  // start optimistic, raise it as problems appear

  // Helper: record an alert and raise the overall level if this one is worse
  const raise = (newLevel, message) => {
    alerts.push({ level: newLevel, message });
    if (SEVERITY[newLevel] > SEVERITY[level]) level = newLevel;
  };

  const userAllergens = profile.allergens || [];   // e.g. ['en:milk', 'en:peanuts']
  const contains = product.allergens || [];        // what the product contains
  const traces = product.traces || [];             // "may contain traces of"

  // 1. Check each allergen the user selected
  for (const tag of userAllergens) {
    const name = tag.replace('en:', '');           // 'en:milk' becomes 'milk' for display
    if (contains.includes(tag)) {
      raise('avoid', `Contains ${name}`);
    } else if (traces.includes(tag)) {
      raise('warning', `May contain traces of ${name}`);
    }
  }

  // 2. Fail-safe: the user has allergies but we have NO data to check against
  const noData = contains.length === 0 && traces.length === 0 && !product.ingredientsText;
  if (userAllergens.length > 0 && noData) {
    raise('warning', 'No allergen or ingredient data: could not check your allergies');
  }

  // 3. Vegetarian check
  if (profile.vegetarian) {
    const tags = product.dietTags || [];
    if (tags.includes('en:non-vegetarian')) {
      raise('avoid', 'Not vegetarian');
    } else if (tags.includes('en:vegetarian')) {
      // confirmed vegetarian: nothing to report
    } else if (tags.includes('en:maybe-vegetarian')) {
      raise('warning', 'May not be vegetarian: check the ingredients');
    } else {
      raise('warning', 'Could not confirm this product is vegetarian');
    }
  }

  return { level, alerts };
}

module.exports = { safetyCheck };