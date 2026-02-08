"use client";

import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import styles from "./dashboard.module.css";
import { analyzeQRPayload, analyzeQRString, type AnalysisResult } from "@/lib/scanner-api";
import { hapticSuccess, hapticError } from "@/lib/haptics";
import { useScan } from "@/app/context/ScanContext";

// --- ICONS ---
const Icons = {
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    Upload: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Loader2: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    ShieldCheck: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 12 15 22 6" /></svg>,
    AlertTriangle: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
};

// --- MENU OVERLAY ---
export const MenuOverlay = ({ onClose, onToast }: { onClose: () => void, onToast: (msg: string) => void }) => (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.2s ease' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />
        <div className={styles.card} style={{ width: '70%', height: '100%', borderRadius: 0, padding: '60px 24px', zIndex: 51, background: 'var(--surface-bg)', position: 'relative' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Menu</h2>
            {['About', 'Privacy', 'Support'].map(i => (
                <div key={i} onClick={() => { onToast(i); onClose(); }} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>{i}</div>
            ))}
        </div>
    </div>
);

// --- SCANNER VIEW ---
export const ScannerView = ({ onClose, onDetect }: { onClose: () => void, onDetect: (res: AnalysisResult) => void }) => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const { addScan } = useScan();

    useEffect(() => {
        const startScanner = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const scanner = new Html5Qrcode("reader");
                    scannerRef.current = scanner;

                    await scanner.start(
                        { facingMode: "environment" },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText) => {
                            await scanner.pause();
                            setProcessing(true); // User Requested Processing State

                            try {
                                const result = await analyzeQRString(decodedText);
                                // Artificial delay for "Processing" feel (1.5s)
                                await new Promise(r => setTimeout(r, 1500));

                                if (result.risk_label === 'safe') hapticSuccess();
                                else hapticError();

                                addScan(result); // Update Global State
                                onDetect(result);
                            } catch (e) {
                                console.error("Analysis failed", e);
                                // Resume scanning on error
                                setProcessing(false);
                                scanner.resume();
                            }
                        },
                        () => { } // Ignore failures
                    );
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Scanner error", err);
                // Check if it's a permission error
                if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
                    setPermissionDenied(true);
                }
                setLoading(false);
            }
        };
        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onDetect, addScan]);


    if (permissionDenied) {
        return (
            <div className={styles.overlay}>
                <div className={styles.overlayHeader}>
                    <button onClick={onClose} className={styles.closeBtn}><Icons.ChevronLeft /></button>
                    <span className={styles.overlayTitle}>Camera Access</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
                    <Icons.AlertTriangle />
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, marginTop: '24px' }}>Camera Access Denied</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '12px', lineHeight: 1.6 }}>
                        Please enable camera permissions in your browser settings to scan QR codes.
                    </p>
                    <button onClick={onClose} style={{ marginTop: '32px', padding: '12px 32px', background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (processing) {
        return (
            <div className={styles.overlay} style={{ background: 'black', zIndex: 100 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div className={styles.scannerRing}></div>
                    <p style={{ marginTop: 24, fontSize: 18, fontWeight: 600, color: 'white' }}>Analyzing Risk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay}>
            <div id="reader" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className={styles.overlayHeader} style={{ position: 'relative', zIndex: 60 }}>
                <button onClick={onClose} className={styles.closeBtn}><Icons.ChevronLeft /></button>
                <span className={styles.overlayTitle}>Scanner Active</span>
            </div>

            <div className={styles.scannerFrame} style={{ pointerEvents: 'none', zIndex: 50 }}>
                <div className={styles.scanLine}></div>
            </div>

            {loading && <div className={styles.overlayContent} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Loader2 />
            </div>}
        </div>
    );
};

// --- UPLOAD VIEW ---
export const UploadView = ({ onClose, onDetect }: { onClose: () => void, onDetect: (res: AnalysisResult) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addScan } = useScan();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setProcessing(true);
            setError(null);

            try {
                const file = e.target.files[0];
                const html5QrCode = new Html5Qrcode("upload-reader");

                // Scan the uploaded image file
                const decodedText = await html5QrCode.scanFile(file, false);

                // Clean up
                html5QrCode.clear();

                // Analyze the decoded QR string
                const result = await analyzeQRString(decodedText);

                // Add to scan history
                addScan(result);

                // Trigger haptic feedback
                if (result.risk_label === 'safe') hapticSuccess();
                else hapticError();

                setProcessing(false);
                onDetect(result);
            } catch (err) {
                console.error('QR decode failed:', err);
                setError('Could not decode QR code from image. Please try another image.');
                setProcessing(false);
                hapticError();
            }
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.overlayHeader}>
                <button onClick={onClose} className={styles.closeBtn}><Icons.ChevronLeft /></button>
                <span className={styles.overlayTitle}>Upload QR</span>
            </div>
            <div className={styles.uploadArea} onClick={() => !processing && fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                <div id="upload-reader" style={{ display: 'none' }} />
                {processing ? (
                    <>
                        <Icons.Loader2 />
                        <span>Analyzing Image...</span>
                    </>
                ) : error ? (
                    <>
                        <Icons.AlertTriangle />
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', maxWidth: '80%' }}>{error}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setError(null); fileInputRef.current?.click(); }}
                            style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <Icons.Upload />
                        <span>Tap to upload from Gallery</span>
                    </>
                )}
            </div>
        </div>
    );
};

// --- MANUAL VIEW ---
export const ManualView = ({ onClose, onDetect }: { onClose: () => void, onDetect: (res: AnalysisResult) => void }) => {
    const [input, setInput] = useState("");
    const [verifying, setVerifying] = useState(false);
    const { addScan } = useScan();

    const handleVerify = async () => {
        if (!input) return;
        setVerifying(true);
        try {
            // Processing Delay
            await new Promise(r => setTimeout(r, 1000));
            const result = await analyzeQRString(`upi://pay?pa=${input}`);

            addScan(result);
            onDetect(result);

            if (result.risk_label === 'safe') hapticSuccess();
            else hapticError();
        } catch (e) {
            console.error(e);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.overlayHeader}>
                <button onClick={onClose} className={styles.closeBtn}><Icons.ChevronLeft /></button>
                <span className={styles.overlayTitle}>Manual Entry</span>
            </div>
            <div className={styles.manualForm}>
                <span className={styles.inputLabel}>Enter UPI ID</span>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="example@upi"
                    className={styles.manualInput}
                    autoFocus
                />
                <div className={styles.divider}></div>
                <button onClick={handleVerify} disabled={!input || verifying} className={styles.verifyBtn}>
                    {verifying ? "Verifying..." : "Verify ID"}
                </button>
            </div>
        </div>
    );
};

// --- ANALYSIS MODAL (Monochrome) ---
export const ResultModal = ({ result, onClose }: { result: AnalysisResult, onClose: () => void }) => {
    const isSafe = result.risk_label === 'safe';
    const isWarning = result.risk_label === 'warning';
    const isDanger = result.risk_label === 'danger';

    const handleProceed = () => {
        // Wrap async logic to prevent unhandled promise rejection
        (async () => {
            try {
                // Import UPI handler functions
                const { parseUPIString, attemptUPIRedirect, copyToClipboard } = await import('@/lib/upi-handler');

                if (result.details?.original_upi_string) {
                    // Parse and rebuild to ensure proper formatting
                    console.log('🔍 Original UPI String:', result.details.original_upi_string);
                    const upiParams = parseUPIString(result.details.original_upi_string);

                    if (upiParams) {
                        console.log('✅ Parsed UPI Params:', upiParams);
                        const success = attemptUPIRedirect(upiParams);

                        if (!success) {
                            // Fallback: Copy UPI ID to clipboard
                            await copyToClipboard(result.details.upi_id || '');
                            alert('UPI ID copied to clipboard! Please open your UPI app manually.');
                        }
                    } else {
                        throw new Error('Failed to parse UPI string');
                    }
                } else if (result.details?.upi_id) {
                    // Construct from available details
                    console.log('🔍 Constructing UPI from details:', result.details);
                    const success = attemptUPIRedirect({
                        pa: result.details.upi_id,
                        pn: result.details.merchant,
                        am: result.details.amount,
                        cu: 'INR'  // Add currency for Indian payments
                    });

                    if (!success) {
                        await copyToClipboard(result.details.upi_id);
                        alert('UPI ID copied to clipboard! Please open your UPI app manually.');
                    }
                } else {
                    throw new Error('No UPI data available for payment');
                }
            } catch (error) {
                console.error('❌ Payment redirect failed:', error);
                alert(`Unable to open UPI app: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or use manual payment.`);
            } finally {
                onClose();
            }
        })().catch((err) => {
            // Catch any unhandled errors from the async IIFE
            console.error('❌ Unhandled error in handleProceed:', err);
            onClose();
        });
    };

    // Calculate threat percentage (0-100)
    const threatPercentage = result.risk_score || 0;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.analysisModal} onClick={e => e.stopPropagation()}>
                {/* Header with Status */}
                <div className={styles.analysisHeader}>
                    <div className={styles.analysisStatus}>
                        <div className={`${styles.statusDot} ${isDanger ? styles.riskDot : styles.safeDot}`}
                            style={{ width: '12px', height: '12px', marginRight: '12px' }} />
                        <h2 className={styles.analysisTitle}>
                            {isDanger ? 'Risk Detected' : isWarning ? 'Warning' : 'Verified Safe'}
                        </h2>
                    </div>
                    <button onClick={onClose} className={styles.analysisClose}>×</button>
                </div>

                {/* Merchant Info */}
                <div className={styles.analysisSection}>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>Merchant</span>
                        <span className={styles.analysisValue}>{result.details?.merchant || 'Unknown'}</span>
                    </div>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>UPI ID</span>
                        <span className={styles.analysisValue} style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                            {result.details?.upi_id || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Threat Level */}
                <div className={styles.analysisSection}>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>Threat Level</span>
                        <span className={styles.analysisValue}>{threatPercentage}%</span>
                    </div>
                    <div className={styles.threatBar}>
                        <div
                            className={styles.threatBarFill}
                            style={{
                                width: `${threatPercentage}%`,
                                background: isDanger ? '#FF3B30' : isWarning ? '#FF9500' : 'var(--border-color)'
                            }}
                        />
                    </div>
                </div>

                {/* Risk Factors */}
                {result.reasons && result.reasons.length > 0 && (
                    <div className={styles.analysisSection}>
                        <span className={styles.analysisLabel} style={{ marginBottom: '12px', display: 'block' }}>
                            {isDanger || isWarning ? 'Risk Factors' : 'Analysis'}
                        </span>
                        <div className={styles.riskFactorsList}>
                            {result.reasons.map((reason, idx) => (
                                <div key={idx} className={styles.riskFactorItem}>
                                    <span className={styles.riskFactorBullet}>•</span>
                                    <span className={styles.riskFactorText}>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={styles.analysisActions}>
                    {isDanger ? (
                        <>
                            <button
                                onClick={handleProceed}
                                className={styles.analysisProceedDanger}
                            >
                                Proceed Anyway (Not Recommended)
                            </button>
                            <button onClick={onClose} className={styles.analysisCancel}>
                                Block Transaction
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleProceed}
                                className={styles.analysisProceed}
                            >
                                Proceed to Payment
                            </button>
                            <button onClick={onClose} className={styles.analysisCancel}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- TOAST ---
export const Toast = ({ message }: { message: string }) => (
    <div style={{
        position: 'absolute',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        color: 'black',
        padding: '12px 24px',
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 100,
        fontWeight: 600,
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
        <Icons.Check /> {message}
    </div>
);
