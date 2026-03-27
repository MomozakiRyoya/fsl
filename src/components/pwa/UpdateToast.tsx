'use client'

import { useState, useEffect } from 'react'

export default function UpdateToast() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true)
            }
          })
        })
      })
    }
  }, [])

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between shadow-md z-50">
      <p className="text-sm">新しいバージョンが利用可能です</p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs bg-primary-500 px-3 py-1 rounded-lg font-medium cursor-pointer"
      >
        更新
      </button>
    </div>
  )
}
