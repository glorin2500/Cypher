"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { analyzeQRString, type AnalysisResult } from "@/lib/scanner-api";
import { hapticSuccess, hapticError } from "@/lib/haptics";
import { useScan } from "@/app/context/ScanContext";
import { ResultModal } from "@/app/dashboard/overlays";
import styles from "./manual.module.css";

const Icons = {
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
};

export default function ManualPage() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const { addScan } = useScan();

    const handleVerify = async () => {
        if (!input) return;
        setVerifying(true);

        try {
            await new Promise(r => setTimeout(r, 1000));
            const analysisResult = await analyzeQRString(`upi://pay?pa=${input}`);

            addScan(analysisResult);
            setResult(analysisResult);

            if (analysisResult.risk_label === 'safe') hapticSuccess();
            else hapticError();
        } catch (e) {
            console.error(e);
            hapticError();
        } finally {
            setVerifying(false);
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
                <span className={styles.title}>Manual Entry</span>
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
                <button
                    onClick={handleVerify}
                    disabled={!input || verifying}
                    className={styles.verifyBtn}
                >
                    {verifying ? "Verifying..." : "Verify ID"}
                </button>
            </div>

            {result && <ResultModal result={result} onClose={handleClose} />}
        </div>
    );
}
