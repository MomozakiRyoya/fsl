import type { Metadata, Viewport } from "next";
import "./globals.css";
import SplashScreen from "@/components/pwa/SplashScreen";
import InstallGuide from "@/components/pwa/InstallGuide";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

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
        className="min-h-screen font-sans"
        style={{ backgroundColor: "#f5f3ee" }}
      >
        <InstallGuide />
        <SplashScreen />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
