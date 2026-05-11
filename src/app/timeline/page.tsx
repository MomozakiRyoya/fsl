import { createClient } from "@/lib/supabase/server";
import TimelineClient from "@/components/timeline/TimelineClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/timeline");

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return <TimelineClient initialPosts={posts ?? []} />;
}
