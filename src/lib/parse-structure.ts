import type { BlindLevel } from "./types/app";

function parseMinutes(s: string): number {
  const n = parseInt(s.replace(/[^0-9]/g, ""));
  return isNaN(n) || n <= 0 ? 20 : n;
}

function formatTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function parseNum(s: string): number {
  return parseInt(s.replace(/[,，\s]/g, "")) || 0;
}

const HEADER_PATTERN = /^(lv|level|レベル|sb|bb|ante|time|時間|blind)/i;

export function parseStructureText(text: string): BlindLevel[] {
  const sep = text.includes("\t") ? "\t" : ",";
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // ヘッダー行をスキップ
  const dataLines = lines.filter(
    (l) => !HEADER_PATTERN.test(l.split(sep)[0].trim()),
  );

  let elapsed = 0;
  const result: BlindLevel[] = [];

  for (const line of dataLines) {
    const cols = line
      .split(sep)
      .map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const first = cols[0] ?? "";

    const isBreak = /^(break|ブレイク|休憩|break\s*time)/i.test(first);

    if (isBreak) {
      // break行: 最初に見つかった数字をdurationとして使用
      const durCol = cols.slice(1).find((c) => /\d/.test(c)) ?? "15";
      const duration = parseMinutes(durCol);
      const start = formatTime(elapsed);
      elapsed += duration;
      result.push({ level: "break", duration: String(duration), start });
    } else {
      if (!first || isNaN(Number(first.replace(/[^0-9]/g, "")))) continue;
      const level =
        parseInt(first) || result.filter((l) => l.level !== "break").length + 1;
      const sb = parseNum(cols[1] ?? "");
      const bb = parseNum(cols[2] ?? "");
      const ante = parseNum(cols[3] ?? "");
      const duration = parseMinutes(cols[4] ?? cols[1] ?? "20");
      const start = formatTime(elapsed);
      elapsed += duration;
      result.push({ level, sb, bb, ante, duration: String(duration), start });
    }
  }

  return result;
}
