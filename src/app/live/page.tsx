import { getRounds, getStandings, getLeagues, getStacks } from "@/lib/data";
import LivePageClient from "@/components/live/LivePageClient";

export const revalidate = 60;

export default async function LivePage() {
  const [rounds, standings, leagues, stacks] = await Promise.all([
    getRounds(),
    getStandings(),
    getLeagues(),
    getStacks(),
  ]);
  return (
    <LivePageClient
      rounds={rounds}
      standings={standings}
      leagues={leagues}
      stacks={stacks}
    />
  );
}
