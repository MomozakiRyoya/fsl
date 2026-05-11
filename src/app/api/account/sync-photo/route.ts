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
  const avatarUrl = (body.avatarUrl as string | null) ?? null;
  const playerId =
    (body.playerId as string | null) ??
    (user.user_metadata?.player_id as string | undefined) ??
    null;

  // RLSをバイパスしてphoto_urlを更新
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let query = admin.from("players").update({ photo_url: avatarUrl });

  if (playerId) {
    query = query.eq("player_id", playerId);
  } else if (user.email) {
    query = query.eq("user_email", user.email);
  } else {
    return NextResponse.json({ ok: false, reason: "no player linked" });
  }

  const { error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
