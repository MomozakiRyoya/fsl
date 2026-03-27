import type { League } from '@/lib/types/app'

interface Props {
  leagues: League[]
}

export default function LeagueTopCards({ leagues }: Props) {
  if (leagues.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">リーグ情報を準備中</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {leagues.map((league) => (
        <div key={league.id} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-sm font-medium text-slate-900">{league.name}</p>
        </div>
      ))}
    </div>
  )
}
