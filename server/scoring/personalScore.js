const { bandFor } = require('./generalScore');   // reuse the band function from the other file

// One rule per health condition, kept as data
const RULES = {
  diabetes: {
    label: 'Diabetes',            // shown to the user
    key: 'sugars',                // which nutrition field to check
    unit: 'g',                    // unit shown in the explanation
    // Penalties are checked from the worst tier down; the first match wins
    tiers: [ { above: 10, points: -15 }, { above: 5, points: -7 } ],
    bonus: { atMost: 2.5, points: 3 },    // reward for a very low value
  },
  hypertension: {
    label: 'High blood pressure',
    key: 'salt', unit: 'g',
    tiers: [ { above: 1.5, points: -15 }, { above: 0.3, points: -5 } ],
    bonus: { atMost: 0.3, points: 3 },
  },
  heart: {
    label: 'Heart health',
    key: 'saturatedFat', unit: 'g',
    tiers: [ { above: 5, points: -12 }, { above: 1.5, points: -5 } ],
    bonus: { atMost: 1.5, points: 3 },
  },
  weightLoss: {
    label: 'Weight loss',
    key: 'energyKcal', unit: 'kcal',
    tiers: [ { above: 400, points: -10 }, { above: 250, points: -4 } ],
    bonus: { below: 100, points: 3 },     // "below" means strictly under 100
  },
};

// product: our product object; profile: the user's health profile;
// general: the result of generalScore() for this product
function personalScore(product, profile, general) {
  // If the general score is missing, we have nothing to adjust
  if (general.score === null) {
    return { score: null, band: 'Unknown', breakdown: [], unchecked: [] };
  }

  const n = product.nutrition || {};              // nutrition values, or empty if missing
  const conditions = profile.conditions || [];    // e.g. ['diabetes', 'heart']
  const breakdown = [];                           // reasons for each change
  const unchecked = [];                           // conditions we could not check
  let score = general.score;                      // start from the general score

  for (const name of conditions) {                // go through each selected condition
    const rule = RULES[name];                     // look up its rule
    if (!rule) continue;                          // unknown condition name? skip it

    const value = n[rule.key];                    // e.g. the sugar value
    if (typeof value !== 'number') {              // no data for this nutrient
      unchecked.push(rule.label);                 // remember we could not check it
      continue;                                   // move on to the next condition
    }

    let points = 0;                               // assume no change
    let reason = `${rule.label}: ${rule.key} ${value} ${rule.unit}`;  // base of the message

    // Find the first penalty tier the value exceeds (worst tiers are listed first)
    const tier = rule.tiers.find((t) => value > t.above);
    if (tier) {
      points = tier.points;                       // apply the penalty
    } else {
      // No penalty: check whether the value earns the bonus
      const earnsBonus = rule.bonus.below !== undefined
        ? value < rule.bonus.below                // "below" rules use strictly less than
        : value <= rule.bonus.atMost;             // "atMost" rules use less than or equal
      if (earnsBonus) points = rule.bonus.points;
    }

    score += points;                              // apply the change
    breakdown.push(`${reason}: ${points >= 0 ? '+' : ''}${points}`);
  }

  score = Math.max(0, Math.min(100, score));      // keep the result between 0 and 100
  return { score, band: bandFor(score), breakdown, unchecked };
}

module.exports = { personalScore };