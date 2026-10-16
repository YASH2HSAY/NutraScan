# Scanwise: Progress Log

A running record of everything built, learned and decided. Updated at the end of each day. Each day's entry later becomes material for the final report (Implementation, Testing, Results chapters).

**Status legend:** [ ] not started, [~] in progress, [x] done

---

## Project summary

Scanwise is a web app that scans a packaged-food barcode (or label photo), and returns a 0-100 health rating, personalised to the user's health needs. A rule-based scoring engine produces the rating (auditable and explainable). AI/ML components handle label reading, estimation for missing data, and plain-language explanation.

## Key decisions (with reasons)

| # | Decision | Reason | Date |
|---|----------|--------|------|
| 1 | Score is calculated by deterministic rules, not by an LLM | Auditable, reproducible, defensible in a viva. AI is used for extraction, estimation and explanation only | Day 0 |
| 2 | Stack: React (Vite), Node + Express, MongoDB Atlas, Mongoose | As per project plan | Day 0 |
| 3 | Data source: Open Food Facts | Free, open, large | Day 0 |

## Timeline

| Day | Focus | Status |
|-----|-------|--------|
| 1 | HTTP/REST, Git, Express server, product proxy endpoint | [ x] |
| 2 | Middleware, env vars, MongoDB, Mongoose, scoring module + Jest tests, caching | [ ] |
| 3 | Auth (bcrypt, JWT), user health profile, history, personalised scoring | [ ] |
| 4 | React frontend: pages, routing, state | [ ] |
| 5 | Camera scanning, OCR + vision AI fallback, edit form, estimation | [ ] |
| 6 | ML model, security hardening, evaluation scripts | [ ] |
| 7 | Deployment, README, demo video, viva prep | [ ] |

(Timeline may extend. Quality takes priority over the 7-day target.)

---

## Day-by-day log

### Day 0: Planning
- Defined concept, scoring logic, architecture and plan.
- Built front-end prototype (index.html), tested with a mock product only. Camera and live API not yet tested on a real phone.
- **Report material:** Problem statement, initial requirements.

### Day 2: Environment, database, caching and scoring (in progress)
**Concepts learned:** middleware (chain of functions between request and response),
environment variables and dotenv, MongoDB document database, Mongoose schema and model,
unique index, normalising third-party data, caching, request timeouts, pure functions,
unit testing with Jest.
**Built so far:**
- nodemon for auto-restart, dotenv with a .env file (kept out of Git via .gitignore).
- MongoDB Atlas free cluster; connection in config/db.js using Mongoose.
- Product model (models/Product.js) and normaliser (services/normalizeProduct.js) that
  keeps ~15 fields in our own format.
- Cache-first product route: check MongoDB, otherwise call Open Food Facts with an
  8-second timeout, save, return. Response includes source ("cache" or "openfoodfacts").
- Scoring module started (scoring/generalScore.js) with Jest tests.
**Design decisions:**
1. Missing nutrition values are stored as null, not 0, because "no data" must not be
   shown or scored as "zero sugar".
2. We store our own clean format instead of the full Open Food Facts record, so the rest
   of the app does not depend on a third party's field names.
3. The scoring function returns the number and a breakdown list, so explanations can
   only use facts the code computed.
**Problems and fixes:**
1. npm install mongoose showed only a thick bar and seemed to hang: a progress-bar
   display issue in PowerShell. Fixed with `npm config set progress false`.
2. npm audit reported 3 high severity warnings after installing dev tools. Did not run
   `npm audit fix --force` (it can break the project); to review with `npm audit --omit=dev`.
**Measurements (evaluation data):**
- Coca-Cola barcode, first request (Open Food Facts): 3,180 ms.
- Same barcode, second request (MongoDB cache): 63 ms (about 50x faster).
- TODO: repeat 20 times each and report the mean.
**Report material:** System design (cache-first flow), Implementation (schema,
normaliser), Testing (Jest), Evaluation (response time with and without cache).
 ### Day 2: Environment, database, caching, scoring and safety
**Concepts learned:** middleware, environment variables (dotenv), MongoDB document
database, Mongoose schema/model, unique index, normalising third-party data, caching,
request timeouts, pure functions, unit testing (Jest), data-driven rules, fail-safe design,
query strings, input whitelisting.
**Built:**
- nodemon, dotenv/.env (kept out of Git), MongoDB Atlas + Mongoose connection.
- Product model and normaliser (~15 fields; missing values stored as null, not 0).
- Cache-first product route with an 8 s timeout on Open Food Facts calls.
- scoring/generalScore.js: Nutri-Score base, NOVA adjustment, additives (capped at -10),
  organic bonus; fallbacks (nutrition estimate, NOVA-only) with a confidence level.
- scoring/personalScore.js: rules for diabetes, hypertension, heart health, weight loss,
  stored as data; missing nutrient data is reported as "unchecked", never guessed.
- scoring/safetyCheck.js: allergens, traces, vegetarian; levels ok / warning / avoid.
  Fail-safe: missing data never produces "ok".
- scoring/rate.js: combines all three; an "avoid" result forces the score to 0.
- Temporary profile via query string (to be replaced by login on Day 3).
- 33 automated tests, all passing.
**Design decisions:**
1. null (no data) is different from 0 (real zero).
2. Scoring is rule-based and auditable; AI will only extract, estimate and explain.
3. Safety is fail-safe: a false alarm costs a second look, a false all-clear could harm.
4. Health data in URLs is a privacy risk; the query-string profile is temporary only.
**Problems and fixes:**
1. npm install showed only a thick bar: display issue; fixed with npm config set progress false.
2. npm audit showed 3 high warnings from dev tools; did not use --force.
3. Two tests failed after the helper default changed: test data had no grade, so the
   function correctly returned null. Fixed the tests, not the function.
4. The "never below 0" test did not really test the clamp (result was exactly 0);
   a real clamp test was added with the personal score.
**Measurements (evaluation data):**
- Coca-Cola first request (Open Food Facts): 3,180 ms. Cached request: 63 ms (~50x faster).
- TODO: repeat 20 times each and report the mean.
**Live API checks:** Coca-Cola general 6 (Bad); with diabetes 0 (clamped); Nutella with a milk
allergy: Avoid / 0; malicious query values ignored.
**Known limitations:**
1. Products sharing a Nutri-Score letter, NOVA group and additive count get identical scores
   (Coca-Cola and Nutella both 6). To refine with the numeric Nutri-Score points.
2. Open Food Facts allergen data is community-entered; an empty list does not prove a
   product is allergen-free.
3. Weights are judgment calls: need citations and validation against Nutri-Score.
**Report material:** Scoring methodology, System design (cache flow), Testing (33 tests),
Evaluation (cache timing), Limitations, Ethics (fail-safe design, disclaimer).
<!-- Template for each day. Copy this block.

### Day N: Title
**Date / hours spent:**
**Concepts learned:** (term: one-line meaning)
**What we built:** (files, endpoints, features)
**Problems hit and how they were fixed:**
**Tests run and results:**
**Git commit(s):**
**Report material:** (which chapter this feeds, key points, screenshots to take)
-->

---

## Concepts glossary (grows as we learn)

| Term | Meaning | First used |
|------|---------|-----------|
| | | |

## Open issues and limitations

- Indian products have patchy coverage in Open Food Facts.
- Scoring weights are judgment calls and need citations (WHO, FSSAI, ICMR-NIN, Nutri-Score) and validation against Nutri-Score on 50-100 products.
- Rating is an informational guide, not medical advice.
