"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./auth.module.css";
import { setUserName } from "@/lib/user-store";

const Icons = {
    Scan: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 17l3 3m-3 0l3-3" /></svg>,
    Block: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>,
    Radar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5A2 2 0 0 1 12 8" /><path d="M2.1 12h19.8" /><path d="M12 2.1v19.8" /></svg>,
    Fingerprint: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 12.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 1.07-.6 3-1.5 4.5" /></svg>,
    ArrowLeft: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    CypherLogo: () => (
        <svg viewBox="0 0 24 24" fill="none" className="cypher-logo" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="gemGradient" x1="12" y1="9" x2="12" y2="15" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#d4f469" />
                    <stop offset="1" stopColor="#b8d94a" />
                </linearGradient>
            </defs>
            <style>{`
                 @keyframes drawHexBadge { 
                   to { stroke-dashoffset: 0; } 
                 }
                 @keyframes revealGemBadge { 
                   to { transform: scale(1) rotate(0deg); opacity: 1; } 
                 }
                 @keyframes glowPulse {
                   0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
                   50% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)); }
                 }
                 .hexPathBadge { 
                   stroke: var(--text-primary);
                   stroke-dasharray: 60; 
                   stroke-dashoffset: 60; 
                   animation: drawHexBadge 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.2s; 
                 }
                 .coreGemBadge { 
                   transform-origin: center; 
                   transform: scale(0) rotate(-90deg); 
                   opacity: 0; 
                   fill: var(--text-primary);
                   animation: revealGemBadge 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.8s, glowPulse 3s infinite 2s; 
                 }
               `}</style>
            <path className="hexPathBadge" d="M20 7L12 2.5L4 7V17L12 21.5L20 17" fill="none" />
            <path className="coreGemBadge" d="M12 9L15 12L12 15L9 12L12 9Z" stroke="none" />
        </svg>
    ),
};

const flashcards = [
    {
        title: "Detect",
        subtitle: "phishing",
        description: "AI identifies fake UPI requests before you pay",
        icon: <Icons.Scan />,
    },
    {
        title: "Block",
        subtitle: "fraud",
        description: "Stop malicious payment requests instantly",
        icon: <Icons.Block />,
    },
    {
        title: "Monitor",
        subtitle: "activity",
        description: "Real-time alerts on suspicious transaction spikes",
        icon: <Icons.Radar />,
    },
];

type AuthMode = 'intro' | 'auth';

export default function AuthPage() {
    const router = useRouter();
    const [currentCard, setCurrentCard] = useState(0);
    const [authMode, setAuthMode] = useState<AuthMode>('intro');
    const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signup');

    // Form Inputs
    const [name, setName] = useState("");

    // Auto-rotate flashcards
    useEffect(() => {
        if (authMode !== 'intro') return; // Don't rotate if in auth
        const interval = setInterval(() => {
            setCurrentCard((prev) => (prev + 1) % flashcards.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [authMode]);

    const handleLogin = () => {
        // Simulating login
        router.push("/dashboard");
    };

    const handleSignup = () => {
        // Simulating signup
        if (name.trim()) {
            setUserName(name);
        }
        router.push("/dashboard");
    };

    const currentFlashcard = flashcards[currentCard];

    // MAIN APP CONTENT
    return (
        <div className={styles.container}>

            {/* DYNAMIC CONTENT AREA */}
            {authMode === 'intro' ? (
                // INTRO: FLASHCARDS + GET STARTED
                <div className={styles.introContent}>

                    {/* 1. CAROUSEL CARD */}
                    <div className={styles.carouselContainer} onClick={() => setCurrentCard((prev) => (prev + 1) % flashcards.length)}>

                        {/* A. BRAND HEADER */}
                        <div className={styles.internalHeader}>
                            <div className={styles.logoWrapper}>
                                <Icons.CypherLogo />
                            </div>
                            <h1 className={styles.appName}>
                                CYPHER
                                <span className={styles.appTagline}>SECURITY</span>
                            </h1>
                        </div>

                        {/* B. FLASHCARD CONTENT */}
                        <div className={styles.flashCard}>
                            <div className={styles.cardIcon}>{currentFlashcard.icon}</div>
                            <h2 className={styles.cardTitle}>
                                {currentFlashcard.title} <span className={styles.cardSubtitle}>{currentFlashcard.subtitle}</span>
                            </h2>
                            <p className={styles.cardDescription}>{currentFlashcard.description}</p>
                        </div>

                        {/* C. DOTS */}
                        <div className={styles.dotsContainer}>
                            {flashcards.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.dot} ${idx === currentCard ? styles.activeDot : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 2. CTA SECTION */}
                    <div className={styles.actionSection}>
                        <button className={styles.primaryButton} onClick={() => setAuthMode('auth')}>
                            Get Started
                        </button>
                    </div>
                </div>
            ) : (
                // AUTH: SIGN IN / SIGN UP
                <div className={styles.authPage}>
                    <button className={styles.backButton} onClick={() => setAuthMode('intro')}>
                        <Icons.ArrowLeft /> Back
                    </button>

                    <div className={styles.authHeader}>
                        <h2 className={styles.authTitle}>
                            {authTab === 'signup' ? (
                                <>Create New<br />Account</>
                            ) : (
                                <>Welcome<br />Back</>
                            )}
                        </h2>
                        <span className={styles.authSubtitle}>
                            {authTab === 'signup' ? 'Sign Up To Continue' : 'Sign In To Continue'}
                        </span>
                    </div>

                    {/* Toggle Buttons */}
                    <div className={styles.authToggle}>
                        <button
                            className={`${styles.toggleBtn} ${authTab === 'signin' ? styles.toggleActive : ''}`}
                            onClick={() => setAuthTab('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${authTab === 'signup' ? styles.toggleActive : ''}`}
                            onClick={() => setAuthTab('signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Input Fields */}
                    <div className={styles.authInputs}>
                        <div className={styles.inputWrapper}>
                            <Icons.Fingerprint />
                            <input type="email" placeholder="Email" className={styles.authInput} />
                        </div>

                        {authTab === 'signup' && (
                            <>
                                <div className={styles.inputWrapper}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: 'var(--text-secondary)', marginRight: 14 }}>
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input type="tel" placeholder="Phone" className={styles.authInput} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: 'var(--text-secondary)', marginRight: 14 }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className={styles.authInput}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div className={styles.inputWrapper}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: 'var(--text-secondary)', marginRight: 14 }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input type="password" placeholder="Password" className={styles.authInput} />
                            <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        className={styles.authSubmitBtn}
                        onClick={authTab === 'signup' ? handleSignup : handleLogin}
                    >
                        {authTab === 'signup' ? 'Sign Up' : 'Sign In'}
                    </button>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span>Or</span>
                    </div>

                    {/* Social Login */}
                    <div className={styles.socialButtons}>
                        <button className={styles.socialBtn}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                        <button className={styles.socialBtn}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>

                    {/* Footer Text */}
                    <div className={styles.authFooter}>
                        {authTab === 'signup' ? (
                            <>Already Have An Account? <span onClick={() => setAuthTab('signin')}>Sign In</span></>
                        ) : (
                            <>Don't Have An Account? <span onClick={() => setAuthTab('signup')}>Sign Up</span></>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
