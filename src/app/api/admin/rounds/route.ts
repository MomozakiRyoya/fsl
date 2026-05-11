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

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rounds")
    .insert({
      id: `round-${Date.now()}`,
      name: body.name ?? "",
      league_id: body.leagueId ?? "",
      league_name: body.leagueName ?? "",
      round_number: body.roundNumber ?? 0,
      date: body.date ?? "",
      venue: body.venue ?? "",
      venue_url: body.venueUrl ?? null,
      status: body.status ?? "scheduled",
      is_playoff: body.isPlayoff ?? false,
      format: body.format ?? "",
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  revalidatePath("/schedule");
  revalidatePath("/");
  return NextResponse.json(data);
}
