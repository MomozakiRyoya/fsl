import { getAllNews } from "@/lib/data";
import NewsAdminClient from "./NewsAdminClient";

export default async function AdminNewsPage() {
  const news = await getAllNews().catch(() => []);
  return <NewsAdminClient initialNews={news} />;
}
