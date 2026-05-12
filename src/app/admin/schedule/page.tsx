import { getRounds, getTeams } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import ScheduleAdminClient from "./ScheduleAdminClient";

export default async function AdminSchedulePage() {
  const supabase = await createClient();
  const [rounds, teams, { data: structuresData }] = await Promise.all([
    getRounds().catch(() => []),
    getTeams().catch(() => []),
    supabase
      .from("structures")
      .select("id, name")
      .order("created_at", { ascending: false }),
  ]);
  const structures = (structuresData ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
  }));
  return (
    <ScheduleAdminClient
      initialRounds={rounds}
      teams={teams}
      structures={structures}
    />
  );
}
