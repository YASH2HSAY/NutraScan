# Scanwise: Architecture and How It Works

This document describes the system design and the working of each component. It is updated whenever the design changes. (Sections marked *planned* are not built yet.)

## 1. System overview

```
                        +--------------------+
                        |  Open Food Facts   |
                        |  (external data)   |
                        +---------^----------+
                                  |
+-----------+   HTTPS   +---------+----------+   Mongoose   +---------------+
|  Browser  +---------->|  Node + Express    +------------->| MongoDB Atlas |
|  (React)  |<----------+  API server        |<-------------+ users, scans, |
+-----+-----+           +----+----------+----+              | products      |
      |                      |          |                   +---------------+
      | Tesseract.js         |          |
      | (OCR, in browser)    |          +--> AI service (planned): vision LLM
      v                      |                for label reading + explanations
  Camera / barcode           |
  (BarcodeDetector / ZXing)  +--> ML service (planned): ingredient model
                                  predicting NOVA / Nutri-Score band
```

## 2. Components

| Component | Technology | Responsibility | Status |
|-----------|-----------|----------------|--------|
| Client | React, Vite, React Router | UI, camera scan, OCR, user flows | planned |
| API server | Node.js, Express | Routes, auth, validation, proxy to Open Food Facts | planned |
| Scoring module | Plain JS (Jest tested) | Deterministic 0-100 rating and personal adjustments | planned |
| Database | MongoDB Atlas, Mongoose | Users, scan history, cached and user-added products | planned |
| Auth | bcrypt, JWT | Password hashing, protected routes | planned |
| Label AI | Vision LLM via backend (key hidden), Tesseract.js fallback | Read nutrition table and ingredients from a photo | planned |
| ML estimator | Python (scikit-learn), trained on Open Food Facts | Predict NOVA / Nutri-Score band from ingredients | planned |
| Explainer | LLM, grounded on the computed breakdown | Plain-language "why this score" | planned |

## 3. Request flow: barcode scan

1. Browser decodes the barcode number from the camera.
2. Client calls `GET /api/product/:barcode`.
3. Server checks the MongoDB cache. If found, returns it.
4. If not, server calls Open Food Facts, normalises the response, stores it in the cache.
5. Scoring module computes the general score, and the personal score if the user is logged in.
6. Server returns product, score, breakdown and alerts. Client renders them.
7. If the product is not found, the client starts the label-photo flow (section 4).

## 4. Request flow: product not found (label photo)

1. User photographs the nutrition table and ingredients.
2. Image goes to the label AI (vision model, with Tesseract.js fallback) which returns structured values.
3. User reviews and corrects values in an edit screen.
4. Scoring module rates it. If a nutrition table was read: high confidence. If ingredients only: ML estimator is used and the result carries an "Estimated" badge.
5. Product is saved to the user-added products collection.

## 5. Scoring design

Rating is deterministic. See PROGRESS_LOG.md "Key decisions". Rules: Nutri-Score base, NOVA adjustment, additives, organic bonus, personal adjustments (diabetes, blood pressure, heart, weight loss), and safety override (allergen or diet conflict gives 0 / "Avoid"). Weights to be cited and validated.

**AI never changes the number.** AI extracts data, estimates missing data, and explains the result.

## 6. Data model (draft)

- **User:** email, passwordHash, healthProfile { conditions[], allergens[], vegetarian }
- **ScanHistory:** userId, barcode, productSnapshot, scoreGeneral, scorePersonal, createdAt
- **Product:** barcode, name, brand, ingredients, nutrition per 100 g, allergens, additives, labels, nutriScore, nova, source ("off" or "user"), confidence

## 7. Security (planned)

Password hashing (bcrypt), JWT auth, input validation, helmet, rate limiting, CORS allow-list, secrets in environment variables, API keys never exposed to the browser.

## 8. Deployment (planned)

Client on Vercel, API on Render, database on MongoDB Atlas (free tiers). ML service on Render or exported to run inside the API.

## 9. Known limitations

Open Food Facts coverage for Indian products, OCR on curved packs and glare, mixed Hindi/English labels, estimate accuracy for ingredients-only products, community data quality. Rating is not medical advice.
