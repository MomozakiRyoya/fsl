import { createClient as createAdmin } from "@supabase/supabase-js";
import FeaturedPlayersAdminClient from "./FeaturedPlayersAdminClient";

export default async function AdminFeaturedPlayersPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin
    .from("featured_players")
    .select("*")
    .order("order_num")
    .order("created_at");

  const items = (data ?? []).map((d) => ({
    id: d.id as string,
    imageUrl: d.image_url as string,
    playerName: (d.player_name as string) ?? "",
    teamName: (d.team_name as string) ?? "",
    orderNum: (d.order_num as number) ?? 0,
    isActive: (d.is_active as boolean) ?? true,
  }));

  return <FeaturedPlayersAdminClient initialItems={items} />;
}
