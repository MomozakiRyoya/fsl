import { revalidatePath } from "next/cache";
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

function rawToStructure(d: Record<string, unknown>) {
  return {
    id: d.id as string,
    name: d.name as string,
    startingStack: (d.starting_stack as number) ?? 10000,
    maxPlayers: (d.max_players as number) ?? 9,
    format: (d.format as string) ?? "",
    levels: (d.levels as unknown[]) ?? [],
  };
}

export async function GET() {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("structures")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(rawToStructure));
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name)
    return NextResponse.json({ error: "name is required" }, { status: 400 });

  const admin = getAdmin();
  const { data, error } = await admin
    .from("structures")
    .insert({
      name: body.name,
      starting_stack: body.startingStack ?? 10000,
      max_players: body.maxPlayers ?? 9,
      format: body.format ?? "",
      levels: body.levels ?? [],
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "作成失敗" },
      { status: 500 },
    );
  revalidatePath("/schedule");
  return NextResponse.json(rawToStructure(data as Record<string, unknown>));
}
