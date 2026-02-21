"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./auth.module.css";
import { setUserName } from "@/lib/user-store";

// ── Animated Logo ─────────────────────────────────────────────
const CypherLogo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={styles.logo}>
        <style>{`
            @keyframes drawHex {
                from { stroke-dashoffset: 60; }
                to   { stroke-dashoffset: 0;  }
            }
            @keyframes revealGem {
                from { transform: scale(0) rotate(-90deg); opacity: 0; }
                to   { transform: scale(1) rotate(0deg);   opacity: 1; }
            }
            @keyframes glowPulse {
                0%,100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.35)); }
                50%     { filter: drop-shadow(0 0 16px rgba(255,255,255,0.9)); }
            }
            .hexPath {
                stroke: #ffffff;
                stroke-dasharray: 60;
                stroke-dashoffset: 60;
                animation: drawHex 1.5s cubic-bezier(0.22,1,0.36,1) forwards 0.3s;
            }
            .gemPath {
                transform-origin: 12px 12px;
                fill: #ffffff;
                animation:
                    revealGem 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards 1s,
                    glowPulse 3s ease-in-out infinite 2.2s;
                opacity: 0;
            }
        `}</style>
        <path className="hexPath" d="M20 7L12 2.5L4 7V17L12 21.5L20 17" fill="none" />
        <path className="gemPath" d="M12 9L15 12L12 15L9 12Z" stroke="none" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────
//  BUBBLE GRID — 4 rows × 5 circles, each 33vw wide (3 visible per row)
//  Alternating rows offset by 16.5vw → exact stagger like reference image.
//  Colors use CSS classes that map to app CSS variables.
//  Each bubble gets a unique animationDelay for the floating animation.
//
//  CSS class → CSS variable mapping:
//    "green"    → var(--primary-green)   #34C759
//    "surface"  → var(--surface-bg)      #141414
//    "surface2" → var(--surface-hover)   #1A1A1A
//    "white"    → var(--text-primary)    #fff
//    "gray"     → #b0b0b0 (neutral)
// ─────────────────────────────────────────────────────────────────────────
const ROWS: string[][] = [
    ["surface", "surface2", "green", "green", "surface"],
    ["green", "surface", "white", "surface", "green"],
    ["gray", "surface", "green", "surface2", "gray"],
    ["surface", "green", "surface", "surface2", "surface"],
];

// ─────────────────────────────────────────────────────────────
const flashcards = [
    {
        label: "AI Engine",
        title: "Detect phishing\nbefore you pay",
        body: "Instant QR analysis — know if a UPI request is real or a scam",
    },
    {
        label: "ML Risk Score",
        title: "Block fraud\nin milliseconds",
        body: "Our model flags suspicious UPI IDs and stops malicious requests cold",
    },
    {
        label: "Real-Time",
        title: "Monitor every\ntransaction",
        body: "Live threat scoring on every scan — your personal UPI bodyguard",
    },
];

const ArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 18, height: 18 }}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

type AuthMode = "intro" | "auth";

export default function AuthPage() {
    const router = useRouter();
    const [card, setCard] = useState(0);
    const [authMode, setAuthMode] = useState<AuthMode>("intro");
    const [authTab, setAuthTab] = useState<"signin" | "signup">("signup");
    const [name, setName] = useState("");

    useEffect(() => {
        if (authMode !== "intro") return;
        const id = setInterval(() => setCard(p => (p + 1) % flashcards.length), 4000);
        return () => clearInterval(id);
    }, [authMode]);

    const handleContinue = () => {
        if (name.trim()) setUserName(name);
        router.push("/dashboard");
    };

    const f = flashcards[card];

    // ── INTRO ────────────────────────────────────────────────
    if (authMode === "intro") return (
        <div className={styles.page}>

            {/* ====== BUBBLE FIELD ====== */}
            <div className={styles.bubbleField}>
                {ROWS.map((row, ri) => (
                    <div
                        key={ri}
                        className={`${styles.bubbleRow} ${ri % 2 === 0 ? styles.bubbleRowBase : styles.bubbleRowOffset}`}
                    >
                        {row.map((colorClass, ci) => (
                            <div
                                key={ci}
                                className={`${styles.bubble} ${styles[colorClass]}`}
                                style={{ animationDelay: `${(ri * 5 + ci) * 0.18}s` }}
                            />
                        ))}
                    </div>
                ))}

                {/* Animated logo, centered over bubbles */}
                <div className={styles.logoOverlay}>
                    <CypherLogo />
                    <span className={styles.logoLabel}>CYPHER</span>
                </div>

                {/* Gradient fades field into black */}
                <div className={styles.bubbleFade} />
            </div>

            {/* ====== FLASHCARD + CTA ====== */}
            <div className={styles.bottom}>
                <div className={styles.card} key={card}>
                    <span className={styles.cardLabel}>{f.label}</span>
                    <h1 className={styles.cardTitle}>
                        {f.title.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                    </h1>
                    <p className={styles.cardBody}>{f.body}</p>
                </div>

                <div className={styles.dots}>
                    {flashcards.map((_, i) => (
                        <button key={i}
                            className={`${styles.dot} ${i === card ? styles.dotActive : ""}`}
                            onClick={() => setCard(i)} />
                    ))}
                </div>

                <button className={styles.btnPrimary}
                    onClick={() => { setAuthMode("auth"); setAuthTab("signup"); }}>
                    Get Started
                </button>

                <p className={styles.footerHint}>
                    Already have an account?{" "}
                    <span onClick={() => { setAuthMode("auth"); setAuthTab("signin"); }}>Log In</span>
                </p>
            </div>
        </div>
    );

    // ── AUTH ─────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            <div className={styles.authInner}>
                <button className={styles.backBtn} onClick={() => setAuthMode("intro")}>
                    <ArrowLeft /> Back
                </button>

                <div className={styles.authHead}>
                    <p className={styles.authEyebrow}>
                        {authTab === "signup" ? "New Account" : "Welcome Back"}
                    </p>
                    <h2 className={styles.authTitle}>
                        {authTab === "signup" ? "Create Account" : "Sign In"}
                    </h2>
                </div>

                <div className={styles.toggle}>
                    <button className={`${styles.toggleBtn} ${authTab === "signin" ? styles.toggleActive : ""}`}
                        onClick={() => setAuthTab("signin")}>Sign In</button>
                    <button className={`${styles.toggleBtn} ${authTab === "signup" ? styles.toggleActive : ""}`}
                        onClick={() => setAuthTab("signup")}>Sign Up</button>
                </div>

                <div className={styles.inputs}>
                    <input type="email" placeholder="Email"
                        className={styles.input} autoComplete="email" />
                    {authTab === "signup" && (
                        <input type="text" placeholder="Username"
                            className={styles.input}
                            value={name} onChange={e => setName(e.target.value)} />
                    )}
                    <input type="password" placeholder="Password"
                        className={styles.input} autoComplete="current-password" />
                </div>

                <button className={styles.btnPrimary} onClick={handleContinue}>
                    {authTab === "signup" ? "Create Account" : "Sign In"}
                </button>

                <div className={styles.divider}><span>or continue with</span></div>

                <div className={styles.social}>
                    <button className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                <p className={styles.switchHint}>
                    {authTab === "signup"
                        ? <><span className={styles.muted}>Already have an account? </span><span className={styles.link} onClick={() => setAuthTab("signin")}>Sign In</span></>
                        : <><span className={styles.muted}>Don&apos;t have an account? </span><span className={styles.link} onClick={() => setAuthTab("signup")}>Sign Up</span></>
                    }
                </p>
            </div>
        </div>
    );
}
