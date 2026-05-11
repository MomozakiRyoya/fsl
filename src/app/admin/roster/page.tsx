import { createClient } from "@/lib/supabase/server";
import { getLeagues, getTeams, getRounds } from "@/lib/data";
import RosterAdminClient from "./RosterAdminClient";

export default async function AdminRosterPage() {
  const supabase = await createClient();
  const { data: rosters } = await supabase
    .from("rosters")
    .select("*")
    .order("updated_at", { ascending: false });

  const [leagues, teams, rounds] = await Promise.all([
    getLeagues().catch(() => []),
    getTeams().catch(() => []),
    getRounds().catch(() => []),
  ]);

  return (
    <RosterAdminClient
      initialRosters={rosters ?? []}
      leagues={leagues}
      teams={teams}
      rounds={rounds}
    />
  );
}
