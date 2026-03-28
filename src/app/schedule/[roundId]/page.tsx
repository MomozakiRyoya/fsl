import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MOCK_ROUNDS, MOCK_MATCH_RESULTS } from '@/lib/mock-data'

type Props = {
  params: Promise<{ roundId: string }>
}

function getStatusLabel(status: string) {
  if (status === 'finished') return '終了'
  if (status === 'next') return '次節'
  return '予定'
}

export default async function RoundDetailPage({ params }: Props) {
  const { roundId } = await params
  const round = MOCK_ROUNDS.find((r) => r.id === roundId)

  if (!round) notFound()

  const matchResult = MOCK_MATCH_RESULTS.find((m) => m.roundId === roundId)

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="px-4 pt-6 pb-6 animate-fade-in"
        style={{ background: 'linear-gradient(135deg, #0c1e42, #1a3060)' }}
      >
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1 text-xs mb-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          日程に戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          {round.isPlayoff && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">PLAYOFF</span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: round.status === 'next' ? 'linear-gradient(135deg, #c9921e, #e3c060)' :
                round.status === 'finished' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
              color: round.status === 'next' ? '#0c1e42' : 'rgba(255,255,255,0.8)',
            }}
          >
            {getStatusLabel(round.status)}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white">{round.leagueName} {round.name}</h1>
        <div className="flex flex-col gap-1 mt-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {round.date}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {round.venue}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* 結果 */}
        {matchResult ? (
          <section className="animate-fade-in">
            <h2 className="text-sm font-bold text-slate-700 mb-3">トーナメント結果</h2>
            <div className="bg-white rounded-xl border border-[#e8dfc0] overflow-hidden">
              <div
                className="grid grid-cols-[2.5rem_1fr_3rem] gap-1 px-4 py-2.5 border-b border-slate-200 text-xs font-medium"
                style={{ background: '#0c1e42', color: 'rgba(255,255,255,0.7)' }}
              >
                <span className="text-center">順位</span>
                <span>チーム</span>
                <span className="text-right">ポイント</span>
              </div>
              {matchResult.results.map((result, i) => {
                const isTop = result.rank <= 2
                const isBottom = result.rank >= 7
                return (
                  <div
                    key={result.teamId}
                    className="grid grid-cols-[2.5rem_1fr_3rem] gap-1 px-4 py-3 items-center border-b border-slate-100 last:border-0 animate-slide-up"
                    style={{
                      animationDelay: `${i * 50}ms`,
                      background: isTop ? 'rgba(201,146,30,0.06)' : isBottom ? 'rgba(239,68,68,0.04)' : undefined,
                    }}
                  >
                    <div className="flex justify-center">
                      {result.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #c9921e, #e3c060)', color: '#0c1e42' }}>1</span>
                      ) : result.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 text-white text-xs font-bold shadow-sm">2</span>
                      ) : result.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm">3</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 text-slate-500 text-sm font-medium">{result.rank}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{result.teamName}</span>
                    <span className="text-sm font-bold text-right" style={{ color: isTop ? '#c9921e' : '#0c1e42' }}>
                      {result.points}pt
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="animate-fade-in">
            <div className="bg-gray-50 rounded-xl border border-[#e8dfc0] p-8 text-center">
              {round.status === 'scheduled' ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">この節はまだ開催されていません</p>
                  <p className="text-xs text-slate-400 mt-1">開催日: {round.date}</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse" style={{ background: 'rgba(201,146,30,0.15)' }}>
                    <svg className="w-6 h-6" style={{ color: '#c9921e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700">試合結果を準備中</p>
                  <p className="text-xs text-slate-400 mt-1">もうしばらくお待ちください</p>
                </>
              )}
            </div>
          </section>
        )}

        {/* シェアボタン */}
        <div className="animate-fade-in animate-delay-200">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`FSL ${round.leagueName} ${round.name} の結果`)}&url=${encodeURIComponent(`https://fsl-gilt.vercel.app/schedule/${roundId}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#e8dfc0] text-sm font-medium transition-all active:scale-[0.99] hover:shadow-sm"
            style={{ background: 'rgba(201,146,30,0.06)', color: '#0c1e42' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            結果をシェア
          </a>
        </div>
      </div>
    </div>
  )
}
