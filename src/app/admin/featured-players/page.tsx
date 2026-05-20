import { createClient as createAdmin } from "@supabase/supabase-js";
import FeaturedPlayersAdminClient from "./FeaturedPlayersAdminClient";

export default async function AdminFeaturedPlayersPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [{ data }, { data: teamsData }, { data: playersData }] =
    await Promise.all([
      admin
        .from("featured_players")
        .select("*")
        .order("order_num")
        .order("created_at"),
      admin
        .from("teams")
        .select("team_id, name, league_id")
        .eq("is_active", true)
        .eq("league_id", "premier")
        .order("name"),
      admin
        .from("players")
        .select("player_id, name, team_id, image_url")
        .order("team_id")
        .order("number"),
    ]);

  const items = (data ?? []).map((d) => ({
    id: d.id as string,
    imageUrl: d.image_url as string,
    playerName: (d.player_name as string) ?? "",
    teamName: (d.team_name as string) ?? "",
    orderNum: (d.order_num as number) ?? 0,
    isActive: (d.is_active as boolean) ?? true,
  }));

  const teams = (teamsData ?? []).map((t) => ({
    id: t.team_id as string,
    name: t.name as string,
    leagueId: t.league_id as string,
  }));

  // featured_players の既存データから playerName → imageUrl のマップを作成（fallback用）
  const featuredImageMap = new Map<string, string>();
  for (const d of data ?? []) {
    const pname = d.player_name as string;
    const img = d.image_url as string;
    if (pname && img && !featuredImageMap.has(pname)) {
      featuredImageMap.set(pname, img);
    }
  }

  const players = (playersData ?? []).map((p) => ({
    id: p.player_id as string,
    name: p.name as string,
    teamId: p.team_id as string,
    imageUrl:
      (p.image_url as string | null) ||
      featuredImageMap.get(p.name as string) ||
      "",
  }));

  return (
    <FeaturedPlayersAdminClient
      initialItems={items}
      teams={teams}
      players={players}
    />
  );
}
