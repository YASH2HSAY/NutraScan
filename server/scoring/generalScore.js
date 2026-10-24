const NUTRI_BASE = { a: 88, b: 74, c: 56, d: 38, e: 20 };
const NOVA_ADJUST = { 1: 6, 2: 0, 3: -3, 4: -10 };
const NOVA_ONLY_BASE = { 1: 80, 2: 65, 3: 50, 4: 30 };

// Traffic-light limits per 100 g (UK Food Standards Agency)
const LIMITS = [
  { key: 'sugars',       label: 'Sugars',        low: 5,   high: 22.5 },
  { key: 'saturatedFat', label: 'Saturated fat', low: 1.5, high: 5 },
  { key: 'salt',         label: 'Salt',          low: 0.3, high: 1.5 },
];

// Points range and score range for each Nutri-Score letter (2023 algorithm)
// from/to = Nutri-Score points; top/bottom = our score at those ends
const FOOD_RANGES = {
  a: { from: -15, to: 1,  top: 100, bottom: 80 },
  b: { from: 1,   to: 3,  top: 79,  bottom: 60 },
  c: { from: 3,   to: 11, top: 59,  bottom: 40 },
  d: { from: 11,  to: 19, top: 39,  bottom: 20 },
  e: { from: 19,  to: 40, top: 19,  bottom: 0 },
};
const BEVERAGE_RANGES = {
  a: { from: -15, to: 1,  top: 100, bottom: 80 },
  b: { from: -15, to: 2,  top: 79,  bottom: 60 },
  c: { from: 2,   to: 6,  top: 59,  bottom: 40 },
  d: { from: 6,   to: 10, top: 39,  bottom: 20 },
  e: { from: 10,  to: 30, top: 19,  bottom: 0 },
};

// Place a product inside its letter's score range using its Nutri-Score points.
// Returns null when we cannot (so the caller falls back to the fixed letter value).
function baseFromPoints(grade, points, isBeverage) {
  if (!isNum(points)) return null;                 // no points: cannot refine
  const range = (isBeverage ? BEVERAGE_RANGES : FOOD_RANGES)[grade];
  if (!range) return null;                         // unknown letter

  // How far through the points range is this product? 0 = best end, 1 = worst end
  let t = (points - range.from) / (range.to - range.from);
  t = Math.max(0, Math.min(1, t));                 // clamp: the letter always wins

  // Move down the score range by that fraction, then round to a whole number
  return Math.round(range.top - t * (range.top - range.bottom));
}

function bandFor(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Mediocre';
  if (score >= 20) return 'Poor';
  return 'Bad';
}

const isNum = (v) => typeof v === 'number';

// Estimate a base score from nutrition values when there is no Nutri-Score grade
function estimateFromNutrition(n, breakdown) {
  let score = 65;
  breakdown.push('No Nutri-Score grade, estimated from nutrition: start 65');

  for (const rule of LIMITS) {
    const value = n[rule.key];
    if (!isNum(value)) continue;                 // missing data is skipped, not scored
    let points = 2, level = 'low';
    if (value > rule.high)      { points = -12; level = 'high'; }
    else if (value > rule.low)  { points = -4;  level = 'medium'; }
    score += points;
    breakdown.push(`${rule.label} ${value} g (${level}): ${points >= 0 ? '+' : ''}${points}`);
  }
  if (isNum(n.fiber) && n.fiber >= 3)    { score += 4; breakdown.push(`Fibre ${n.fiber} g: +4`); }
  if (isNum(n.proteins) && n.proteins >= 8) { score += 4; breakdown.push(`Protein ${n.proteins} g: +4`); }
  return score;
}

function generalScore(product) {
  const breakdown = [];
  const n = product.nutrition || {};
  let score;
  let confidence;
  let applyNova = true;          // NOVA-only products already use NOVA as the base

  if (NUTRI_BASE[product.nutriScore]) {
    const letter = product.nutriScore.toUpperCase();
    const fine = baseFromPoints(product.nutriScore, product.nutriScorePoints, product.isBeverage);
    if (fine !== null) {
      score = fine;                                // refined: uses the points inside the letter
      breakdown.push(`Nutri-Score ${letter} (${product.nutriScorePoints} points): base ${score}`);
    } else {
      score = NUTRI_BASE[product.nutriScore];      // fallback: fixed value for the letter
      breakdown.push(`Nutri-Score ${letter}: base ${score}`);
    }
    confidence = 'high';
  }
   else if (LIMITS.some((rule) => isNum(n[rule.key]))) {
    score = estimateFromNutrition(n, breakdown);
    confidence = 'medium';
  } else if (product.nova in NOVA_ONLY_BASE) {
    score = NOVA_ONLY_BASE[product.nova];
    confidence = 'low';
    applyNova = false;
    breakdown.push(`Only NOVA group ${product.nova} known: base ${score}`);
  } else {
    return { score: null, band: 'Unknown', confidence: 'none',
             breakdown: ['Not enough data to rate this product'] };
  }

  if (applyNova && product.nova in NOVA_ADJUST) {
    const adj = NOVA_ADJUST[product.nova];
    score += adj;
    breakdown.push(`NOVA group ${product.nova}: ${adj >= 0 ? '+' : ''}${adj}`);
  }

  const additives = product.additives || [];
  const penalty = Math.min(additives.length * 2, 10);
  if (penalty > 0) {
    score -= penalty;
    breakdown.push(`${additives.length} additives: -${penalty}`);
  }

  if ((product.labels || []).includes('en:organic')) {
    score += 3;
    breakdown.push('Organic: +3');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, band: bandFor(score), confidence, breakdown };
}

module.exports = { generalScore, bandFor };