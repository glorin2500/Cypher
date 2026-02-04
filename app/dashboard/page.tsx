"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { getUserName } from "@/lib/user-store";
import { hapticNav, hapticButton } from "@/lib/haptics";
import { useTheme } from "@/app/context/ThemeContext";

// Icons matching new design system
const Icons = {
    Sun: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41-1.41" /><path d="M19.07 4.93l-1.41 1.41" />
        </svg>
    ),
    Moon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    CypherLogo: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="cypher-logo" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
                <filter id="neonGlowDash" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <style>{`
                 @keyframes drawHexBadgeDash { 
                   to { stroke-dashoffset: 0; } 
                 }
                 @keyframes revealGemBadgeDash { 
                   to { transform: scale(1) rotate(0deg); opacity: 1; } 
                 }
                 @keyframes glowPulseDash {
                   0%, 100% { filter: drop-shadow(0 0 3px var(--text-primary)); }
                   50% { filter: drop-shadow(0 0 8px var(--text-primary)); }
                 }
                 .hexPathBadgeDash { 
                   stroke: var(--text-primary);
                   stroke-dasharray: 60; 
                   stroke-dashoffset: 60; 
                   animation: drawHexBadgeDash 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.2s; 
                 }
                 .coreGemBadgeDash { 
                   transform-origin: center; 
                   transform: scale(0) rotate(-90deg); 
                   opacity: 0; 
                   fill: var(--text-primary);
                   animation: revealGemBadgeDash 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.8s, glowPulseDash 3s infinite 2s; 
                 }
               `}</style>
            <path className="hexPathBadgeDash" d="M20 7L12 2.5L4 7V17L12 21.5L20 17" fill="none" />
            <path className="coreGemBadgeDash" d="M12 9L15 12L12 15L9 12L12 9Z" stroke="none" />
        </svg>
    ),
    QrCode: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z" />
        </svg>
    ),
    ImageUp: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    Keyboard: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
        </svg>
    ),
    Search: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    AlertTriangle: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    ShieldCheck: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
};

import { ScannerView, UploadView, ManualView, ResultModal, Toast, MenuOverlay } from "./overlays";
import type { AnalysisResult } from "@/lib/scanner-api";
import { useScan } from "@/app/context/ScanContext";

// StatusDot Component - Blinking indicator for scan status
const StatusDot = ({ isRisk }: { isRisk: boolean }) => (
    <div className={`${styles.statusDot} ${isRisk ? styles.riskDot : styles.safeDot}`} />
);

