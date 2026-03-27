import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fukuoka Super League',
  description: '福岡ポーカーチームリーグ公式アプリ',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FSL',
  },
}

export const viewport: Viewport = {
  themeColor: '#2b70ef',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-gray-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
