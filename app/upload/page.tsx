"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { analyzeQRString, type AnalysisResult } from "@/lib/scanner-api";
import { hapticSuccess, hapticError } from "@/lib/haptics";
import { useScan } from "@/app/context/ScanContext";
import { ResultModal } from "@/app/dashboard/overlays";
import styles from "./upload.module.css";

const Icons = {
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    Upload: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Loader2: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    AlertTriangle: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const { addScan } = useScan();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setProcessing(true);
            setError(null);

            try {
                const file = e.target.files[0];
                const html5QrCode = new Html5Qrcode("upload-reader");

                const decodedText = await html5QrCode.scanFile(file, false);
                html5QrCode.clear();

                const analysisResult = await analyzeQRString(decodedText);

                addScan(analysisResult);

                if (analysisResult.risk_label === 'safe') hapticSuccess();
                else hapticError();

                setProcessing(false);
                setResult(analysisResult);
            } catch (err) {
                console.error('QR decode failed:', err);
                setError('Could not decode QR code from image. Please try another image.');
                setProcessing(false);
                hapticError();
            }
        }
    };

    const handleClose = () => {
        router.push('/dashboard');
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button onClick={handleClose} className={styles.backBtn}>
                    <Icons.ChevronLeft />
                </button>
                <span className={styles.title}>Upload QR</span>
            </div>

            <div className={styles.uploadArea} onClick={() => !processing && fileInputRef.current?.click()}>
                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    capture="environment"  // Enable camera on mobile
                    onChange={handleFileChange}
                />
                <div id="upload-reader" style={{ display: 'none' }} />

                {processing ? (
                    <>
                        <Icons.Loader2 />
                        <span className={styles.uploadText}>Analyzing Image...</span>
                    </>
                ) : error ? (
                    <>
                        <Icons.AlertTriangle />
                        <span className={styles.errorText}>{error}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setError(null); fileInputRef.current?.click(); }}
                            className={styles.retryBtn}
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <Icons.Upload />
                        <span className={styles.uploadText}>Scan QR Code</span>
                        <span className={styles.uploadHint}>Take photo or upload from gallery</span>
                    </>
                )}
            </div>

            {result && <ResultModal result={result} onClose={handleClose} />}
        </div>
    );
}
