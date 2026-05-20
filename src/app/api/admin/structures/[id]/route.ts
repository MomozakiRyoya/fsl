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
    pointTemplateId: (d.point_template_id as string | null) ?? null,
  };
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
  const admin = getAdmin();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.startingStack !== undefined)
    updates.starting_stack = body.startingStack;
  if (body.maxPlayers !== undefined) updates.max_players = body.maxPlayers;
  if (body.format !== undefined) updates.format = body.format;
  if (body.levels !== undefined) updates.levels = body.levels;
  if (body.pointTemplateId !== undefined)
    updates.point_template_id = body.pointTemplateId || null;

  const { data, error } = await admin
    .from("structures")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  revalidatePath("/schedule");
  return NextResponse.json(rawToStructure(data as Record<string, unknown>));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = getAdmin();
  const { error } = await admin.from("structures").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  revalidatePath("/schedule");
  return NextResponse.json({ ok: true });
}
