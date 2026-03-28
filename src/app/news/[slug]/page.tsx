import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MOCK_NEWS } from '@/lib/mock-data'

type Props = {
  params: Promise<{ slug: string }>
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  '結果': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'お知らせ': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'イベント': { bg: 'bg-amber-50', text: 'text-amber-700' },
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const news = MOCK_NEWS.find((n) => n.slug === slug)

  if (!news) notFound()

  const currentIndex = MOCK_NEWS.findIndex((n) => n.slug === slug)
  const prev = MOCK_NEWS[currentIndex + 1] ?? null
  const next = MOCK_NEWS[currentIndex - 1] ?? null

  const catStyle = CATEGORY_STYLES[news.category] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }

  const paragraphs = news.body.split('\n\n').filter(Boolean)

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div className="px-4 pt-6 pb-5 border-b border-[#e8dfc0] animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ホームに戻る
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catStyle.bg} ${catStyle.text}`}>
            {news.category}
          </span>
          <span className="text-xs text-slate-400">{news.publishedAt}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-snug">{news.title}</h1>
      </div>

      {/* 本文 */}
      <div className="px-4 py-6 animate-fade-in animate-delay-100">
        {news.body ? (
          <div className="space-y-4">
            {paragraphs.map((para, i) => {
              if (para.startsWith('**') && para.endsWith('**')) {
                return (
                  <p key={i} className="text-sm font-bold text-slate-900">
                    {para.replace(/\*\*/g, '')}
                  </p>
                )
              }
              if (para.startsWith('- ') || para.startsWith('1位:')) {
                const lines = para.split('\n')
                return (
                  <ul key={i} className="space-y-1">
                    {lines.map((line, j) => (
                      <li key={j} className="text-sm text-body flex items-start gap-2">
                        <span className="text-slate-300 mt-0.5">•</span>
                        <span>{line.replace(/^- /, '').replace(/^\d+位:/, (m) => m)}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-sm text-body leading-relaxed">
                  {para}
                </p>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">本文を準備中です</p>
        )}
      </div>

      {/* シェアボタン */}
      <div className="px-4 pb-4">
        <div
          className="rounded-xl border border-[#e8dfc0] p-4 flex items-center justify-between"
          style={{ background: 'rgba(201,146,30,0.04)' }}
        >
          <p className="text-xs text-slate-500">この記事をシェア</p>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(`https://fsl-gilt.vercel.app/news/${news.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-95"
            style={{ background: '#0c1e42', color: 'white' }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでシェア
          </a>
        </div>
      </div>

      {/* 前後ナビ */}
      <div className="px-4 pb-8 space-y-2 animate-fade-in animate-delay-200">
        <p className="text-xs font-medium text-slate-500 mb-2">他のニュース</p>
        {next && (
          <Link
            href={`/news/${next.slug}`}
            className="flex items-center gap-3 bg-white rounded-xl border border-[#e8dfc0] p-3 hover:shadow-sm transition-all active:scale-[0.99]"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,146,30,0.15)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#c9921e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">新しい記事</p>
              <p className="text-xs font-medium text-slate-700 truncate">{next.title}</p>
            </div>
          </Link>
        )}
        {prev && (
          <Link
            href={`/news/${prev.slug}`}
            className="flex items-center gap-3 bg-white rounded-xl border border-[#e8dfc0] p-3 hover:shadow-sm transition-all active:scale-[0.99]"
          >
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs text-slate-400">古い記事</p>
              <p className="text-xs font-medium text-slate-700 truncate">{prev.title}</p>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,146,30,0.15)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#c9921e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
