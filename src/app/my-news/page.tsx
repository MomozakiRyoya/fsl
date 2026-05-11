import { getTeams, getNews } from "@/lib/data";
import MyNewsPageClient from "@/components/my-news/MyNewsPageClient";

export const revalidate = 300;

export default async function MyNewsPage() {
  const [teams, news] = await Promise.all([getTeams(), getNews()]);
  return <MyNewsPageClient teams={teams} news={news} />;
}
