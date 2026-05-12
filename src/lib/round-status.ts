import type { Round, RoundStatus } from "./types/app";

export function getEffectiveStatus(round: Round): RoundStatus {
  const time =
    round.startTime && /^\d{2}:\d{2}$/.test(round.startTime)
      ? round.startTime
      : "18:00";
  const matchTime = new Date(
    `${round.date}T${time}:00+09:00`,
  ).getTime();
  const now = Date.now();
  if (matchTime < now) return "finished";
  if (round.status === "finished") return "scheduled";
  return round.status;
}
