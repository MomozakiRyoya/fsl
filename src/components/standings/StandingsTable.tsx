import type { TeamStanding } from '@/lib/types/app'

interface Props {
  standings: TeamStanding[]
}

export default function StandingsTable({ standings }: Props) {
  if (standings.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">順位表データなし</p>
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-gray-50">
            <th scope="col" className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">順位</th>
            <th scope="col" className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">チーム</th>
            <th scope="col" className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">PT</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr key={standing.teamId} className="hover:bg-gray-50 transition-colors border-b border-slate-100 last:border-0">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">{standing.rank}</td>
              <td className="py-3 px-4 text-sm text-slate-900">{standing.teamName}</td>
              <td className="py-3 px-4 text-sm text-slate-900 text-right font-semibold">{standing.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
