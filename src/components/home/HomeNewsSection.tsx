import Link from "next/link";
import type { NewsItem, NewsCategory } from "@/lib/types/app";
import { NEWS_CATEGORY_COLORS } from "@/lib/constants";

export default function HomeNewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  return (
    <ul className="border-t border-ink/15 md:grid md:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
      {news.map((item, i) => (
        <li key={item.id} className="border-b border-ink/15">
          <Link
            href={`/news/${item.slug}`}
            className="group touch-active block py-3.5"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`pill ${NEWS_CATEGORY_COLORS[item.category as NewsCategory]}`}
              >
                {item.category}
              </span>
              {i < 2 && (
                <span className="border border-ink px-1 py-0.5 text-[10px] font-bold leading-none text-ink">
                  新着
                </span>
              )}
              <span className="ml-auto text-xs text-ink/70 tabular-nums">
                {item.publishedAt}
              </span>
            </div>
            <p className="text-sm font-bold text-ink leading-snug line-clamp-2 underline-offset-4 group-hover:underline">
              {item.title}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
