/** player_results の 1 行（選手ページで使う列だけ） */
export type PlayerResultRow = {
  round_id: string;
  player_name: string;
  team_id: string;
  rank: number | null;
  points: number;
};

type RoundInfo = {
  id: string;
  name: string;
  roundNumber: number;
  date: string;
};

export type PlayerRoundEntry = {
  roundId: string;
  roundName: string;
  roundNumber: number;
  date: string;
  /** その節のチームの順位（入力時にチームの合計点で付けたもの） */
  teamRank: number | null;
  points: number;
};

export type PlayerSeason = {
  totalPoints: number;
  roundsPlayed: number;
  /** 1 節あたりの個人ポイント（小数 1 桁）。出場が無ければ null */
  averagePoints: number | null;
  bestPoints: number | null;
  history: PlayerRoundEntry[];
};

const normalize = (name: string) => name.trim().toLowerCase();

/**
 * 選手の今シーズンの個人ポイントをまとめる。
 * player_results は player_id が空の行もあるので、選手名 + チームで照合する。
 * 名前は前後の空白と大文字小文字を無視する（マイページの ilike と同じ扱い）
 */
export function summarizePlayerSeason(
  rows: readonly PlayerResultRow[],
  rounds: readonly RoundInfo[],
  player: { name: string; teamId: string },
): PlayerSeason {
  const name = normalize(player.name);
  const roundById = new Map(rounds.map((r) => [r.id, r]));

  const history = rows
    .filter(
      (r) => r.team_id === player.teamId && normalize(r.player_name) === name,
    )
    .map((r) => {
      const round = roundById.get(r.round_id);
      return {
        roundId: r.round_id,
        roundName: round?.name ?? "",
        roundNumber: round?.roundNumber ?? 0,
        date: round?.date ?? "",
        teamRank: r.rank,
        points: r.points ?? 0,
      };
    })
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const totalPoints = history.reduce((sum, h) => sum + h.points, 0);
  const roundsPlayed = history.length;

  return {
    totalPoints,
    roundsPlayed,
    averagePoints:
      roundsPlayed > 0
        ? Math.round((totalPoints / roundsPlayed) * 10) / 10
        : null,
    bestPoints:
      roundsPlayed > 0 ? Math.max(...history.map((h) => h.points)) : null,
    history,
  };
}
