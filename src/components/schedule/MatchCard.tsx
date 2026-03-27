import type { Match, Round } from '@/lib/types/app'

interface Props {
  match: Match
  round: Round
}

export default function MatchCard({ match, round }: Props) {
  const isFinished = match.status === 'finished'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{round.name} - {round.date}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isFinished ? 'bg-slate-100 text-slate-600' : 'bg-primary-100 text-primary-700'
        }`}>
          {isFinished ? '終了' : '予定'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">{match.homeTeamName}</span>
        {isFinished ? (
          <span className="text-base font-bold text-slate-900">
            {match.homeScore} - {match.awayScore}
          </span>
        ) : (
          <span className="text-sm text-slate-400">vs</span>
        )}
        <span className="text-sm font-medium text-slate-900">{match.awayTeamName}</span>
      </div>
    </div>
  )
}
