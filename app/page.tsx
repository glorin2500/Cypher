"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./auth.module.css";
import { setUserName } from "@/lib/user-store";

// ── Flashcard data — UPI-specific, sharp copy ──────────────────────────────
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

const LOGO = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M20 7L12 2.5L4 7V17L12 21.5L20 17V7Z" />
        <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="currentColor" stroke="none" />
    </svg>
);

const ArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
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

    const goTo = (mode: AuthMode, tab?: "signin" | "signup") => {
        setAuthMode(mode);
        if (tab) setAuthTab(tab);
    };

    const handleContinue = () => {
        if (name.trim()) setUserName(name);
        router.push("/dashboard");
    };

    const f = flashcards[card];

    // ── INTRO ──────────────────────────────────────────────────────────────
    if (authMode === "intro") {
        return (
            <div className={styles.page}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.logoPill}>
                        <LOGO />
                        <span className={styles.logoText}>CYPHER</span>
                    </div>
                </header>

                {/* Flashcard */}
                <main className={styles.main}>
                    <div className={styles.card} key={card}>
                        <span className={styles.cardLabel}>{f.label}</span>
                        <h1 className={styles.cardTitle}>
                            {f.title.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                        </h1>
                        <p className={styles.cardBody}>{f.body}</p>
                    </div>

                    {/* Dots */}
                    <div className={styles.dots}>
                        {flashcards.map((_, i) => (
                            <button key={i}
                                className={`${styles.dot} ${i === card ? styles.dotActive : ""}`}
                                onClick={() => setCard(i)}
                            />
                        ))}
                    </div>
                </main>

                {/* Actions */}
                <footer className={styles.footer}>
                    <button className={styles.btnPrimary} onClick={() => goTo("auth", "signup")}>
                        Get Started
                    </button>
                    <p className={styles.footerHint}>
                        Already have an account?{" "}
                        <span onClick={() => goTo("auth", "signin")}>Log In</span>
                    </p>
                </footer>
            </div>
        );
    }

    // ── AUTH ───────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => goTo("intro")}>
                    <ArrowLeft /> Back
                </button>
            </header>

            <div className={styles.authPage}>
                {/* Auth Header */}
                <div className={styles.authHeader}>
                    <p className={styles.authEyebrow}>
                        {authTab === "signup" ? "New Account" : "Welcome Back"}
                    </p>
                    <h2 className={styles.authTitle}>
                        {authTab === "signup" ? "Create Account" : "Sign In"}
                    </h2>
                </div>

                {/* Toggle */}
                <div className={styles.toggle}>
                    <button className={`${styles.toggleBtn} ${authTab === "signin" ? styles.toggleActive : ""}`} onClick={() => setAuthTab("signin")}>
                        Sign In
                    </button>
                    <button className={`${styles.toggleBtn} ${authTab === "signup" ? styles.toggleActive : ""}`} onClick={() => setAuthTab("signup")}>
                        Sign Up
                    </button>
                </div>

                {/* Inputs */}
                <div className={styles.inputs}>
                    <input type="email" placeholder="Email" className={styles.input} autoComplete="email" />

                    {authTab === "signup" && (
                        <input
                            type="text"
                            placeholder="Username"
                            className={styles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoComplete="username"
                        />
                    )}

                    <input type="password" placeholder="Password" className={styles.input} autoComplete="current-password" />
                </div>

                {/* Submit */}
                <button className={styles.btnPrimary} onClick={handleContinue}>
                    {authTab === "signup" ? "Create Account" : "Sign In"}
                </button>

                {/* Divider */}
                <div className={styles.divider}><span>or continue with</span></div>

                {/* Social */}
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
                        : <><span className={styles.muted}>Don&apos;t have an account? </span><span className={styles.link} onClick={() => setAuthTab("signup")}>Sign Up</span></>}
                </p>
            </div>
        </div>
    );
}
