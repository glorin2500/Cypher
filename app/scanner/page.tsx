"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { analyzeQRString, type AnalysisResult } from "@/lib/scanner-api";
import { hapticSuccess, hapticError } from "@/lib/haptics";
import { useScan } from "@/app/context/ScanContext";
import { ResultModal } from "@/app/dashboard/overlays";
import styles from "./scanner.module.css";

const Icons = {
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    Image: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
};

export default function ScannerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const { addScan } = useScan();

    useEffect(() => {
        // Check if we're in a secure context (HTTPS or localhost)
        const isSecureContext = window.isSecureContext;

        if (!isSecureContext) {
            // Redirect to upload page for non-secure contexts (mobile HTTP)
            console.warn('Camera requires HTTPS. Redirecting to upload page...');
            router.push('/upload');
            return;
        }

        const startScanner = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const scanner = new Html5Qrcode("reader");
                    scannerRef.current = scanner;

                    await scanner.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: undefined,  // Don't create library's scan box
                            aspectRatio: 1.0
                        },
                        async (decodedText) => {
                            await scanner.pause();
                            setProcessing(true);

                            try {
                                const analysisResult = await analyzeQRString(decodedText);
                                await new Promise(r => setTimeout(r, 1500));

                                if (analysisResult.risk_label === 'safe') hapticSuccess();
                                else hapticError();

                                addScan(analysisResult);
                                setResult(analysisResult);
                                setProcessing(false);
                            } catch (e) {
                                console.error("Analysis failed", e);
                                hapticError();
                                setProcessing(false);
                                scanner.resume();
                            }
                        },
                        () => { }
                    );
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Scanner error", err);
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
    }, [addScan, router]);

    const handleClose = () => {
        router.push('/dashboard');
    };

    const handleGallery = () => {
        router.push('/upload');
    };

    if (permissionDenied) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <button onClick={handleClose} className={styles.backBtn}>
                        <Icons.ChevronLeft />
                    </button>
                </div>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>
                        <Icons.Camera />
                    </div>
                    <h3 className={styles.errorTitle}>Camera Access Required</h3>
                    <p className={styles.errorMessage}>
                        Camera access requires a secure connection (HTTPS).
                        {typeof window !== 'undefined' && window.location.hostname !== 'localhost' &&
                            ' Please access this app via HTTPS or localhost to use the scanner.'}
                    </p>
                    <button onClick={handleClose} className={styles.primaryBtn}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (processing) {
        return (
            <div className={styles.page}>
                <div className={styles.processingOverlay}>
                    <div className={styles.processingRing}></div>
                    <p className={styles.processingText}>Analyzing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Full-Screen Camera */}
            <div id="reader" className={styles.cameraView} />

            {/* Dark Overlay for Better Contrast */}
            <div className={styles.overlay} />

            {/* Header */}
            <div className={styles.header}>
                <button onClick={handleClose} className={styles.backBtn}>
                    <Icons.ChevronLeft />
                </button>
                <button onClick={handleGallery} className={styles.galleryBtn}>
                    <Icons.Image />
                </button>
            </div>

            {/* Scan Frame */}
            <div className={styles.scanArea}>
                <div className={styles.scanFrame}>
                    {/* Corner Brackets */}
                    <div className={styles.cornerTL}></div>
                    <div className={styles.cornerTR}></div>
                    <div className={styles.cornerBL}></div>
                    <div className={styles.cornerBR}></div>

                    {/* Scan Line */}
                    <div className={styles.scanLine}></div>
                </div>
            </div>

            {/* Bottom Instructions */}
            <div className={styles.instructions}>
                <p className={styles.instructionText}>Align QR code within frame</p>
                <p className={styles.hintText}>Scanning will happen automatically</p>
            </div>

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                </div>
            )}

            {result && <ResultModal result={result} onClose={handleClose} />}
        </div>
    );
}
