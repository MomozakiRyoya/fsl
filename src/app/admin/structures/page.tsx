import { createClient } from "@/lib/supabase/server";
import StructuresAdminClient from "./StructuresAdminClient";
import type { BlindLevel } from "@/lib/types/app";

export default async function AdminStructuresPage() {
  const supabase = await createClient();
  const [{ data }, { data: roundsData }] = await Promise.all([
    supabase
      .from("structures")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("rounds")
      .select(
        "id, name, league_id, league_name, round_number, date, structure_id",
      )
      .order("league_id")
      .order("round_number"),
  ]);

  const structures = (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    startingStack: (d.starting_stack as number) ?? 10000,
    maxPlayers: (d.max_players as number) ?? 9,
    format: (d.format as string) ?? "",
    levels: (d.levels as BlindLevel[]) ?? [],
  }));

  const rounds = (roundsData ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    leagueId: r.league_id as string,
    leagueName: r.league_name as string,
    roundNumber: r.round_number as number,
    date: r.date as string,
    structureId: (r.structure_id as string | null) ?? null,
  }));

  return (
    <StructuresAdminClient initialStructures={structures} rounds={rounds} />
  );
}
