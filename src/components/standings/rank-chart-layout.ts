// 順位推移のグラフの寸法。横は % で幅に追従させ、縦は px で段の間を一定にする
// （viewBox で拡大縮小すると、文字まで 320px で 0.8 倍・PC で 1.5 倍に伸び縮みする）。

/** 最初と最後の節の横位置（%）。左の余白に順位の数字が入る */
export const X_START = 8;
export const X_END = 92;
/** 1 段（1 順位）の高さ（px） */
export const ROW = 20;
const PAD_TOP = 10;
/** 最下段の下の、節ラベルの場所（px） */
const PAD_BOTTOM = 26;
/** 節ラベルを出す最大の数。320px で「R10」が重ならない数 */
const MAX_LABELS = 7;

/** 節 i（0 始まり）の横位置を % で返す。節が 1 つ以下なら真ん中 */
export function roundX(i: number, count: number): number {
  if (count <= 1) return 50;
  return X_START + (i / (count - 1)) * (X_END - X_START);
}

/** 順位 rank（1 始まり、2.5 のような段の間も可）の縦位置（px） */
export function rankY(rank: number): number {
  return PAD_TOP + (rank - 1) * ROW;
}

/** rows 段のグラフの高さ（px） */
export function chartHeight(rows: number): number {
  return rankY(rows) + PAD_BOTTOM;
}

/**
 * 節 i のラベルを出すか。MAX_LABELS 個までに等間隔で間引き、最新の節は必ず出す
 * （最新から数えて step ごとに出すので、間隔が揃う）。
 */
export function showRoundLabel(
  i: number,
  count: number,
  max = MAX_LABELS,
): boolean {
  const step = Math.max(1, Math.ceil(count / max));
  return (count - 1 - i) % step === 0;
}
