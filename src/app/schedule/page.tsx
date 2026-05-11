import { getLeagues, getRounds } from "@/lib/data";
import SchedulePageClient from "@/components/schedule/SchedulePageClient";

export const revalidate = 300;

export default async function SchedulePage() {
  const [leagues, rounds] = await Promise.all([getLeagues(), getRounds()]);
  return <SchedulePageClient leagues={leagues} rounds={rounds} />;
}
