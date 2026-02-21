import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ScanProvider } from "./context/ScanContext";
import { BottomNav } from "./components/BottomNav";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Cypher - UPI Threat Detection",
    description: "AI-powered UPI transaction security monitoring",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Cypher",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body>
                    <ThemeProvider>
                        <ScanProvider>
                            {children}
                            <BottomNav />
                        </ScanProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
