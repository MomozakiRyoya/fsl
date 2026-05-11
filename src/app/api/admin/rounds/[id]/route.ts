import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.leagueId !== undefined) updates.league_id = body.leagueId;
  if (body.leagueName !== undefined) updates.league_name = body.leagueName;
  if (body.roundNumber !== undefined) updates.round_number = body.roundNumber;
  if (body.date !== undefined) updates.date = body.date;
  if (body.venue !== undefined) updates.venue = body.venue;
  if (body.venueUrl !== undefined) updates.venue_url = body.venueUrl;
  if (body.format !== undefined) updates.format = body.format;
  if (body.status !== undefined) updates.status = body.status;
  if (body.isPlayoff !== undefined) updates.is_playoff = body.isPlayoff;

  const { data, error } = await supabase
    .from("rounds")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  revalidatePath("/schedule");
  revalidatePath("/");
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("rounds").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  revalidatePath("/schedule");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
