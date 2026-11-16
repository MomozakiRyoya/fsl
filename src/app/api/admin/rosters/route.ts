import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { parseDeleteIds } from "@/lib/roster-admin";

function isAdmin(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
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

// 出場選手登録を id 指定で削除する（1 件でも複数件でも同じ口）。
// 本文: { ids: [...] }。実際に消えた行の id を deleted で返す。
export async function DELETE(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const ids = parseDeleteIds(body);
  if (!ids)
    return NextResponse.json(
      { error: "削除する登録の指定が正しくありません" },
      { status: 400 },
    );

  const admin = getAdmin();
  const { data, error } = await admin
    .from("rosters")
    .delete()
    .in("id", ids)
    .select("id");

  if (error || !data) {
    console.error("[admin/rosters] delete failed", {
      count: ids.length,
      message: error?.message,
    });
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: data.map((r) => r.id) });
}
