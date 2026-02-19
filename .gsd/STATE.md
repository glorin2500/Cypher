# STATE.md — Cypher Session Memory
**Last Updated: Feb 18, 2026 | 18:31 IST**

> Update this file at the end of every session with what was done and what's next.
> This is your "where did I leave off?" file.

---

## 📍 Current Status

**Active Milestone:** Milestone 2 — Stability & Polish
**Current Phase:** Phase 1 — Infrastructure
**Last Action:** Set up GSD context files (.gsd/ folder)

---

## ✅ What Was Done This Session (Feb 18, 2026)

- Reviewed GSD (Get Shit Done) methodology from GitHub
- Created `.gsd/` folder with 4 context files:
  - `SPEC.md` — full project specification (FINALIZED)
  - `ARCHITECTURE.md` — system design, data flow, file maps
  - `ROADMAP.md` — phased development plan
  - `STATE.md` — this file (session memory)
- Previous sessions fixed:
  - `ModuleNotFoundError: No module named 'feature_extractor'` → fixed import paths
  - UPI payment failures → added `cu=INR`, preserved original UPI string
  - `[object Event]` runtime error → wrapped async handler in IIFE
  - Duplicate `--font-pixel` CSS variable → cleaned up globals.css
  - ML router import path → fixed `sys.path` resolution

---

## 🔜 Next Steps (Pick Up Here)

1. **Quick win**: Move hardcoded Railway URL to Vercel env var
   - File: `lib/scanner-api.ts` (line 38 and 96)
   - Action: Ensure `NEXT_PUBLIC_API_URL` is set in Vercel dashboard
   - Already coded correctly, just needs the env var set in Vercel

2. **UX**: Add cold-start loading state
   - Railway free tier sleeps after inactivity (~30s cold start)
   - Show a "Backend waking up..." banner when `/health` is slow

3. **Testing**: Real device QR testing
   - Test on physical Android with PhonePe/GPay installed
   - Verify full flow: scan → risk result → payment deep link

---

## 🐛 Known Issues / Gotchas

| Issue | Status | Notes |
|---|---|---|
| Railway cold starts | ⚠️ Active | Free tier sleeps; ~30s delay on first request |
| `frequency_risk` is placeholder | ⚠️ Active | Always returns 0.1, needs transaction history |
| `device_risk` is placeholder | ⚠️ Active | Always returns 0.0, needs device fingerprinting |
| Scan history is in-memory | ⚠️ Active | Lost on backend restart; needs DB for persistence |
| CORS allows all origins | ⚠️ Low priority | Fine for demo, tighten for production |

---

## 🔑 Key Context for Next Session

- **Frontend**: Next.js 15 App Router, deployed on Vercel
- **Backend**: FastAPI + Uvicorn, deployed on Railway (project: cypher-backend)
- **ML**: Random Forest, trained on synthetic data, loaded at startup via `predictor.py`
- **Git**: Push to `main` → Vercel auto-redeploys frontend
- **Backend deploy**: `cd backend && railway up` (manual)
- **Local dev**: `npm run dev` (frontend), `uvicorn main:app --reload` (backend)

---

## 📝 Session Log

| Date | Summary |
|---|---|
| Feb 18, 2026 | Fixed ML import errors, UPI payment bugs, set up GSD context files |
| *(earlier)* | Built MVP: scanner, upload, manual entry, dashboard, ML backend, deployment |
