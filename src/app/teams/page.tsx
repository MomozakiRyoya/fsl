import { getTeams, getLeagues, getStandings } from "@/lib/data";
import TeamsPageClient from "@/components/teams/TeamsPageClient";

export const revalidate = 300;

export default async function TeamsPage() {
  const [teams, leagues, standings] = await Promise.all([
    getTeams(),
    getLeagues(),
    getStandings(),
  ]);
  return <TeamsPageClient teams={teams} leagues={leagues} standings={standings} />;
}
