import { getTeams } from "@/lib/data";
import TeamsAdminClient from "./TeamsAdminClient";

export default async function AdminTeamsPage() {
  const teams = await getTeams().catch(() => []);
  return <TeamsAdminClient initialTeams={teams} />;
}
