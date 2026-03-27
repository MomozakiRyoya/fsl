import Link from 'next/link'
import type { Team } from '@/lib/types/app'

interface Props {
  team: Team
}

export default function TeamCard({ team }: Props) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="block bg-white rounded-xl border border-slate-200 p-4 hover:bg-gray-50 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-full mb-3 flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: team.homeColor }}
      >
        {team.name.charAt(0)}
      </div>
      <p className="text-sm font-medium text-slate-900">{team.name}</p>
      <p className="text-xs text-slate-500 mt-0.5">{team.leagueName}</p>
    </Link>
  )
}
