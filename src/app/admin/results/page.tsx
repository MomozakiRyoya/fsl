import { getRounds, getTeams, getLeagues, getPlayers } from "@/lib/data";
import ResultsAdminClient from "./ResultsAdminClient";

export default async function AdminResultsPage() {
  const [rounds, teams, leagues, players] = await Promise.all([
    getRounds().catch(() => []),
    getTeams().catch(() => []),
    getLeagues().catch(() => []),
    getPlayers().catch(() => []),
  ]);
  return <ResultsAdminClient rounds={rounds} teams={teams} leagues={leagues} players={players} />;
}
