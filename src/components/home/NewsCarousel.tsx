import type { NewsItem } from '@/lib/types/app'

interface Props {
  news: NewsItem[]
}

export default function NewsCarousel({ news }: Props) {
  if (news.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">ニュースはありません</p>
  }

  return (
    <div className="space-y-2">
      {news.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
            <span className="text-xs text-slate-500">{item.publishedAt}</span>
          </div>
          <p className="text-sm font-medium text-slate-900">{item.title}</p>
        </div>
      ))}
    </div>
  )
}
