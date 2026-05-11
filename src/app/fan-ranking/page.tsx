import { getLeagues, getStandings } from "@/lib/data";
import RankingPageClient from "./RankingPageClient";

export const revalidate = 300;

export default async function RankingPage() {
  const [leagues, standings] = await Promise.all([
    getLeagues(),
    getStandings(),
  ]);

  return <RankingPageClient leagues={leagues} standings={standings} />;
}
