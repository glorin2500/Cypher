# ROADMAP.md — Cypher Development Roadmap
**Last Updated: Feb 18, 2026**

---

## ✅ Milestone 1 — MVP (COMPLETE)

> Core scanning, ML risk engine, dashboard, UPI payment flow

- [x] Live camera QR scanner with spotlight overlay
- [x] Image upload QR decoder
- [x] Manual UPI ID entry
- [x] FastAPI backend with hybrid ML + rule scoring
- [x] Random Forest model trained on 10k+ synthetic UPI IDs
- [x] Risk labels: safe / warning / danger
- [x] Dashboard with safety score (Monocraft font), risk graph, recent scans
- [x] UPI deep link builder with `cu=INR` fix
- [x] Local fallback scoring when backend is down
- [x] Dark/light theme toggle
- [x] Bottom navigation
- [x] Deployed: Vercel (frontend) + Railway (backend)

---

## 🔄 Milestone 2 — Stability & Polish (NEXT)

> Make the app production-ready and reliable

### Phase 1 — Infrastructure
- [ ] Set `NEXT_PUBLIC_API_URL` as a Vercel environment variable (remove hardcoded URL)
- [ ] Add Railway wake-up ping (prevent cold starts on free tier)
- [ ] Add loading skeleton UI while backend wakes up
- [ ] Add error boundary components for graceful failure UI

### Phase 2 — Testing
- [ ] Test with real UPI QR codes on physical Android/iOS devices
- [ ] Add frontend unit tests (Jest + React Testing Library)
- [ ] Expand backend ML test coverage (`test_ml_enhanced.py`)
- [ ] Add E2E test for full scan → result → payment flow (Playwright)

### Phase 3 — UX Improvements
- [ ] Show cold-start warning banner ("Backend waking up, please wait...")
- [ ] Add haptic feedback on mobile for risk result
- [ ] Improve analytics page with real scan data visualization
- [ ] Add "copy UPI ID" button on result screen

---

## 🔮 Milestone 3 — Feature Expansion

> Extend capabilities and user value

### Phase 4 — Real Data & Intelligence
- [ ] Integrate real UPI ID reputation database (RBI/NPCI data if available)
- [ ] Add frequency tracking (detect same UPI ID scanned multiple times)
- [ ] Add device fingerprinting for `device_risk` feature (currently placeholder 0.0)
- [ ] Improve ML model with real-world labeled data

### Phase 5 — User Accounts
- [ ] Add user authentication (NextAuth.js or Clerk)
- [ ] Persistent server-side scan history per user
- [ ] User-specific risk preferences (e.g., custom amount thresholds)
- [ ] Export scan history as PDF/CSV

### Phase 6 — Native App
- [ ] Wrap with Capacitor for native Android/iOS
- [ ] Native camera access (faster than html5-qrcode on mobile)
- [ ] Push notifications for high-risk scan alerts
- [ ] App Store / Play Store submission

---

## 💡 Backlog (Unscheduled Ideas)

- [ ] QR code generator for testing (generate safe/dangerous test QRs)
- [ ] Browser extension for UPI ID checking on websites
- [ ] Merchant whitelist/blacklist (community-driven)
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Offline ML model (run inference in-browser via ONNX/TensorFlow.js)
- [ ] Share risk report as image (for WhatsApp warnings)

---

## 📊 Progress Summary

| Milestone | Status | Completion |
|---|---|---|
| Milestone 1 — MVP | ✅ Complete | 100% |
| Milestone 2 — Stability | 🔄 Next | 0% |
| Milestone 3 — Expansion | 📋 Planned | 0% |
