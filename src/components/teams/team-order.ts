import type { TeamStanding } from "@/lib/types/app";

type Points = Pick<TeamStanding, "teamId" | "totalPoints">;

/**
 * ディビジョンのチームを点数の高い順に並べた新しい配列を返す。
 * 同点は順位表と同じ並び（並べ替えは安定）、順位表に無いチームは末尾に元の並びのまま置く。
 */
export function sortTeamsByPoints<T extends { id: string }>(
  teams: readonly T[],
  standings: readonly Points[],
): T[] {
  const byId = new Map(teams.map((t) => [t.id, t]));
  const ranked = [...standings]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .flatMap((s) => byId.get(s.teamId) ?? []);
  const inStandings = new Set(standings.map((s) => s.teamId));
  return [...ranked, ...teams.filter((t) => !inStandings.has(t.id))];
}
