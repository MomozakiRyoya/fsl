import type { Team } from '@/lib/types/app'
import TeamCard from './TeamCard'

interface Props {
  teams: Team[]
}

export default function TeamGrid({ teams }: Props) {
  if (teams.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">チームデータなし</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}
