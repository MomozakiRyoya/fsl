import { getLeagues, getStandings } from "@/lib/data";
import StandingsPageClient from "@/components/standings/StandingsPageClient";

export const revalidate = 300;

export default async function StandingsPage() {
  const [leagues, standings] = await Promise.all([getLeagues(), getStandings()]);
  return <StandingsPageClient leagues={leagues} standings={standings} />;
}
