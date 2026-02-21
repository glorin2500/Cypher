"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./auth.module.css";
import { setUserName } from "@/lib/user-store";

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
    ArrowLeft: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    Fingerprint: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M9 12.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 1.07-.6 3-1.5 4.5" />
        </svg>
    ),
};

// ── Orb config ─────────────────────────────────────────────────────────────
// Each orb: [cx%, cy%, r%, color, animDelay]
const ORBS = [
    { cx: 72, cy: 8, r: 13, color: "#d4f469", delay: 0 },
    { cx: 20, cy: 5, r: 11, color: "#2a2a2a", delay: 0.4 },
    { cx: 48, cy: 3, r: 9, color: "#1e1e1e", delay: 0.8 },
    { cx: 85, cy: 22, r: 10, color: "#3a3a3a", delay: 0.2 },
    { cx: 8, cy: 20, r: 14, color: "#d4f469", delay: 1.0 },
    { cx: 35, cy: 18, r: 8, color: "#ffffff", delay: 0.6 },
    { cx: 60, cy: 24, r: 12, color: "#2a2a2a", delay: 0.3 },
    { cx: 90, cy: 10, r: 7, color: "#1e1e1e", delay: 0.9 },
    { cx: 15, cy: 35, r: 9, color: "#1e1e1e", delay: 0.5 },
    { cx: 55, cy: 38, r: 11, color: "#d4f469", delay: 1.2 },
    { cx: 80, cy: 38, r: 8, color: "#2a2a2a", delay: 0.7 },
    { cx: 30, cy: 42, r: 13, color: "#1a1a1a", delay: 0.1 },
];

// ── Flashcard data ─────────────────────────────────────────────────────────
const flashcards = [
    {
        eyebrow: "AI-Powered",
        title: "Detect phishing\nbefore you pay",
        sub: "Instant QR analysis — know if a payment request is real or a scam",
    },
    {
        eyebrow: "ML Risk Engine",
        title: "Block fraud\nin milliseconds",
        sub: "Our model flags suspicious UPI IDs and stops malicious requests cold",
    },
    {
        eyebrow: "Real-Time",
        title: "Monitor every\ntransaction",
        sub: "Live threat scoring on every scan — your personal UPI bodyguard",
    },
];

type AuthMode = "intro" | "auth";

