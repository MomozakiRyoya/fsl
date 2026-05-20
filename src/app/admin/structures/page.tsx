import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import StructuresAdminClient from "./StructuresAdminClient";
import type { BlindLevel } from "@/lib/types/app";

export default async function AdminStructuresPage() {
  const supabase = await createClient();
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [{ data }, { data: roundsData }, { data: ptData }] = await Promise.all([
    supabase
      .from("structures")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("rounds")
      .select("id, name, league_id, league_name, round_number, date, structure_id")
      .order("league_id")
      .order("round_number"),
    admin
      .from("point_templates")
      .select("id, name, points, is_published")
      .order("created_at", { ascending: false }),
  ]);

  const structures = (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    startingStack: (d.starting_stack as number) ?? 10000,
    maxPlayers: (d.max_players as number) ?? 9,
    format: (d.format as string) ?? "",
    levels: (d.levels as BlindLevel[]) ?? [],
    pointTemplateId: (d.point_template_id as string | null) ?? null,
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

  const pointTemplates = (ptData ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    points: (p.points as { rank: number; pts: number }[]) ?? [],
  }));

  return (
    <StructuresAdminClient
      initialStructures={structures}
      rounds={rounds}
      pointTemplates={pointTemplates}
    />
  );
}
