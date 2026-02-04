"use client";

import styles from "./profile.module.css";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";

// Icons (Matching Visual Request)
const Icons = {
    ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    CreditCard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Key: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
    Smartphone: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
    Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
};


export default function ProfilePage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);


    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = () => {
        // Clear auth tokens/session here
        router.push('/');
    };

    return (
        <div className={styles.container}>
            {/* Header Card */}
            <header className={styles.headerCard}>
                <div className={styles.headerTop}>
                    <span className={styles.headerTitle}>Settings</span>
                    <div className={styles.headerIcon}>
                        <Icons.User />
                    </div>
                </div>

                <div className={styles.profileInfo}>
                    <div className={styles.avatar}>
                        <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.User />
                        </div>
                    </div>
                    <h2 className={styles.userName}>Glorin</h2>
                    <span className={styles.userEmail}>glorin@gmail.com</span>
                </div>
            </header>

            {/* Content Lists */}
            <div className={styles.sectionList}>

                {/* My Account */}
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>My Account</span>

                    <button className={styles.menuItem} onClick={() => alert("Profile View functionality coming soon!")}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.User /></div>
                            <span className={styles.menuLabel}>View Profile</span>
                        </div>
                    </button>

                    <button className={styles.menuItem}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.CreditCard /></div>
                            <span className={styles.menuLabel}>Your Card</span>
                        </div>
                        <div className={styles.menuRight}>
                            <Icons.ChevronRight />
                        </div>
                    </button>

                    <button className={styles.menuItem}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.Users /></div>
                            <span className={styles.menuLabel}>Affiliate Settings</span>
                        </div>
                        <div className={styles.menuRight}>
                            <Icons.ChevronRight />
                        </div>
                    </button>
                </div>

                {/* App Preference */}
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>App Preference</span>

                    <button className={styles.menuItem} onClick={() => setNotifications(!notifications)}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.Bell /></div>
                            <span className={styles.menuLabel}>Message Notifications</span>
                        </div>
                        <div className={styles.menuRight}>
                            <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={() => setNotifications(!notifications)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </button>
                </div>

                {/* Privacy & Security */}
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Privacy & Security</span>

                    <button className={styles.menuItem}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.Shield /></div>
                            <span className={styles.menuLabel}>Change Password</span>
                        </div>
                    </button>

                    <button className={styles.menuItem}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.Key /></div>
                            <span className={styles.menuLabel}>Change PIN</span>
                        </div>
                        <div className={styles.menuRight}>
                            <Icons.ChevronRight />
                        </div>
                    </button>

                    <button className={styles.menuItem}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon}><Icons.Smartphone /></div>
                            <span className={styles.menuLabel}>Active Devices</span>
                        </div>
                        <div className={styles.menuRight}>
                            <Icons.ChevronRight />
                        </div>
                    </button>
                </div>

                {/* Help Center */}
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Support</span>
                    <button className={styles.menuItem} onClick={handleLogout}>
                        <div className={styles.menuLeft}>
                            <div className={styles.menuIcon} style={{ color: '#FF3B30' }}><Icons.User /></div>
                            <span className={styles.menuLabel} style={{ color: '#FF3B30' }}>Log Out</span>
                        </div>
                        <div className={styles.menuRight}>
                            <Icons.ChevronRight />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
