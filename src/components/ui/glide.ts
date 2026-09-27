/**
 * 滑る選択の印（GlideTabs）の、レールの端の薄め方とスクロール先の計算。
 * 描画から切り離してあるのは、node --test でそのまま確かめるため
 * （tests/swiftpieces-parts.test.mjs）。
 */

/** レールのどちらの端を薄くするか。 */
export type Fade = "start" | "end" | "both";

/**
 * 溢れている側の端だけを薄くする。溢れていなければ薄くしない。
 *
 * 高解像度の画面ではスクロール位置が 0.5 のような端数になり、端に着いても
 * ぴったり 0 や最大値にならない。1px の遊びを持たせないと、端に着いたのに
 * そちら側が薄いまま残る。
 */
export function fadeOf(
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number,
): Fade | undefined {
  const start = scrollLeft > 1;
  const end = scrollLeft + clientWidth < scrollWidth - 1;
  if (start && end) return "both";
  if (start) return "start";
  if (end) return "end";
  return undefined;
}

/**
 * 選んだ項目をレールの中央へ寄せるスクロール位置。
 * 端の項目は中央まで寄せられないので、0 と最大値の間に収める。
 */
export function railScrollTarget(
  itemLeft: number,
  itemWidth: number,
  viewWidth: number,
  scrollWidth: number,
): number {
  const max = Math.max(0, scrollWidth - viewWidth);
  const centered = itemLeft + itemWidth / 2 - viewWidth / 2;
  return Math.min(max, Math.max(0, centered));
}
