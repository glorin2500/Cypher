# SPEC.md — Cypher Project Specification
**Status: FINALIZED**
**Last Updated: Feb 18, 2026**

---

## 🎯 What Is Cypher?

Cypher is a **mobile-first UPI QR code threat detection app** that scans, analyzes, and flags potentially fraudulent UPI payment IDs before a user proceeds with a payment. It combines a machine learning model with rule-based heuristics to produce a risk score and label for any UPI transaction.

---

## 👤 Target Users

- Indian mobile users making UPI payments daily
- Anyone who scans QR codes at shops, online, or from unknown sources
- Users who want a safety check before paying

---

## ✅ Core Features (IMPLEMENTED)

### Input Methods
- **Live Camera QR Scanner** — real-time scanning with spotlight overlay (html5-qrcode)
- **Image Upload QR Decoder** — decode QR from gallery images
- **Manual UPI ID Entry** — type in a UPI ID directly with validation

### Risk Analysis Engine
- **Hybrid scoring**: ML model (60%) + rule-based heuristics (40%)
- **ML Model**: Random Forest trained on 10,000+ synthetic UPI IDs (scikit-learn)
- **11 ML features**: length, entropy, digit ratio, domain reputation, brand distance, phishing keywords, etc.
- **5 runtime features**: `amount_risk`, `payee_risk`, `frequency_risk`, `timing_risk`, `device_risk`
- **Risk labels**: `safe` (green) / `warning` (orange) / `danger` (red)
- **Fallback**: deterministic local scoring if backend is unreachable

### API Endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/analyze` | POST | Main hybrid risk analysis |
| `/api/ml/predict_payee_risk` | POST | Direct ML prediction |
| `/api/ml/health` | GET | Model health check |
| `/history` | GET | In-session scan history |
| `/health` | GET | Backend health check |
| `/api/user/settings` | GET | User settings |
| `/api/user/info` | POST | Update user info |
| `/api/user/notifications` | POST | Update notification prefs |
| `/api/user/preferences` | POST | Update UI preferences |

### Dashboard
- Safety Score with Monocraft (pixel) font
- Pulsing green/red animation based on score
- Live Risk Monitor graph (SVG, smooth curves)
- Recent Scans list with risk labels and timestamps
- Action buttons: Scan / Upload / Manual

### UPI Payment Flow
- Preserves full original UPI string from QR scan
- Builds deep link: `upi://pay?pa=...&pn=...&am=...&cu=INR`
- VPA format validation (must contain `@`)
- Amount validation (must be positive number)
- Clipboard fallback if UPI app launch fails

### UI/UX
- Premium dark/monochrome theme
- Glassmorphism cards, smooth transitions
- Monocraft pixel font for scores, Urbanist for body
- Bottom navigation (hidden on scanner/upload/manual pages)
- Light/dark theme toggle
- Mobile-first responsive design

---

## 🚫 Out of Scope (Current Version)

- User authentication / accounts
- Server-side persistent scan history (currently in-memory only)
- Real-time UPI ID database lookup
- Native Android/iOS app (web only for now)
- Payment execution (Cypher only analyzes, never processes payments)

---

## 🌐 Live Deployments

| Service | URL |
|---|---|
| Frontend (Vercel) | https://cypher-self.vercel.app |
| Backend (Railway) | https://cypher-backend-production.up.railway.app |
| GitHub | https://github.com/glorin2500/Cypher |

---

## ⚙️ Environment Variables

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel | `https://cypher-backend-production.up.railway.app` |

> Backend runs on `PORT` provided by Railway. No other env vars required.

---

## 🔒 Constraints & Rules

1. Frontend must always work even if backend is down (local fallback in `scanner-api.ts`)
2. Never store sensitive UPI data server-side beyond the current session
3. Always include `cu=INR` in UPI deep links
4. VPA must contain `@` — validate before any payment attempt
5. ML model must be loaded at startup, not per-request
