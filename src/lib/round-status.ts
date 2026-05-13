import type { Round, RoundStatus } from "./types/app";
import { getRoundStartTime } from "./start-time";

export function getEffectiveStatus(round: Round): RoundStatus {
  const time = getRoundStartTime(round);
  const matchTime = new Date(`${round.date}T${time}:00+09:00`).getTime();
  const now = Date.now();
  if (matchTime < now) return "finished";
  if (round.status === "finished") return "scheduled";
  return round.status;
}
