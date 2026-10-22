import { createClient as createAdmin } from "@supabase/supabase-js";
import type { NewsItem } from "@/lib/types/app";

/**
 * 管理画面用。非公開の記事も含めて service role で読む。
 * news の読み取り許可（RLS）を公開記事だけに絞っても、管理画面からは非公開の記事を公開に戻せるようにする。
 * /admin は proxy.ts で管理者以外を弾いているので、管理画面以外から呼ばない
 */
export async function fetchAllNewsAsAdmin(): Promise<NewsItem[]> {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await admin
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) throw new Error(error?.message ?? "news fetch failed");

  return data.map((n) => ({
    id: n.id as string,
    title: (n.title as string) ?? "",
    slug: (n.slug as string) ?? n.id,
    category: (n.category as NewsItem["category"]) ?? "お知らせ",
    publishedAt: (n.published_at as string) ?? "",
    thumbnailUrl: (n.thumbnail_url as string | null) ?? null,
    body: (n.body as string) ?? "",
    isPublished: (n.is_published as boolean) ?? false,
    seasonId: "",
  }));
}
