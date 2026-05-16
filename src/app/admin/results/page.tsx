import { createClient as createAdmin } from "@supabase/supabase-js";
import { getRounds, getLeagues } from "@/lib/data";
import ResultsAdminClient from "./ResultsAdminClient";
import type { Team, Player } from "@/lib/types/app";

export default async function AdminResultsPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [rounds, leagues, { data: teamsData }, { data: playersData }] =
    await Promise.all([
      getRounds().catch(() => []),
      getLeagues().catch(() => []),
      admin
        .from("teams")
        .select("team_id, name, slug, league_id, league_name, logo_url, home_color, captain, description, is_active")
        .eq("is_active", true)
        .order("league_id")
        .order("name"),
      admin
        .from("players")
        .select("player_id, name, team_id, league_id, number, photo_url, is_captain, user_email, teams(name)")
        .order("team_id")
        .order("number"),
    ]);

  const teams: Team[] = (teamsData ?? []).map((t) => ({
    id: t.team_id as string,
    name: t.name as string,
    slug: (t.slug as string) ?? "",
    leagueId: t.league_id as string,
    leagueName: (t.league_name as string) ?? "",
    logoUrl: (t.logo_url as string | null) ?? null,
    homeColor: (t.home_color as string) ?? "#000000",
    captainName: (t.captain as string) ?? "",
    description: (t.description as string) ?? "",
    twitterUrl: null,
    instagramUrl: null,
    isActive: (t.is_active as boolean) ?? true,
  }));

  const players: Player[] = (playersData ?? []).map((p) => {
    const t = p.teams as { name: string }[] | { name: string } | null;
    const teamName = !t ? "" : Array.isArray(t) ? (t[0]?.name ?? "") : (t.name ?? "");
    return {
      id: p.player_id as string,
      name: (p.name as string) ?? "",
      teamId: p.team_id as string,
      teamName,
      leagueId: p.league_id as string,
      number: (p.number as number) ?? 0,
      photoUrl: (p.photo_url as string | null) ?? null,
      isCaptain: (p.is_captain as boolean) ?? false,
      userEmail: (p.user_email as string | null) ?? null,
    };
  });

  return (
    <ResultsAdminClient
      rounds={rounds}
      teams={teams}
      leagues={leagues}
      players={players}
    />
  );
}
