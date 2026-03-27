import type { Team } from '@/lib/types/app'

interface Props {
  team: Team
}

export default function TeamDetail({ team }: Props) {
  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <div
          className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: team.homeColor }}
        >
          {team.name.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">{team.name}</h2>
        <p className="text-sm text-slate-500 mb-3">{team.leagueName}</p>
        {team.description && (
          <p className="text-sm text-body leading-relaxed">{team.description}</p>
        )}
      </div>
      {team.captainName && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">キャプテン</p>
          <p className="text-sm font-medium text-slate-900">{team.captainName}</p>
        </div>
      )}
    </div>
  )
}
