type RoundStanding = { teamId: string; roundPoints: Record<number, number> };

/**
 * 節 round でのチームの順位。同点は同じ順位（その節で上回ったチームの数 + 1）。
 * 点の無い節は 0 点として数える。直近の結果と順位推移のグラフで同じ数え方にするために使う
 */
export function roundRank(
  standings: readonly RoundStanding[],
  round: number,
  teamId: string,
): number {
  const points = (s: RoundStanding) => s.roundPoints[round] ?? 0;
  const own = standings.find((s) => s.teamId === teamId);
  const mine = own ? points(own) : 0;
  return 1 + standings.filter((s) => points(s) > mine).length;
}
