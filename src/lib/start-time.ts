/**
 * 試合日程の曜日から開始時刻を算出する。
 * 木曜 19:00 / 土曜 18:00 / 日曜 15:00 (固定ルール)
 * round.startTime が明示設定されている場合はそちらを優先。
 */
/**
 * Tomohiko Sakamoto のアルゴリズム（Date オブジェクト不使用）
 * タイムゾーンに一切依存しない曜日計算。0=日〜6=土
 */
function calcDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const yy = m < 3 ? y - 1 : y;
  return (
    (yy +
      Math.floor(yy / 4) -
      Math.floor(yy / 100) +
      Math.floor(yy / 400) +
      t[m - 1] +
      d) %
    7
  );
}

export function getDefaultStartTime(date: string): string {
  if (!date) return "18:00";
  const day = calcDayOfWeek(date); // 0=日, 4=木, 6=土
  if (day === 4) return "19:00"; // 木曜
  if (day === 6) return "18:00"; // 土曜
  if (day === 0) return "15:00"; // 日曜
  return "18:00"; // その他
}

export function getRoundStartTime(round: {
  date: string;
  startTime?: string | null;
}): string {
  if (round.startTime && /^\d{2}:\d{2}$/.test(round.startTime)) {
    return round.startTime;
  }
  return getDefaultStartTime(round.date);
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function getWeekday(date: string): string {
  if (!date) return "";
  return WEEKDAYS[calcDayOfWeek(date)];
}

/** "2026-05-14（木）19:00～" 形式で返す */
export function formatRoundDateTime(round: {
  date: string;
  startTime?: string | null;
}): string {
  if (!round.date) return "";
  const weekday = getWeekday(round.date);
  const time = getRoundStartTime(round);
  return `${round.date}（${weekday}）${time}～`;
}
