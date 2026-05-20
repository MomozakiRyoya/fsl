import Link from "next/link";
import type { NewsItem } from "@/lib/types/app";

interface Props {
  news: NewsItem[];
}

export default function NewsCarousel({ news }: Props) {
  if (news.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">ニュースはありません</p>;
  }

  return (
    <div className="space-y-2">
      {news.map((item) => (
        <Link
          key={item.id}
          href={`/news/${item.slug}`}
          className="block bg-white rounded-xl border border-slate-200 p-4 active:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
            <span className="text-xs text-slate-500">{item.publishedAt}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
