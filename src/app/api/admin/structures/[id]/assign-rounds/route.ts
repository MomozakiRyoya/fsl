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

// この構造に紐づける節を一括更新
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: structureId } = await params;
  const body = await request.json();
  const roundIds: string[] = Array.isArray(body.roundIds) ? body.roundIds : [];

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // この構造が設定されている全節を取得
  const { data: current } = await admin
    .from("rounds")
    .select("id")
    .eq("structure_id", structureId);

  const currentIds = (current ?? []).map((r) => r.id as string);
  const toRemove = currentIds.filter((id) => !roundIds.includes(id));
  const toAdd = roundIds.filter((id) => !currentIds.includes(id));

  // 紐づけ解除
  if (toRemove.length > 0) {
    await admin
      .from("rounds")
      .update({ structure_id: null })
      .in("id", toRemove);
  }

  // 紐づけ設定
  if (toAdd.length > 0) {
    await admin
      .from("rounds")
      .update({ structure_id: structureId })
      .in("id", toAdd);
  }

  return NextResponse.json({ ok: true, added: toAdd.length, removed: toRemove.length });
}
