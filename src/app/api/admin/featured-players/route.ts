import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

function isAdmin(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .includes(email);
}
async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email ?? "")) return null;
  return user;
}

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function raw(d: Record<string, unknown>) {
  return {
    id: d.id as string,
    imageUrl: d.image_url as string,
    playerName: (d.player_name as string) ?? "",
    teamName: (d.team_name as string) ?? "",
    orderNum: (d.order_num as number) ?? 0,
    isActive: (d.is_active as boolean) ?? true,
  };
}

export async function GET() {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("featured_players")
    .select("*")
    .order("order_num")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(raw));
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.imageUrl)
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });

  const admin = getAdmin();
  const { data, error } = await admin
    .from("featured_players")
    .insert({
      image_url: body.imageUrl,
      player_name: body.playerName ?? "",
      team_name: body.teamName ?? "",
      order_num: body.orderNum ?? 0,
      is_active: body.isActive ?? true,
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: error?.message ?? "作成失敗" }, { status: 500 });
  return NextResponse.json(raw(data as Record<string, unknown>));
}
