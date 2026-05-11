import { getTeams, getPlayers, getNews } from "@/lib/data";
import SearchPageClient from "@/components/search/SearchPageClient";

export const revalidate = 300;

export default async function SearchPage() {
  const [teams, players, news] = await Promise.all([
    getTeams(),
    getPlayers(),
    getNews(),
  ]);
  return <SearchPageClient teams={teams} players={players} news={news} />;
}
