import { getNews } from "@/lib/data";
import NewsAdminClient from "./NewsAdminClient";

export default async function AdminNewsPage() {
  const news = await getNews().catch(() => []);
  return <NewsAdminClient initialNews={news} />;
}
