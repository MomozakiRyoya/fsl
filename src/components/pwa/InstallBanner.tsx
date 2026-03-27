'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsVisible(false)
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary-500 text-white px-4 py-3 flex items-center justify-between">
      <p className="text-sm font-medium">ホーム画面に追加できます</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs text-primary-200 cursor-pointer"
        >
          閉じる
        </button>
        <button
          onClick={handleInstall}
          className="text-xs bg-white text-primary-500 px-3 py-1 rounded-lg font-medium cursor-pointer"
        >
          追加
        </button>
      </div>
    </div>
  )
}
