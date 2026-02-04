"use client";

import styles from "./analytics.module.css";
import { useEffect, useState } from "react";
import { useScan } from "@/app/context/ScanContext";

// Icons (Matching reference Lucide names with raw SVGs)
const Icons = {
    QrCode: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    Smartphone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    AlertTriangle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};

export default function AnalyticsPage() {
    const [chartView, setChartView] = useState<'week' | 'month'>('week');
    const { threatsBlocked, riskVectors } = useScan(); // Data from Context

    // Chart Data Arrays (Simulated with type for coloring)
    const weekData = [
        { val: 40, type: 'safe' },
        { val: 60, type: 'threat' },
        { val: 35, type: 'safe' },
        { val: 80, type: 'threat' },
        { val: 55, type: 'safe' },
        { val: 90, type: 'threat' },
        { val: 70, type: 'safe' }
    ];

    const monthData = [
        { val: 50, type: 'safe' },
        { val: 40, type: 'threat' },
        { val: 60, type: 'safe' },
        { val: 30, type: 'safe' },
        { val: 70, type: 'threat' },
        { val: 50, type: 'safe' },
        { val: 80, type: 'threat' },
        { val: 60, type: 'safe' },
        { val: 40, type: 'threat' },
        { val: 70, type: 'safe' }
    ];

    const chartData = chartView === 'week' ? weekData : monthData;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerPill}>
                    <span className={styles.headerTitle}>Analytics</span>
                </div>
            </header>

            <main className={styles.main}>
                {/* Threats Blocked Card */}
                <div className={styles.card} style={{ height: '300px', justifyContent: 'space-between' }}>
                    <div className={styles.chartTop}>
                        <div>
                            <span className={styles.actionLabel}>SCAN ACTIVITY</span>
                            <h3 className={styles.textH1} style={{ marginTop: '4px' }}>{threatsBlocked}</h3>
                        </div>
                        <div className={styles.toggleContainer}>
                            <button
                                className={`${styles.toggleBtn} ${chartView === 'week' ? styles.toggleActive : ''}`}
                                onClick={() => setChartView('week')}
                            >
                                W
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${chartView === 'month' ? styles.toggleActive : ''}`}
                                onClick={() => setChartView('month')}
                            >
                                M
                            </button>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        {chartData.map((d, i) => (
                            <div
                                key={i}
                                className={styles.chartBar}
                                style={{
                                    height: `${d.val}%`,
                                    backgroundColor: d.type === 'threat' ? 'var(--risk-red)' : 'var(--safe-green)',
                                    opacity: d.type === 'threat' ? 0.6 : 0.6
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Risk Vectors Card */}
                <div className={styles.card} style={{ gap: '16px' }}>
                    <span className={styles.actionLabel}>UPI RISK VECTORS</span>
                    {riskVectors.map((r, i) => (
                        <div key={i} className={styles.riskItem}>
                            <div className={styles.riskHeader}>
                                <div className={styles.riskLabel}>
                                    {/* Icon Selection Logic based on Index, matching reference */}
                                    {i === 0 ? <Icons.AlertTriangle /> : i === 1 ? <Icons.QrCode /> : <Icons.Smartphone />}
                                    {r.label}
                                </div>
                                <span className={styles.textMuted}>{r.val}</span>
                            </div>
                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar} style={{ width: `${r.val}%`, backgroundColor: r.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
