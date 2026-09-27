/**
 * 桁ごとに回る数字（CountUp）の、各桁に何を出すかの計算。
 * 描画から切り離してあるのは、node --test でそのまま確かめるため
 * （tests/swiftpieces-parts.test.mjs）。
 */

/** 1 桁ぶんの表示。今の数字と次の数字を縦に並べ、offset の割合だけ次へ送る。 */
export type OdometerSlot = {
  /** 今の数字。上の桁の 0 は空にする */
  digit: string;
  /** 次に回ってくる数字 */
  next: string;
  /** 次の数字へ回った割合（0〜1） */
  offset: number;
};

/** 整数部の桁数。0 も 1 桁と数え、符号は数えない。 */
export function digitCount(value: number): number {
  return Math.max(1, String(Math.floor(Math.abs(value))).length);
}

/**
 * 数え上げの途中の値（端数つき）を、上の桁から順に並べた表示にする。
 *
 * 端数は 1 の位が次の数字へ回った割合として使う。上の桁が一緒に回るのは、
 * それより下の桁がすべて 9 のときだけ（本物の距離計と同じ）。
 */
export function odometerSlots(display: number, digits: number): OdometerSlot[] {
  const whole = Math.floor(display);
  const fraction = display - whole;
  return Array.from({ length: digits }, (_, index) => {
    const place = 10 ** (digits - 1 - index);
    const current = Math.floor(whole / place);
    const rolling = whole % place === place - 1;
    return {
      digit: current === 0 && place > 1 ? "" : String(current % 10),
      next: String((current + 1) % 10),
      offset: rolling ? fraction : 0,
    };
  });
}
