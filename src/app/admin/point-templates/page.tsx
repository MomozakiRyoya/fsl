import { createClient as createAdmin } from "@supabase/supabase-js";
import PointTemplatesAdminClient from "./PointTemplatesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPointTemplatesPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await admin
    .from("point_templates")
    .select("*")
    .order("created_at", { ascending: false });

  const templates = (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    description: (d.description as string) ?? "",
    points: (d.points as { rank: number; pts: number }[]) ?? [],
    isPublished: (d.is_published as boolean) ?? false,
  }));

  return <PointTemplatesAdminClient initialTemplates={templates} />;
}
