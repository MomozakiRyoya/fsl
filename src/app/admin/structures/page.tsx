import { createClient } from "@/lib/supabase/server";
import StructuresAdminClient from "./StructuresAdminClient";
import type { BlindLevel } from "@/lib/types/app";

export default async function AdminStructuresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("structures")
    .select("*")
    .order("created_at", { ascending: false });

  const structures = (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    startingStack: (d.starting_stack as number) ?? 10000,
    maxPlayers: (d.max_players as number) ?? 9,
    format: (d.format as string) ?? "",
    levels: (d.levels as BlindLevel[]) ?? [],
  }));

  return <StructuresAdminClient initialStructures={structures} />;
}