export default function Dashboard() {
    const router = useRouter();
    const [userName, setUserNameStr] = useState("User");
    const [currentOverlay, setCurrentOverlay] = useState<'scan' | 'upload' | 'manual' | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [resultData, setResultData] = useState<AnalysisResult | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedScan, setSelectedScan] = useState<any | null>(null);

    const { theme, toggleTheme } = useTheme();
    const { history, safetyScore } = useScan(); // Use Global Context

    useEffect(() => {
        const name = getUserName();
        if (name) setUserNameStr(name);
    }, []);

    const handleResult = (result: AnalysisResult) => {
        setCurrentOverlay(null);
        setResultData(result);
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Use history from Context and filter based on search
    const filteredItems = history.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.title.toLowerCase().includes(query) ||
            item.subtitle.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query)
        );
    });
    const securityItems = filteredItems;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.menuBtn} onClick={() => setShowMenu(true)}>
                    <Icons.CypherLogo />
                </button>
                <div className={styles.logoPill}>
                    <span className={styles.logoText}>CYPHER</span>
                </div>
                <button className={styles.themeBtn} onClick={toggleTheme}>
                    {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                </button>
            </header>

            {/* Overlays */}
            {showMenu && <MenuOverlay onClose={() => setShowMenu(false)} onToast={showToast} />}
            {currentOverlay === 'scan' && <ScannerView onClose={() => setCurrentOverlay(null)} onDetect={handleResult} />}
            {currentOverlay === 'upload' && <UploadView onClose={() => setCurrentOverlay(null)} onDetect={handleResult} />}
            {currentOverlay === 'manual' && <ManualView onClose={() => setCurrentOverlay(null)} onDetect={handleResult} />}
            {resultData && <ResultModal result={resultData} onClose={() => setResultData(null)} />}
            {toastMessage && <Toast message={toastMessage} />}
            {selectedScan && (
                <div className={styles.modalBackdrop} onClick={() => setSelectedScan(null)}>
                    <div className={styles.scanDetailModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Scan Details</h3>
                            <button className={styles.modalClose} onClick={() => setSelectedScan(null)}>×</button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>Status</span>
                                <div className={styles.modalValue}>
                                    <StatusDot isRisk={selectedScan.isRisk} />
                                    <span>{selectedScan.isRisk ? 'Risk Detected' : 'Safe'}</span>
                                </div>
                            </div>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>Merchant</span>
                                <span className={styles.modalValue}>{selectedScan.title}</span>
                            </div>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>UPI ID</span>
                                <span className={styles.modalValue}>{selectedScan.subtitle}</span>
                            </div>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>Timestamp</span>
                                <span className={styles.modalValue}>{new Date(selectedScan.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>Threat Level</span>
                                <span className={styles.modalValue}>{selectedScan.isRisk ? 'High (95%)' : 'Low (2%)'}</span>
                            </div>
                            <div className={styles.modalRow}>
                                <span className={styles.modalLabel}>Action Taken</span>
                                <span className={styles.modalValue}>{selectedScan.isRisk ? 'Blocked' : 'Allowed'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className={styles.contentScroll}>

                {/* Balance Card */}
                <div className={styles.balanceCard}>
                    <span className={styles.balanceLabel}>Safety Score</span>
                    <div className={styles.balanceCenter}>
                        <span className={`${styles.balanceAmount} ${safetyScore >= 70 ? styles.pulseSafe : styles.pulseDanger}`}>
                            {safetyScore}%
                        </span>
                    </div>
                    <div className={styles.balanceFooter} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>+2.1% Safe</span>
                    </div>
                </div>

                {/* Action Grid */}
                <section className={styles.actionGrid}>
                    <button className={styles.actionButton} onClick={() => { hapticButton(); router.push('/scanner'); }}>
                        <span className={styles.actionLabel}>Scan</span>
                        <div className={styles.actionIcon}>
                            <Icons.QrCode />
                        </div>
                    </button>
                    <button className={styles.actionButton} onClick={() => { hapticButton(); router.push('/upload'); }}>
                        <span className={styles.actionLabel}>Upload</span>
                        <div className={styles.actionIcon}>
                            <Icons.ImageUp />
                        </div>
                    </button>
                    <button className={styles.actionButton} onClick={() => { hapticButton(); router.push('/manual'); }}>
                        <span className={styles.actionLabel}>Manual</span>
                        <div className={styles.actionIcon}>
                            <Icons.Keyboard />
                        </div>
                    </button>
                </section>

                {/* Recent Scans List */}
                <div className={styles.listCard}>
                    <div className={styles.listHeader}>
                        <span className={styles.listTitle}>RECENT SCANS</span>
                        <button className={styles.searchBtn} onClick={() => setShowSearch(!showSearch)}>
                            <Icons.Search />
                        </button>
                    </div>
                    {showSearch && (
                        <input
                            type="text"
                            placeholder="Search scans..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    )}
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {securityItems.map((item, index) => (
                            <div key={index} className={styles.listItem} onClick={() => setSelectedScan(item)}>
                                <div className={styles.itemRow}>
                                    <StatusDot isRisk={item.isRisk} />
                                    <div className={styles.itemCol}>
                                        <span className={styles.itemTitle}>{item.title}</span>
                                        <span className={styles.itemSub}>{item.subtitle}</span>
                                    </div>
                                </div>
                                <div className={styles.itemCol} style={{ alignItems: 'flex-end' }}>
                                    <span className={styles.itemTitle}>{item.isRisk ? 'Blocked' : 'Verified'}</span>
                                    <span className={styles.itemSub}>{new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
