import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // avatarUrl は string または null のみ許可
  const rawAvatarUrl = body.avatarUrl;
  if (
    rawAvatarUrl !== null &&
    rawAvatarUrl !== undefined &&
    typeof rawAvatarUrl !== "string"
  ) {
    return NextResponse.json({ error: "Invalid avatarUrl type" }, { status: 400 });
  }
  const avatarUrl: string | null =
    typeof rawAvatarUrl === "string" ? rawAvatarUrl : null;

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 優先度 1: user_metadata.player_id（サーバー信頼済み）
  const metaPlayerId = user.user_metadata?.player_id as string | undefined;
  if (metaPlayerId) {
    const { error } = await admin
      .from("players")
      .update({ photo_url: avatarUrl })
      .eq("player_id", metaPlayerId);
    if (!error) return NextResponse.json({ ok: true });
  }

  // 優先度 2: body.playerId + 所有確認（user_email で照合）
  const bodyPlayerId = body.playerId as string | undefined;
  if (bodyPlayerId && user.email) {
    const { data: playerRow } = await admin
      .from("players")
      .select("player_id")
      .eq("player_id", bodyPlayerId)
      .eq("user_email", user.email)
      .single();
    if (playerRow) {
      const { error } = await admin
        .from("players")
        .update({ photo_url: avatarUrl })
        .eq("player_id", bodyPlayerId);
      if (!error) return NextResponse.json({ ok: true });
    }
  }

  // 優先度 3: user.email で players.user_email を照合
  if (user.email) {
    const { error } = await admin
      .from("players")
      .update({ photo_url: avatarUrl })
      .eq("user_email", user.email);
    if (!error) return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, reason: "no player linked" });
}
