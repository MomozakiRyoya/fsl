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

function rawToTemplate(d: Record<string, unknown>) {
  return {
    id: d.id as string,
    name: d.name as string,
    description: (d.description as string) ?? "",
    points: (d.points as { rank: number; pts: number }[]) ?? [],
    isPublished: (d.is_published as boolean) ?? false,
  };
}

export async function GET() {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("point_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(rawToTemplate));
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name)
    return NextResponse.json({ error: "name is required" }, { status: 400 });

  const admin = getAdmin();
  const { data, error } = await admin
    .from("point_templates")
    .insert({
      name: body.name,
      description: body.description ?? "",
      points: body.points ?? [],
      is_published: body.isPublished ?? false,
    })
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "作成失敗" },
      { status: 500 },
    );

  revalidatePath("/schedule");
  revalidatePath("/admin/point-templates");
  return NextResponse.json(rawToTemplate(data as Record<string, unknown>));
}
