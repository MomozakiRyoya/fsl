import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import SplashScreen from "@/components/pwa/SplashScreen";

export const metadata: Metadata = {
  title: "Fukuoka Super League",
  description: "福岡ポーカーチームリーグ公式アプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FSL",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b70ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className="min-h-screen font-sans"
        style={{ backgroundColor: "#f5f3ee" }}
      >
        <SplashScreen />
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
