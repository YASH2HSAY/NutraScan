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
| 1 | HTTP/REST, Git, Express server, product proxy endpoint | [ ] |
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
