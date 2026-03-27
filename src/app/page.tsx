import { getActiveSeason, getLeagues, getLatestNews } from '@/lib/notion/queries'
import type { Season, League, NewsItem } from '@/lib/types/app'

export const revalidate = 300

export default async function HomePage() {
  let season: Season | null = null
  let leagues: League[] = []
  let news: NewsItem[] = []

  if (process.env.NOTION_API_KEY) {
    try {
      season = await getActiveSeason()
      if (season) leagues = await getLeagues(season.id)
      news = await getLatestNews(6)
    } catch (e) {
      console.error('Notion fetch error:', e)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* ヒーローセクション */}
      <section className="bg-primary-500 rounded-xl p-8 mb-6 text-center text-white">
        <h1 className="text-3xl font-bold mb-2">Fukuoka Super League</h1>
        <p className="text-primary-100">
          {season ? `${season.name} 開催中` : 'シーズン情報を準備中'}
        </p>
      </section>

      {/* ニュース */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">ニュース</h2>
        {news.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">ニュースはありません</p>
        ) : (
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
        )}
      </section>

      {/* リーグ */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">リーグ</h2>
        {leagues.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">リーグ情報を準備中</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {leagues.map((league) => (
              <div key={league.id} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-sm font-medium text-slate-900">{league.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
