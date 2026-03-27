'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/standings', label: '順位', icon: '🏆' },
  { href: '/schedule', label: '日程', icon: '📅' },
  { href: '/teams', label: 'チーム', icon: '👥' },
  { href: '/rules', label: 'ルール', icon: '📋' },
  { href: '/info', label: '情報', icon: 'ℹ️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50"
      aria-label="メインナビゲーション"
    >
      <div className="flex max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-primary-500' : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
