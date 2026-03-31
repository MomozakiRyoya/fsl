import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
import SplashScreen from "@/components/pwa/SplashScreen";
import InstallGuide from "@/components/pwa/InstallGuide";
import FloatingButtons from "@/components/layout/FloatingButtons";
import TopBar from "@/components/layout/TopBar";

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
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            var saved = localStorage.getItem('fsl-theme');
            if (saved === 'dark') document.documentElement.classList.add('dark');
          })();
        `,
          }}
        />
      </head>
      <body
        className="min-h-screen font-sans lg:flex"
        style={{ backgroundColor: "#f5f3ee" }}
      >
        {/* デスクトップ: 左サイドバー（lg以上でのみ表示） */}
        <Sidebar />

        <InstallGuide />
        <SplashScreen />

        {/* モバイル用トップバー */}
        <TopBar />

        {/* メインコンテンツ */}
        <main className="flex-1 pt-11 lg:pt-0 pb-20 lg:pb-0 lg:ml-56 min-w-0">
          <div className="max-w-screen-xl mx-auto">{children}</div>
        </main>

        {/* フローティングボタン（body直下で固定） */}
        <FloatingButtons />

        {/* モバイル: BottomNav（lg以上で非表示） */}
        <BottomNav />
      </body>
    </html>
  );
}
