"use client";

import {
  X_END,
  X_START,
  chartHeight,
  rankY,
  roundX,
  showRoundLabel,
} from "./rank-chart-layout";

interface TeamRankHistory {
  teamId: string;
  teamName: string;
  color: string;
  ranks: number[]; // ラウンドごとの順位 [R1rank, R2rank, R3rank, R4rank]
}

interface Props {
  leagueId: string;
  teams: TeamRankHistory[];
  rounds: number[];
  /** 色を付けて前に出すチーム。ほかのチームは薄い線だけで描く */
  focusTeamId: string;
}

/** プレーオフ進出ライン（2 位と 3 位の間） */
const PLAYOFF_LINE = 2.5;

// 線・段・文字は currentColor（text-slate-500）で描き、ダークでは .dark .text-slate-500 の色に替わる
export default function RankChart({ teams, rounds, focusTeamId }: Props) {
  const totalTeams = Math.max(2, teams.length);
  const height = chartHeight(totalTeams);
  const x = (i: number) => `${roundX(i, rounds.length)}%`;
  const focus = teams.find((t) => t.teamId === focusTeamId);
  // 自チームを最後に描いて、ほかのチームの線より上に出す
  const ordered = [
    ...teams.filter((t) => t !== focus),
    ...(focus ? [focus] : []),
  ];
  const label = focus
    ? `${focus.teamName}の順位推移（${rounds
        .map((r, i) => `R${r} ${focus.ranks[i]}位`)
        .join("、")}）`
    : "順位推移グラフ";

  return (
    <div className="card-native p-4">
      <svg
        width="100%"
        height={height}
        className="block text-slate-500"
        role="img"
        aria-label={label}
      >
        {/* 順位の段 */}
        {Array.from({ length: totalTeams }, (_, i) => i + 1).map((rank) => (
          <g key={rank}>
            <line
              x1={`${X_START - 2}%`}
              x2={`${X_END + 2}%`}
              y1={rankY(rank)}
              y2={rankY(rank)}
              stroke="currentColor"
              strokeOpacity={0.15}
            />
            <text
              x={`${X_START - 4}%`}
              y={rankY(rank)}
              dy="0.35em"
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
            >
              {rank}
            </text>
          </g>
        ))}

        {/* 節のラベル。多いときは間引く */}
        {rounds.map((r, i) =>
          showRoundLabel(i, rounds.length) ? (
            <text
              key={r}
              x={x(i)}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              R{r}
            </text>
          ) : null,
        )}

        {totalTeams > PLAYOFF_LINE && (
          <line
            x1={`${X_START - 2}%`}
            x2={`${X_END + 2}%`}
            y1={rankY(PLAYOFF_LINE)}
            y2={rankY(PLAYOFF_LINE)}
            stroke="currentColor"
            strokeOpacity={0.7}
            strokeDasharray="4 3"
          />
        )}

        {/* 各チームの線。区間ごとに引く（% の座標は polyline の points に書けない） */}
        {ordered.map((team) => {
          const isFocus = team === focus;
          return (
            <g
              key={team.teamId}
              stroke={isFocus ? team.color : "currentColor"}
              strokeOpacity={isFocus ? 1 : 0.3}
              strokeWidth={isFocus ? 2.5 : 1.5}
              strokeLinecap="round"
            >
              {team.ranks.slice(1).map((rank, i) => (
                <line
                  key={i}
                  x1={x(i)}
                  y1={rankY(team.ranks[i])}
                  x2={x(i + 1)}
                  y2={rankY(rank)}
                />
              ))}
              {isFocus &&
                team.ranks.map((rank, i) => (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={rankY(rank)}
                    r={3.5}
                    fill={team.color}
                    stroke="none"
                  />
                ))}
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] leading-none text-slate-500">
        {focus && (
          <li className="flex min-w-0 items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-[3px] w-4 flex-shrink-0 rounded-full"
              style={{ background: focus.color }}
            />
            <span className="truncate font-bold text-slate-700">
              {focus.teamName}
            </span>
          </li>
        )}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-px w-4 bg-current opacity-40" />
          ほかのチーム
        </li>
        {totalTeams > PLAYOFF_LINE && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="w-4 border-t border-dashed border-current"
            />
            PO ライン
          </li>
        )}
      </ul>
    </div>
  );
}
