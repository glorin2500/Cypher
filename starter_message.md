# Cypher - UPI Threat Detection System
**Last Updated: Feb 18, 2026**

---

## 🚀 Live Deployments
- **Frontend (Vercel)**: https://cypher-self.vercel.app
- **Backend (Railway)**: https://cypher-backend-production.up.railway.app
- **GitHub Repo**: https://github.com/glorin2500/Cypher

---

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), CSS Modules |
| Backend | FastAPI (Python), Uvicorn |
| ML | scikit-learn Random Forest, joblib, numpy |
| Hosting | Vercel (frontend), Railway (backend) |
| Scanning | html5-qrcode |

---

## 📂 Project Structure

```
CYPHERR/
├── app/
│   ├── dashboard/          # Main hub, risk graph, recent scans
│   ├── scanner/            # Live camera QR scanning
│   ├── upload/             # Image upload QR analysis
│   ├── manual/             # Manual UPI ID entry
│   ├── analytics/          # Threat analysis charts
│   ├── profile/            # User settings
│   ├── context/            # ScanContext, ThemeContext
│   ├── components/         # BottomNav, shared components
│   └── globals.css         # Global styles, Monocraft font
├── lib/
│   ├── scanner-api.ts      # Backend API calls (uses Railway URL)
│   └── upi-handler.ts      # UPI deep link builder + validation
├── backend/
│   ├── main.py             # FastAPI app entry point
│   ├── requirements.txt    # Python deps (fastapi, sklearn, etc.)
│   ├── app/
│   │   ├── routers/ml.py   # ML API endpoints
│   │   └── services/cypher_ml_logic.py  # Hybrid risk scoring
│   └── ml/
│       ├── dataset_generator.py  # Synthetic UPI dataset (10k+)
│       ├── feature_extractor.py  # 11 numerical features
│       ├── train_model.py        # Model training script
│       ├── predictor.py          # Inference wrapper
│       ├── models/               # Saved .pkl model files
│       └── README.md
├── vercel.json             # Vercel deployment config
├── DEPLOYMENT.md           # Full deployment guide
└── starter_message.md      # This file
```

---

## ✨ All Features Implemented

### Scanning & Detection
- Live camera QR scanner with spotlight overlay effect
- Gallery/image upload QR decoding
- Manual UPI ID entry with validation
- Auto-redirect to upload on non-HTTPS (mobile fallback)

### Risk Analysis Engine
- **Hybrid scoring**: ML (60%) + Rule-based (40%)
- **ML Model**: Random Forest trained on 10,000+ synthetic UPI IDs
- **11 features**: length, entropy, digit ratio, domain reputation, brand distance, phishing keywords, etc.
- **Risk labels**: `safe` (green) / `warning` (orange) / `danger` (red)
- **API endpoints**:
  - `POST /analyze` — main risk analysis
  - `POST /api/ml/predict_payee_risk` — direct ML prediction
  - `GET /api/ml/health` — model health check

### Dashboard
- Safety Score with **Minecraft/Monocraft font** (pixelated)
- Pulsing green/red animation based on score
- Live Risk Monitor graph (SVG, smooth curves)
- Recent Scans list with risk labels and timestamps
- Scan / Upload / Manual action buttons

### UPI Payment Flow
- Preserves full original UPI string from QR scan
- Builds deep link: `upi://pay?pa=...&pn=...&am=...&cu=INR`
- Always includes `cu=INR` (was missing — caused payment failures)
- VPA format validation (must contain `@`)
- Amount validation (must be positive number)
- Clipboard fallback if UPI app launch fails
- Proper async error handling (fixed `[object Event]` runtime error)

### UI/UX
- Premium dark/monochrome theme
- Glassmorphism cards, smooth transitions
- Bottom navigation (hidden on scanner/upload/manual pages)
- Light/dark theme toggle
- Mobile-first responsive design

---

## 🐛 Bugs Fixed in This Session

| Bug | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'feature_extractor'` | Changed to `from ml.feature_extractor import` |
| UPI payment opens but fails | Added `cu=INR`, proper URL encoding, original UPI string preservation |
| `[object Event]` runtime error | Wrapped async handler in IIFE with `.catch()` |
| Duplicate `--font-pixel` CSS variable | Cleaned up globals.css |
| ML router import path wrong | Fixed `sys.path` resolution using `os.path.abspath` |

---

## 🔑 Key Files & What They Do

| File | Purpose |
|---|---|
| `lib/scanner-api.ts` | All backend API calls; uses `NEXT_PUBLIC_API_URL` env var or Railway URL |
| `lib/upi-handler.ts` | Parses, validates, and builds UPI deep links |
| `app/dashboard/overlays.tsx` | Result modal with `handleProceed` for UPI payment |
| `app/dashboard/page.tsx` | Dashboard with safety score (Monocraft font) |
| `app/globals.css` | `--font-pixel: 'Monocraft'`, `--font-family: 'Urbanist'` |
| `backend/app/services/cypher_ml_logic.py` | Blends ML + rule scores |
| `backend/app/routers/ml.py` | FastAPI ML endpoints |
| `backend/ml/predictor.py` | Loads model, runs inference |

---

## ⚙️ Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://cypher-backend-production.up.railway.app
```
*(If not set, falls back to the Railway URL hardcoded in scanner-api.ts)*

### Backend (Railway)
- No special env vars required; runs on `PORT` provided by Railway.

---

## 🚢 Deployment Commands

### Frontend
```bash
vercel --prod
# Already linked to: glorins-projects-0b8619fe/cypher
```

### Backend
```bash
cd backend
railway up
# Project: cypher-backend (glorin2500's Projects)
```

### Push to GitHub
```bash
git add .
git commit -m "your message"
git push origin main
```
*(Vercel auto-redeploys on push to main)*

---

## 🔮 Suggested Next Steps
1. Set `NEXT_PUBLIC_API_URL` as a Vercel environment variable (cleaner than hardcoded)
2. Add real UPI QR code testing on mobile
3. Monitor Railway backend cold starts (free tier sleeps after inactivity)
4. Consider adding user auth if storing scan history server-side
5. Explore Capacitor to wrap the app as a native Android/iOS app
