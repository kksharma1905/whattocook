import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import StoreInit from "@/components/StoreInit";

export const metadata: Metadata = {
  title: "WhatToCook",
  description: "Your personal meal recommender",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WhatToCook",
  },
};

export const viewport: Viewport = {
  themeColor: "#c4533a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreInit />
        <div className="app-shell">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
