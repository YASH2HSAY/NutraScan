const { generalScore } = require('./generalScore');
const { personalScore } = require('./personalScore');
const { safetyCheck } = require('./safetyCheck');

// product: our product; profile: the user's health profile, or null if not logged in
function rateProduct(product, profile) {
  const general = generalScore(product);            // same for everyone

  // Not logged in: only the general rating, no personal parts
  if (!profile) {
    return {
      general, personal: null, safety: null,
      final: { score: general.score, band: general.band },
    };
  }

  const personal = personalScore(product, profile, general);   // adjusted for the user
  const safety = safetyCheck(product, profile);                // allergens and diet

  // Safety override: a direct conflict wins over everything, even a missing score
  if (safety.level === 'avoid') {
    return { general, personal, safety, final: { score: 0, band: 'Avoid' } };
  }

  // Otherwise the personal score is the final one (warnings are shown, not scored)
  return { general, personal, safety, final: { score: personal.score, band: personal.band } };
}

module.exports = { rateProduct };