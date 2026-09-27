/** ダークのカード（globals.css の `.dark .card-native`）の地の色 */
const DARK_CARD = "#0f1a35";
/** 沈む色の代わり。slate-500 は白の上でも暗いカードの上でも 3:1 を超える */
const FALLBACK = "#64748b";
/** 棒・線など、数字を添えた図形に要る最低のコントラスト（WCAG 1.4.11） */
const MIN_CONTRAST = 3;

/** `#RGB` / `#RRGGBB` を 0〜255 の 3 つに直す。読めなければ null */
function parseHex(value: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!m) return null;
  const hex =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * チームの色を、棒やグラフの線に使える色にして返す。
 * ダークのカードの上で 3:1 に届かない色（紺に近い #1e293b など）と読めない値は slate-500 に寄せ、
 * それ以外は受け取った値をそのまま返す。金 #c9921e は白の上で 2.76:1 だがブランド色なので替えない。
 */
export function teamAccent(color: string | null | undefined): string {
  if (typeof color !== "string") return FALLBACK;
  const rgb = parseHex(color.trim());
  if (!rgb) return FALLBACK;
  const lighter = luminance(rgb);
  const darker = luminance(parseHex(DARK_CARD)!);
  const contrast =
    (Math.max(lighter, darker) + 0.05) / (Math.min(lighter, darker) + 0.05);
  return contrast < MIN_CONTRAST ? FALLBACK : color;
}
