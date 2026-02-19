# ARCHITECTURE.md — Cypher System Design
**Last Updated: Feb 18, 2026**

---

## 🗺️ System Overview

```
┌─────────────────────────────────────────────────────┐
│                  USER (Mobile Browser)               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│           FRONTEND — Next.js 15 (Vercel)             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Scanner  │  │  Upload  │  │  Manual Entry      │ │
│  │ /scanner │  │ /upload  │  │  /manual           │ │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘ │
│       │              │                 │             │
│  ┌────▼──────────────▼─────────────────▼───────────┐ │
│  │         lib/scanner-api.ts                       │ │
│  │  analyzeQRString() → extractFeaturesFromUPI()    │ │
│  │  → analyzeQRPayload() → POST /analyze            │ │
│  │  (fallback: local deterministic scoring)         │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼─────────────────────────────┐ │
│  │         app/dashboard/ (Result + History)         │ │
│  │  overlays.tsx → handleProceed() → UPI deep link  │ │
│  │  lib/upi-handler.ts → builds upi://pay?... link  │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────┐
│           BACKEND — FastAPI (Railway)                │
│                                                      │
│  main.py                                             │
│  ├── POST /analyze → app/services/inference.py       │
│  │       └── app/services/cypher_ml_logic.py         │
│  │           ├── ML score (60%) via predictor.py     │
│  │           └── Rule score (40%) via heuristics     │
│  ├── GET  /history → in-memory scan_history[]        │
│  ├── GET  /health                                    │
│  ├── POST /api/ml/predict_payee_risk                 │
│  ├── GET  /api/ml/health                             │
│  └── /api/user/* → user_settings.py (JSON file)     │
│                                                      │
│  ML Pipeline (backend/ml/)                           │
│  ├── dataset_generator.py  → 10k+ synthetic UPI IDs │
│  ├── feature_extractor.py  → 11 numerical features  │
│  ├── train_model.py        → trains Random Forest   │
│  ├── predictor.py          → loads .pkl, runs infer │
│  └── models/               → saved .pkl model files │
└──────────────────────────────────────────────────────┘
```

---

## 📁 Frontend File Map

```
app/
├── page.tsx              # Auth/landing page
├── layout.tsx            # Root layout, font loading
├── globals.css           # Design tokens, Monocraft font, theme vars
├── dashboard/
│   ├── page.tsx          # Main dashboard (safety score, graph, history)
│   ├── overlays.tsx      # Result modal + handleProceed() UPI payment
│   ├── RiskGraph.tsx     # SVG live risk monitor
│   └── dashboard.module.css
├── scanner/page.tsx      # Live camera QR scanner (html5-qrcode)
├── upload/page.tsx       # Gallery image QR decoder
├── manual/page.tsx       # Manual UPI ID entry
├── analytics/page.tsx    # Threat analysis charts
├── profile/page.tsx      # User settings UI
├── context/
│   ├── ScanContext.tsx   # Global scan state (results, history)
│   └── ThemeContext.tsx  # Light/dark theme toggle
└── components/
    └── BottomNav.tsx     # Bottom navigation bar

lib/
├── scanner-api.ts        # All backend API calls + local fallback
└── upi-handler.ts        # UPI deep link builder + VPA validation
```

---

## 📁 Backend File Map

```
backend/
├── main.py                          # FastAPI app, CORS, route registration
├── requirements.txt                 # fastapi, uvicorn, scikit-learn, joblib, numpy
├── app/
│   ├── schemas.py                   # Pydantic models (TransactionInput, AnalysisResult)
│   ├── user_settings.py             # JSON-based user settings persistence
│   ├── routers/
│   │   └── ml.py                    # /api/ml/* endpoints
│   └── services/
│       ├── inference.py             # analyze_transaction() orchestrator
│       └── cypher_ml_logic.py       # Hybrid ML + rule scoring logic
└── ml/
    ├── dataset_generator.py
    ├── feature_extractor.py         # 11 features from UPI ID string
    ├── train_model.py
    ├── predictor.py                 # Loads model, runs inference
    └── models/                      # .pkl files (Random Forest)
```

---

## 🔄 Data Flow: QR Scan → Risk Result

```
1. User scans QR code (camera / image / manual)
2. Raw UPI string: "upi://pay?pa=merchant@paytm&pn=Shop&am=500"
3. scanner-api.ts: analyzeQRString(text)
   a. Parse UPI params (pa, am, pn)
   b. extractFeaturesFromUPI() → 5 runtime features
   c. POST /analyze with features JSON
4. Backend: analyze_transaction()
   a. cypher_ml_logic.py:
      - ML score: predictor.py → Random Forest → probability
      - Rule score: heuristics on UPI ID patterns
      - Hybrid: 0.6 * ml_score + 0.4 * rule_score
   b. Returns: { risk_label, risk_score, reasons[] }
5. Frontend: displays result in overlay modal
   - safe → green, warning → orange, danger → red
6. User clicks "Proceed" → upi-handler.ts builds deep link
   → Opens UPI app (PhonePe, GPay, etc.)
```

---

## 🔑 Key Design Decisions

| Decision | Rationale |
|---|---|
| Hybrid ML + rules | Pure ML on synthetic data can miss edge cases; rules catch known patterns |
| Local fallback scoring | Railway free tier sleeps; app must work offline |
| In-memory scan history | No auth system yet; server-side persistence requires user accounts |
| Preserve original UPI string | Parsing and rebuilding UPI strings caused payment failures |
| `cu=INR` always included | Missing currency code caused UPI app payment failures |
| Next.js App Router | Server components + streaming for better mobile performance |

---

## 🌐 Deployment Architecture

```
GitHub (main branch)
    │
    ├── push → Vercel auto-deploy (Frontend)
    │           URL: cypher-self.vercel.app
    │           Env: NEXT_PUBLIC_API_URL
    │
    └── railway up (Backend, manual)
                URL: cypher-backend-production.up.railway.app
                Runtime: Python 3.x + Uvicorn
                Note: Free tier sleeps after inactivity (~30s cold start)
```
