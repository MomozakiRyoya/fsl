/**
 * 試合日程の曜日から開始時刻を算出する。
 * 木曜 19:00 / 土曜 18:00 / 日曜 15:00 (固定ルール)
 * round.startTime が明示設定されている場合はそちらを優先。
 */
export function getDefaultStartTime(date: string): string {
  if (!date) return "18:00";
  const d = new Date(date + "T00:00:00+09:00");
  const day = d.getDay(); // 0=日, 4=木, 6=土
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
  const d = new Date(date + "T00:00:00+09:00");
  return WEEKDAYS[d.getDay()];
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
