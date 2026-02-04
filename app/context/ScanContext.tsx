"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AnalysisResult } from "@/lib/scanner-api";

interface Transaction {
    id: number;
    icon: string; // "₿" or component placeholder
    title: string;
    subtitle: string;
    value: string;
    subValue: string;
    isRisk: boolean;
    timestamp: number;
    // Enhanced fields for detailed analysis
    threatPercentage: number;  // 0-100
    riskFactors: string[];     // From backend reasons
    upiId: string;             // For deep linking
}

interface RiskVector {
    label: string;
    val: number;
    color: string;
}

interface ScanContextType {
    history: Transaction[];
    safetyScore: number;
    threatsBlocked: number;
    riskVectors: RiskVector[];
    addScan: (result: AnalysisResult) => void;
    clearHistory: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
    // Initial Mock Data
    const [history, setHistory] = useState<Transaction[]>([
        { id: 1, icon: "₿", title: "Bitcoin", subtitle: "$62,291", value: "0.03%", subValue: "$2,321", isRisk: false, timestamp: Date.now(), threatPercentage: 2, riskFactors: [], upiId: "bitcoin@upi" },
        { id: 2, icon: "ALERT", title: "Unknown", subtitle: "98765XXX", value: "Risk", subValue: "Blocked", isRisk: true, timestamp: Date.now() - 100000, threatPercentage: 85, riskFactors: ["Unverified payment provider"], upiId: "98765XXX@unknown" },
        { id: 3, icon: "Ξ", title: "Ethereum", subtitle: "$3,421", value: "1.45%", subValue: "$1,871", isRisk: false, timestamp: Date.now() - 200000, threatPercentage: 5, riskFactors: [], upiId: "ethereum@upi" },
        { id: 4, icon: "SHIELD", title: "Zomato", subtitle: "Verified", value: "Safe", subValue: "$45.00", isRisk: false, timestamp: Date.now() - 300000, threatPercentage: 1, riskFactors: ["Transaction pattern appears normal"], upiId: "zomato@paytm" },
    ]);

    const [safetyScore, setSafetyScore] = useState(98);
    const [threatsBlocked, setThreatsBlocked] = useState(142);
    const [riskVectors, setRiskVectors] = useState<RiskVector[]>([
        { label: 'Spoofed VPAs', val: 78, color: '#FF3B30' },
        { label: 'Malicious QRs', val: 45, color: '#FF9500' },
        { label: 'Fake Requests', val: 20, color: '#FFCC00' }
    ]);

    // Load from local storage on mount (optional for persistency)
    useEffect(() => {
        const savedHistory = localStorage.getItem('scan_history');
        if (savedHistory) {
            try {
                // setHistory(JSON.parse(savedHistory)); 
                // Commented out to keep mock data for demo visuals for now
            } catch (e) { console.error("Failed to parse history", e); }
        }
    }, []);

    const addScan = (result: AnalysisResult) => {
        const isSafe = result.risk_label === 'safe';
        const isWarning = result.risk_label === 'warning';
        const isDanger = result.risk_label === 'danger';
        const threatPercentage = result.risk_score || 0;

        // Update Safety Score (weighted by threat level)
        if (isDanger) {
            setSafetyScore(prev => Math.max(0, prev - 5)); // High penalty
        } else if (isWarning) {
            setSafetyScore(prev => Math.max(0, prev - 2)); // Medium penalty
        } else {
            setSafetyScore(prev => Math.min(100, prev + 1)); // Small reward
        }

        // Update Threats Blocked
        if (!isSafe) {
            setThreatsBlocked(prev => prev + 1);
        }

        // Update Risk Vectors based on reasons
        if (result.reasons && result.reasons.length > 0) {
            setRiskVectors(prev => {
                const updated = [...prev];

                result.reasons.forEach(reason => {
                    const lowerReason = reason.toLowerCase();

                    // Spoofed VPAs - payee risk
                    if (lowerReason.includes('payee') || lowerReason.includes('unverified') || lowerReason.includes('provider')) {
                        const idx = updated.findIndex(v => v.label === 'Spoofed VPAs');
                        if (idx !== -1) updated[idx] = { ...updated[idx], val: Math.min(100, updated[idx].val + 1) };
                    }

                    // Malicious QRs - timing/device risk
                    if (lowerReason.includes('timing') || lowerReason.includes('hours') || lowerReason.includes('device')) {
                        const idx = updated.findIndex(v => v.label === 'Malicious QRs');
                        if (idx !== -1) updated[idx] = { ...updated[idx], val: Math.min(100, updated[idx].val + 1) };
                    }

                    // Fake Requests - amount/frequency risk
                    if (lowerReason.includes('amount') || lowerReason.includes('frequency') || lowerReason.includes('round')) {
                        const idx = updated.findIndex(v => v.label === 'Fake Requests');
                        if (idx !== -1) updated[idx] = { ...updated[idx], val: Math.min(100, updated[idx].val + 1) };
                    }
                });

                return updated;
            });
        }

        // Add to History with enhanced data
        const newTx: Transaction = {
            id: Date.now(),
            icon: isSafe ? "SHIELD" : "ALERT",
            title: result.details?.merchant || "Unknown",
            subtitle: result.details?.upi_id || "Unknown ID",
            value: isSafe ? "Safe" : isWarning ? "Warning" : "Risk",
            subValue: isSafe ? "Verified" : "Blocked",
            isRisk: !isSafe,
            timestamp: Date.now(),
            // Enhanced fields
            threatPercentage,
            riskFactors: result.reasons || [],
            upiId: result.details?.upi_id || ""
        };

        setHistory(prev => [newTx, ...prev]);

        // Persist
        localStorage.setItem('scan_history', JSON.stringify([newTx, ...history]));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('scan_history');
    };

    return (
        <ScanContext.Provider value={{ history, safetyScore, threatsBlocked, riskVectors, addScan, clearHistory }}>
            {children}
        </ScanContext.Provider>
    );
}

export function useScan() {
    const context = useContext(ScanContext);
    if (context === undefined) {
        throw new Error("useScan must be used within a ScanProvider");
    }
    return context;
}
