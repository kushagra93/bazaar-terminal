import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";
import { MobileNav } from "@/components/MobileNav";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07080b",
};

export const metadata: Metadata = {
  title: "BAZAAR — US Stock Perps Intelligence",
  description: "Real-time US stock perpetual futures intelligence for Indian traders. Track TSLA, NVDA, AAPL perps with INR pricing.",
  openGraph: {
    title: "BAZAAR — US Stock Perps Intelligence",
    description: "The modern bazaar for Indian traders. US stock perps, INR-first, real-time signals.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          {/* Desktop nav — hidden on mobile */}
          <div className="hidden md:block">
            <NavBar />
          </div>
          {/* Mobile top bar — shown on mobile only */}
          <div className="md:hidden sticky top-0 z-50 glass px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[var(--bazaar-gold)] text-base">▣</span>
              <span className="font-display text-sm font-bold text-[var(--text-primary)] tracking-[2px]">BAZAAR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-[9px] font-data text-green-400">LIVE</span>
            </div>
          </div>
          {/* Main content — bottom padding on mobile for nav */}
          <main className="px-3 md:px-6 py-4 md:py-5 pb-20 md:pb-5">{children}</main>
          {/* Mobile bottom nav */}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
