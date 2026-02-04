# 🚀 Cypher - Handover Context (Project State)

**Current Date**: 2026-02-04
**Project**: CYPHER (UPI Security Checkpoint)
**Location**: `c:\Users\Glorin\.gemini\antigravity\scratch\CYPHERR`

---

## 🛑 Current Objective
Build a "Security Checkpoint" app that sits *before* a UPI payment app. It scans a QR/VPA, analyzes it for fraud, and gives a **SAFE/DANGEROUS** verdict. Requires a pixel-perfect, premium UI.

## 🛠️ Tech Stack
*   **Frontend**: Next.js 15 (App Router), React, CSS Modules.
*   **Backend**: Python (FastAPI).
*   **State Management**: `ScanContext` (React Context) for history and risk scores.
*   **Design System**: **Strict Monochrome (Black & White)**. High contrast, clean, premium.
*   **Icons**: Lucide React + Custom SVG mappings.

---

## ✅ Recent Accomplishments

### 1. Theme Overhaul (Monochrome)
*   **Reverted from Green/Gold**: The entire app (`app/page.tsx`, `auth.module.css`, `dashboard`) has been updated to a strict Black & White aesthetic.
*   **Fixes**: Removed all placeholder "green" comments and variables from auth styles.

### 2. Dashboard (`app/dashboard/page.tsx`)
*   **Layout**: Implemented reference `TransactionItem` structure for "Recent Scans".
*   **Features**:
    *   **Balance Card**: Displays Safety Score (98%).
    *   **Action Grid**: Scan, Upload, Manual buttons triggering overlays.
    *   **Recent Scans**: Lists transactions with correct icons (Shield/Alert) and "Risk Detected" states.
*   **Overlays**: Implemented `ScannerView`, `UploadView`, and `ManualView` as overlays instead of separate routes for a smoother UX.

### 3. Analytics (`app/analytics/page.tsx`)
*   **UI Overhaul**: Completely rewrote the page to match the user's reference code.
*   **Features**:
    *   **Threats Blocked**: Bar chart with Week/Month toggles.
    *   **Risk Vectors**: Progress bars showing specific threats (Spoofed VPAs, Malicious QRs).
    *   **Integration**: Connected to `ScanContext` for live data.

### 4. Scanner & Integration
*   **Integration**: `html5-qrcode` fully wired up.
*   **Flow**: Scan -> Processing Animation -> Result Modal -> Proceed to Payment (Deep Link) or Cancel.
*   **State**: `ScanContext` creates a single source of truth for Scan History and Safety Scores, persisting across pages.

---

## 📋 Immediate Next Steps (To-Do)

1.  **Backend Connection**:
    *   Ensure the `scanner-api` calls the actual Python backend (`http://localhost:8000/analyze`) for real analysis (currently using mock logic for UI dev).
2.  **Profile Page**:
    *   Polish the Profile UI if needed to match the new Monochrome standard.
3.  **Persist Data**:
    *   Currently using `localStorage` in `ScanContext`. Consider robust database if scale increases.

---

## 💡 Important Context for Next Session
*   **Theme Rule**: **NO COLORED ACCENTS** (except for functional status like Red for Risk, Green for Safe). The core UI must be Black/White/Gray.
*   **Visual Fidelity**: We are strictly following reference implementations for list items and charts. Do not deviate from the `TransactionItem` structure in the dashboard.
*   **Icons**: Use the custom SVG dictionary in `dashboard/page.tsx` for specific list icons (Shield, Alert) to ensure they render as graphics, not text.

**Start Command**: `npm run dev` (Frontend) + `python main.py` (Dashboard Backend).
