import Link from "next/link";
import type { NewsItem, NewsCategory } from "@/lib/types/app";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";

const CATEGORY_BORDER: Record<string, string> = {
  結果: "#2255a0",
  イベント: "#c9921e",
};
function categoryBorder(cat: string) {
  return CATEGORY_BORDER[cat] ?? "#10b981";
}

export default function HomeNewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  return (
    <>
      {/* デスクトップ */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {news.map((item, i) => (
          <Link
            key={item.id + "-grid"}
            href={`/news/${item.slug}`}
            className="card-native p-4 touch-active animate-spring-in relative overflow-hidden block"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
              style={{ background: categoryBorder(item.category) }}
            />
            <div className="flex items-center gap-2 mb-2 pl-1">
              <span className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}>
                {item.category}
              </span>
              {i < 2 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
              <span className="text-xs text-slate-400 ml-auto">{item.publishedAt}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 pl-1">
              {item.title}
            </p>
          </Link>
        ))}
      </div>

      {/* モバイル */}
      <div className="flex flex-col gap-3 md:hidden">
        {news.map((item, i) => (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="card-native p-4 touch-active relative overflow-hidden block"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
              style={{ background: categoryBorder(item.category) }}
            />
            <div className="flex items-center gap-2 mb-2 pl-1">
              <span className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}>
                {item.category}
              </span>
              {i < 2 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
              <span className="text-xs text-slate-400 ml-auto">{item.publishedAt}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 pl-1">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
