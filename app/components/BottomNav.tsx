"use client";

import { usePathname, useRouter } from "next/navigation";
import { hapticNav } from "@/lib/haptics";

const Icons = {
    Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    PieChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const activeTab = pathname.includes('analytics') ? 'analytics' : pathname.includes('profile') ? 'profile' : 'home';

    const handleNav = (tab: string, path: string) => {
        hapticNav();
        router.push(path);
    };

    const hideNav = pathname === '/' || pathname.includes('/scanner') || pathname.includes('/manual') || pathname.includes('/upload');
    if (hideNav) return null;

    return (
        <div className="bottom-nav-dock">
            <div className="nav-container">
                <button
                    className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleNav('home', '/dashboard')}
                >
                    <Icons.Home />
                    {activeTab === 'home' && <span className="nav-label">Home</span>}
                </button>

                <button
                    className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => handleNav('analytics', '/analytics')}
                >
                    <Icons.PieChart />
                    {activeTab === 'analytics' && <span className="nav-label">Analytics</span>}
                </button>

                <button
                    className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => handleNav('profile', '/profile')}
                >
                    <Icons.User />
                    {activeTab === 'profile' && <span className="nav-label">Profile</span>}
                </button>
            </div>
        </div>
    );
}
