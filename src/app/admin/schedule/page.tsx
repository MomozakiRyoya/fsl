import { getRounds, getTeams } from "@/lib/data";
import ScheduleAdminClient from "./ScheduleAdminClient";

export default async function AdminSchedulePage() {
  const [rounds, teams] = await Promise.all([
    getRounds().catch(() => []),
    getTeams().catch(() => []),
  ]);
  return <ScheduleAdminClient initialRounds={rounds} teams={teams} />;
}
