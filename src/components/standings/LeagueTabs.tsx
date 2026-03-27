'use client'

import type { League } from '@/lib/types/app'

interface Props {
  leagues: League[]
  activeLeagueId: string
  onSelect: (leagueId: string) => void
}

export default function LeagueTabs({ leagues, activeLeagueId, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {leagues.map((league) => {
        const isActive = league.id === activeLeagueId
        return (
          <button
            key={league.id}
            onClick={() => onSelect(league.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${
              isActive
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-gray-50'
            }`}
            aria-selected={isActive}
          >
            {league.name}
          </button>
        )
      })}
    </div>
  )
}
