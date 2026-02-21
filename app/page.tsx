"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./auth.module.css";
import { setUserName } from "@/lib/user-store";

/* ─────────────────────────────────────────────────────────────
   Animated Cypher Hex + Gem Logo
   1. Hex outline draws on (stroke-dashoffset)
   2. Diamond gem pops in (scale + rotate)
   3. Glow pulses forever
   ───────────────────────────────────────────────────────────── */
const CypherLogo = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 64, height: 64 }}
    >
        <style>{`
            @keyframes cy-drawHex {
                from { stroke-dashoffset: 62; }
                to   { stroke-dashoffset: 0;  }
            }
            @keyframes cy-popGem {
                0%   { transform: scale(0) rotate(-120deg); opacity: 0; }
                70%  { transform: scale(1.2) rotate(10deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg);   opacity: 1; }
            }
            @keyframes cy-glow {
                0%,100% { filter: drop-shadow(0 0 3px rgba(255,255,255,0.3)); }
                50%     { filter: drop-shadow(0 0 18px rgba(255,255,255,0.9)); }
            }
            .cy-hex {
                stroke: var(--text-primary);
                fill: none;
                stroke-dasharray: 62;
                stroke-dashoffset: 62;
                animation: cy-drawHex 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
            }
            .cy-gem {
                transform-origin: 12px 12px;
                fill: var(--text-primary);
                opacity: 0;
                animation:
                    cy-popGem 0.7s cubic-bezier(0.34,1.56,0.64,1) 1s forwards,
                    cy-glow   3s ease-in-out 2s infinite;
            }
        `}</style>
        <path className="cy-hex" d="M20 7L12 2.5L4 7V17L12 21.5L20 17" />
        <polygon className="cy-gem" points="12,9 15,12 12,15 9,12" stroke="none" />
    </svg>
);

/* ─────────────────────────────────────────────────────────────
   Bubble grid data
   33vw circles, 4 rows × 5 cols
   Even rows (0,2) → base margin (-16.5vw)
   Odd rows  (1,3) → offset margin (0)

   Color strings map to CSS classes via CMAP below.
   Using a static map so CSS Modules can resolve class names.
   ───────────────────────────────────────────────────────────── */
const ROWS: string[][] = [
    ["sf", "sf2", "grn", "grn", "sf"],   // row 0  base
    ["grn", "sf", "wht", "sf2", "grn"],   // row 1  offset
    ["gry", "sf", "grn", "sf", "gry"],   // row 2  base
    ["sf", "grn", "sf2", "sf", "sf"],   // row 3  offset
];

/* Static reference map — CSS Modules resolves each key at build time */
const CMAP: Record<string, string> = {
    grn: styles.bGrn,
    sf: styles.bSf,
    sf2: styles.bSf2,
    wht: styles.bWht,
    gry: styles.bGry,
};

/* ───────────────────────────────────────────────────────────── */
const CARDS = [
    {
        label: "AI Engine",
        title: "Detect phishing\nbefore you pay",
        body: "Instant QR analysis — know if a UPI request is real or a scam.",
    },
    {
        label: "ML Risk Score",
        title: "Block fraud\nin milliseconds",
        body: "Our model flags suspicious UPI IDs and stops malicious requests cold.",
    },
    {
        label: "Real-Time",
        title: "Monitor every\ntransaction",
        body: "Live threat scoring on every scan — your personal UPI bodyguard.",
    },
];

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

