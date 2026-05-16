import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import AccountClient from "@/components/account/AccountClient";
import PlayerStatsSection from "./PlayerStatsSection";
import Link from "next/link";
import { getPlayers, getStandings, getLeagues, getRounds } from "@/lib/data";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="px-4 pt-10 pb-10 text-center"
          style={{
            background:
              "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
          }}
        >
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
            My Page
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            マイページ
          </h1>
          <p className="text-sm text-white/50 mb-8">
            ログインまたは新規登録してご利用ください
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link
              href="/auth/signup?redirect=/mypage"
              className="block w-full py-3.5 rounded-2xl text-sm font-bold text-center"
              style={{
                background: "linear-gradient(135deg, #c9921e, #e3c060)",
                color: "#0c1e42",
              }}
            >
              新規登録
            </Link>
            <Link
              href="/auth/login?redirect=/mypage"
              className="block w-full py-3.5 rounded-2xl text-sm font-bold text-center border border-white/20 text-white"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [players, standings, leagues, rounds] = await Promise.all([
    getPlayers(),
    getStandings(),
    getLeagues(),
    getRounds(),
  ]);

  // 1. user_metadataのplayer_idで照合
  let playerId = user.user_metadata?.player_id ?? null;
  let myPlayer = playerId
    ? (players.find((p) => p.id === playerId) ?? null)
    : null;

  // 2. player_idが未設定の場合、userEmailで自動照合
  if (!myPlayer && user.email) {
    const matched = players.find(
      (p) =>
        p.userEmail && p.userEmail.toLowerCase() === user.email!.toLowerCase(),
    );
    if (matched) {
      myPlayer = matched;
      await supabase.auth.updateUser({ data: { player_id: matched.id } });
      playerId = matched.id;
    }
  }

  // 選手個別の player_results をサービスロールで取得
  let playerRoundResults: {
    roundNumber: number;
    points: number;
    rank: number | null;
  }[] = [];
  if (myPlayer) {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: prData } = await admin
      .from("player_results")
      .select("round_id, points, rank")
      .eq("team_id", myPlayer.teamId)
      .ilike("player_name", myPlayer.name);

    if (prData) {
      const roundMap: Record<string, number> = {};
      for (const r of rounds) roundMap[r.id] = r.roundNumber;
      playerRoundResults = prData
        .map((r) => ({
          roundNumber: roundMap[r.round_id as string] ?? 0,
          points: (r.points as number) ?? 0,
          rank: r.rank as number | null,
        }))
        .filter((r) => r.roundNumber > 0)
        .sort((a, b) => a.roundNumber - b.roundNumber);
    }
  }

  return (
    <div>
      <AccountClient
        email={user.email ?? ""}
        displayName={user.user_metadata?.display_name ?? ""}
        avatarColor={user.user_metadata?.avatar_color ?? "#0c1e42"}
        avatarUrl={user.user_metadata?.avatar_url ?? null}
        playerId={playerId}
      />
      <PlayerStatsSection
        player={myPlayer}
        allPlayers={players}
        standings={standings}
        leagues={leagues}
        playerRoundResults={playerRoundResults}
      />
    </div>
  );
}
