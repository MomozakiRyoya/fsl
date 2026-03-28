'use client'

interface TeamRankHistory {
  teamId: string
  teamName: string
  color: string
  ranks: number[] // ラウンドごとの順位 [R1rank, R2rank, R3rank, R4rank]
}

interface Props {
  leagueId: string
  teams: TeamRankHistory[]
  rounds: number[]
}

export default function RankChart({ teams, rounds }: Props) {
  const totalTeams = 8
  const width = 280
  const height = 160
  const paddingLeft = 28
  const paddingRight = 12
  const paddingTop = 12
  const paddingBottom = 24

  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  // x座標: ラウンドインデックス → ピクセル
  const xForRound = (i: number) =>
    paddingLeft + (i / (rounds.length - 1)) * innerWidth

  // y座標: 順位 → ピクセル（1位が上）
  const yForRank = (rank: number) =>
    paddingTop + ((rank - 1) / (totalTeams - 1)) * innerHeight

  // ポリライン用のポイント文字列
  const toPoints = (ranks: number[]) =>
    ranks
      .map((rank, i) => `${xForRound(i)},${yForRank(rank)}`)
      .join(' ')

  return (
    <div className="bg-white rounded-xl border border-[#e8dfc0] p-4 overflow-hidden">
      <h3 className="text-xs font-bold text-slate-700 mb-3">順位推移</h3>
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label="順位推移グラフ"
        >
          {/* グリッドライン（各順位） */}
          {Array.from({ length: totalTeams }, (_, i) => i + 1).map((rank) => (
            <g key={rank}>
              <line
                x1={paddingLeft}
                y1={yForRank(rank)}
                x2={width - paddingRight}
                y2={yForRank(rank)}
                stroke={rank <= 2 ? 'rgba(201,146,30,0.15)' : rank >= 7 ? 'rgba(239,68,68,0.1)' : '#f1f5f9'}
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 4}
                y={yForRank(rank) + 4}
                textAnchor="end"
                fontSize={8}
                fill="#94a3b8"
              >
                {rank}
              </text>
            </g>
          ))}

          {/* ラウンドラベル */}
          {rounds.map((r, i) => (
            <text
              key={r}
              x={xForRound(i)}
              y={height - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
            >
              R{r}
            </text>
          ))}

          {/* 各チームのライン */}
          {teams.map((team) => (
            <g key={team.teamId}>
              <polyline
                points={toPoints(team.ranks)}
                fill="none"
                stroke={team.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
              {/* ドット */}
              {team.ranks.map((rank, i) => (
                <circle
                  key={i}
                  cx={xForRound(i)}
                  cy={yForRank(rank)}
                  r={3}
                  fill={team.color}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          ))}

          {/* プレーオフ進出ライン */}
          <line
            x1={paddingLeft}
            y1={yForRank(2.5)}
            x2={width - paddingRight}
            y2={yForRank(2.5)}
            stroke="rgba(201,146,30,0.4)"
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          <text x={width - paddingRight + 2} y={yForRank(2.5) + 3} fontSize={7} fill="rgba(201,146,30,0.8)">PO</text>
        </svg>
      </div>

      {/* 凡例 */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {teams.map((team) => (
          <div key={team.teamId} className="flex items-center gap-1">
            <span className="w-4 h-0.5 rounded-full flex-shrink-0" style={{ background: team.color }} />
            <span className="text-[10px] text-slate-500 truncate max-w-[6rem]">{team.teamName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