export default function AuthPage() {
    const router = useRouter();
    const [currentCard, setCurrentCard] = useState(0);
    const [authMode, setAuthMode] = useState<AuthMode>("intro");
    const [authTab, setAuthTab] = useState<"signin" | "signup">("signup");
    const [name, setName] = useState("");
    const [exiting, setExiting] = useState(false);

    // Auto-rotate flashcards
    useEffect(() => {
        if (authMode !== "intro") return;
        const id = setInterval(() => setCurrentCard(p => (p + 1) % flashcards.length), 4000);
        return () => clearInterval(id);
    }, [authMode]);

    const handleGetStarted = () => {
        setExiting(true);
        // small delay so the exit animation plays
        setTimeout(() => { setExiting(false); setAuthMode("auth"); }, 300);
    };

    const handleLogin = () => router.push("/dashboard");
    const handleSignup = () => {
        if (name.trim()) setUserName(name);
        router.push("/dashboard");
    };

    const card = flashcards[currentCard];

    // ── INTRO ──────────────────────────────────────────────────────────────
    if (authMode === "intro") {
        return (
            <div className={styles.introRoot}>

                {/* ── ORB FIELD ── */}
                <div className={styles.orbField}>
                    {ORBS.map((o, i) => (
                        <div
                            key={i}
                            className={styles.orb}
                            style={{
                                left: `${o.cx}%`,
                                top: `${o.cy}%`,
                                width: `${o.r * 2}vw`,
                                height: `${o.r * 2}vw`,
                                maxWidth: `${o.r * 1.2}px`,
                                maxHeight: `${o.r * 1.2}px`,
                                background: o.color,
                                animationDelay: `${o.delay}s`,
                            }}
                        />
                    ))}
                    {/* Bottom gradient fade so orbs blend into content */}
                    <div className={styles.orbFade} />
                </div>

                {/* ── CONTENT ── */}
                <div className={`${styles.introContent} ${exiting ? styles.exitDown : ""}`}>

                    {/* App name — subtle, top-left feel */}
                    <div className={styles.brandBadge}>
                        <span className={styles.brandDot} />
                        CYPHER
                    </div>

                    {/* Flashcard text */}
                    <div className={styles.flashBlock} key={currentCard}>
                        <span className={styles.flashEyebrow}>{card.eyebrow}</span>
                        <h1 className={styles.flashTitle}>
                            {card.title.split("\n").map((line, i) => (
                                <span key={i}>{line}<br /></span>
                            ))}
                        </h1>
                        <p className={styles.flashSub}>{card.sub}</p>
                    </div>

                    {/* Dots */}
                    <div className={styles.dots}>
                        {flashcards.map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.dot} ${i === currentCard ? styles.dotActive : ""}`}
                                onClick={() => setCurrentCard(i)}
                            />
                        ))}
                    </div>

                    {/* CTA */}
                    <button className={styles.ctaBtn} onClick={handleGetStarted}>
                        Get Started
                    </button>

                    <p className={styles.loginHint}>
                        Already have an account?{" "}
                        <span onClick={() => { setAuthMode("auth"); setAuthTab("signin"); }}>
                            Log In
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    // ── AUTH ───────────────────────────────────────────────────────────────
    return (
        <div className={styles.authRoot}>
            <div className={styles.authPage}>
                <button className={styles.backButton} onClick={() => setAuthMode("intro")}>
                    <Icons.ArrowLeft /> Back
                </button>

                <div className={styles.authHeader}>
                    <h2 className={styles.authTitle}>
                        {authTab === "signup" ? <><span>Create</span><br />Account</> : <><span>Welcome</span><br />Back</>}
                    </h2>
                    <span className={styles.authSubtitle}>
                        {authTab === "signup" ? "Sign up to continue" : "Sign in to continue"}
                    </span>
                </div>

                {/* Toggle */}
                <div className={styles.authToggle}>
                    <button className={`${styles.toggleBtn} ${authTab === "signin" ? styles.toggleActive : ""}`} onClick={() => setAuthTab("signin")}>Sign In</button>
                    <button className={`${styles.toggleBtn} ${authTab === "signup" ? styles.toggleActive : ""}`} onClick={() => setAuthTab("signup")}>Sign Up</button>
                </div>

                {/* Inputs */}
                <div className={styles.authInputs}>
                    <div className={styles.inputWrapper}>
                        <Icons.Fingerprint />
                        <input type="email" placeholder="Email" className={styles.authInput} />
                    </div>

                    {authTab === "signup" && (
                        <>
                            <div className={styles.inputWrapper}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: "var(--text-secondary)", marginRight: 14 }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                                <input type="text" placeholder="Username" className={styles.authInput} value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className={styles.inputWrapper}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: "var(--text-secondary)", marginRight: 14 }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" placeholder="Password" className={styles.authInput} />
                    </div>
                </div>

                <button className={styles.authSubmitBtn} onClick={authTab === "signup" ? handleSignup : handleLogin}>
                    {authTab === "signup" ? "Sign Up" : "Sign In"}
                </button>

                <div className={styles.divider}><span>or</span></div>

                <div className={styles.socialButtons}>
                    <button className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                    <button className={styles.socialBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </div>

                <div className={styles.authFooter}>
                    {authTab === "signup"
                        ? <><span className={styles.footerMuted}>Already have an account? </span><span onClick={() => setAuthTab("signin")}>Sign In</span></>
                        : <><span className={styles.footerMuted}>Don&apos;t have an account? </span><span onClick={() => setAuthTab("signup")}>Sign Up</span></>
                    }
                </div>
            </div>
        </div>
    );
}
