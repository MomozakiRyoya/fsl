/**
 * 下部タブバーの「今どこか」と「どこから滑ってくるか」の計算。
 * 描画から切り離してあるのは、node --test でそのまま確かめるため
 * （tests/tabbar.test.mjs）。
 */

/** 今どこを指しているか（to）と、そこへどこから来たか（from）。 */
export type TabMove = { to: number; from: number | null };

/** 印を動かすときの出発点・向き・伸びる量。 */
export type TabTravel = {
  from: number;
  dir: "forward" | "backward";
  stretch: number;
};

/**
 * 今その行き先に居るか。
 *
 * ホームの "/" はあらゆるパスの先頭に一致してしまうので、前方一致から外す。
 * ほかのタブも素の startsWith にすると、/teamsx のような名前の先頭が同じだけの
 * 別ページまで現在地になる。区切りの "/" まで含めて比べる。
 */
export function isCurrentTab(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 移動中に横へ伸びる量。動いた枚数で決まる（FST のタブバーと同じ値）。
 *
 * 進む側の縁が先に着き、後ろの縁が遅れて追いつくので伸びて見える。
 * 遠くへ跳ぶほど長く伸びないと、出発したタブと着くタブの両方に面が掛からず
 * 経路が途切れて見える。上限の 3 は、板が 5 枚ぶんしかないため。
 * 端から端（4 枚）を素直に数えると 3.8 枚ぶんになり、板がほぼ全部光る。
 */
export function stretchFor(distance: number): number {
  return Math.min(3, 1 + 0.7 * distance);
}

/**
 * 出発点。1 つ前に描いたときの位置を使う。
 *
 * 印の無い画面（-1）は出発点として覚えない。覚えると、戻ってきたときに
 * 板の外から面が飛んでくる。その場合は、それより前に覚えていた位置を引き継ぐ。
 */
export function originOf(move: TabMove, activeIndex: number): number | null {
  if (move.to === activeIndex) return move.from;
  return move.to >= 0 ? move.to : move.from;
}

/** 動かすのは、直前に別のタブに居たときだけ。それ以外は null（その場に置く）。 */
export function travelOf(from: number | null, to: number): TabTravel | null {
  if (from === null || from < 0 || to < 0 || from === to) return null;
  return {
    from,
    dir: to > from ? "forward" : "backward",
    stretch: stretchFor(Math.abs(to - from)),
  };
}