type AuthMode = "intro" | "auth";
type Phase = "splash" | "intro";

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Page() {
    const router = useRouter();

    /* phase: splash (bubbles + logo only) → intro (flashcards revealed) */
    const [phase, setPhase] = useState<Phase>("splash");
    const [cardIdx, setCardIdx] = useState(0);
    const [authMode, setAuthMode] = useState<AuthMode>("intro");
    const [authTab, setAuthTab] = useState<"signin" | "signup">("signup");
    const [name, setName] = useState("");

    /* Advance splash → intro after 3.5 s */
    useEffect(() => {
        const t = setTimeout(() => setPhase("intro"), 3500);
        return () => clearTimeout(t);
    }, []);

    /* Auto-rotate cards only while in intro */
    useEffect(() => {
        if (phase !== "intro" || authMode !== "intro") return;
        const t = setInterval(() => setCardIdx(p => (p + 1) % CARDS.length), 4000);
        return () => clearInterval(t);
    }, [phase, authMode]);

    const goToDashboard = () => {
        if (name.trim()) setUserName(name);
        router.push("/dashboard");
    };

    /* ── Bubble field — shared between splash and intro ── */
    const BubbleField = () => (
        <div className={styles.bubbleField}>
            {ROWS.map((row, ri) => (
                <div key={ri}
                    className={`${styles.bubbleRow} ${ri % 2 === 0 ? styles.rowBase : styles.rowOffset}`}>
                    {row.map((key, ci) => (
                        <div key={ci}
                            className={`${styles.bubble} ${CMAP[key]}`}
                            style={{ animationDelay: `${(ri * 5 + ci) * 0.15}s` }}
                        />
                    ))}
                </div>
            ))}

            {/* Logo always centered in bubble area */}
            <div className={styles.logoWrap}>
                <CypherLogo />
                <span className={styles.logoName}>CYPHER</span>
            </div>

            {/* Fades bubble field into page bg */}
            <div className={styles.bubbleFade} />
        </div>
    );

    /* ────────────────────────────────────────────────────────
       INTRO VIEW
       ──────────────────────────────────────────────────────── */
    if (authMode === "intro") {
        const card = CARDS[cardIdx];
        return (
            <div className={styles.page}>
                <BubbleField />

                {/* slide up after splash */}
                <div className={phase === "splash" ? styles.contentHidden : styles.contentVisible}>
                    <div className={styles.card} key={cardIdx}>
                        <span className={styles.cardLabel}>{card.label}</span>
                        <h1 className={styles.cardTitle}>
                            {card.title.split("\n").map((l, i) => (
                                <span key={i}>{l}<br /></span>
                            ))}
                        </h1>
                        <p className={styles.cardBody}>{card.body}</p>
                    </div>

                    <div className={styles.dots}>
                        {CARDS.map((_, i) => (
                            <button key={i}
                                className={`${styles.dot} ${i === cardIdx ? styles.dotOn : ""}`}
                                onClick={() => setCardIdx(i)}
                            />
                        ))}
                    </div>

                    <button className={styles.btnPrimary}
                        onClick={() => { setAuthMode("auth"); setAuthTab("signup"); }}>
                        Get Started
                    </button>

                    <p className={styles.hint}>
                        Already have an account?{" "}
                        <span onClick={() => { setAuthMode("auth"); setAuthTab("signin"); }}>
                            Log In
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    /* ────────────────────────────────────────────────────────
       AUTH VIEW
       ──────────────────────────────────────────────────────── */
    return (
        <div className={styles.page}>
            <div className={styles.authPage}>
                <button className={styles.backBtn} onClick={() => setAuthMode("intro")}>
                    <BackIcon /> Back
                </button>

                <p className={styles.authEyebrow}>
                    {authTab === "signup" ? "New Account" : "Welcome Back"}
                </p>
                <h2 className={styles.authTitle}>
                    {authTab === "signup" ? "Create Account" : "Sign In"}
                </h2>

                {/* Tab toggle */}
                <div className={styles.toggle}>
                    {(["signin", "signup"] as const).map(t => (
                        <button key={t}
                            className={`${styles.toggleBtn} ${authTab === t ? styles.toggleOn : ""}`}
                            onClick={() => setAuthTab(t)}>
                            {t === "signin" ? "Sign In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                {/* Inputs */}
                <div className={styles.inputs}>
                    <input className={styles.input} type="email"
                        placeholder="Email" autoComplete="email" />
                    {authTab === "signup" && (
                        <input className={styles.input} type="text"
                            placeholder="Username" value={name}
                            onChange={e => setName(e.target.value)} />
                    )}
                    <input className={styles.input} type="password"
                        placeholder="Password" autoComplete="current-password" />
                </div>

                <button className={styles.btnPrimary} onClick={goToDashboard}>
                    {authTab === "signup" ? "Create Account" : "Sign In"}
                </button>

                <div className={styles.divider}><span>or</span></div>

                <div className={styles.socialRow}>
                    <button className={styles.socialBtn}>
                        {/* Google */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.62-.68z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className={styles.socialBtn}>
                        {/* Facebook */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                <p className={styles.switchHint}>
                    {authTab === "signup"
                        ? <><span className={styles.muted}>Have an account? </span><span className={styles.link} onClick={() => setAuthTab("signin")}>Sign In</span></>
                        : <><span className={styles.muted}>No account? </span><span className={styles.link} onClick={() => setAuthTab("signup")}>Sign Up</span></>
                    }
                </p>
            </div>
        </div>
    );
}
