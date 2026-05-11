import { getPlayerStats, getStandings } from "@/lib/data";
import ComparePageClient from "@/components/compare/ComparePageClient";

export const revalidate = 300;

export default async function ComparePage() {
  const [playerStats, standings] = await Promise.all([
    getPlayerStats(),
    getStandings(),
  ]);
  return <ComparePageClient playerStats={playerStats} standings={standings} />;
}
