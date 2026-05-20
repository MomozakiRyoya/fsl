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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email ?? "")) return null;
  return user;
}
function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.description !== undefined) patch.description = body.description;
  if (body.points !== undefined) patch.points = body.points;
  if (body.isPublished !== undefined) patch.is_published = body.isPublished;

  const admin = getAdmin();
  const { data, error } = await admin
    .from("point_templates")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: error?.message ?? "更新失敗" }, { status: 500 });

  revalidatePath("/schedule");
  return NextResponse.json({
    id: data.id,
    name: data.name,
    description: data.description ?? "",
    points: data.points ?? [],
    isPublished: data.is_published ?? false,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = getAdmin();
  const { error } = await admin.from("point_templates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/schedule");
  return NextResponse.json({ ok: true });
}
