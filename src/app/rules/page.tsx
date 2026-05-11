export default function RulesPage() {
  const POINT_TABLE = [
    { rank: "1位", points: 12 },
    { rank: "2位", points: 9 },
    { rank: "3位", points: 7 },
    { rank: "4位", points: 5 },
    { rank: "5位", points: 3 },
    { rank: "6位", points: 2 },
    { rank: "7位", points: 1 },
    { rank: "8位", points: 0 },
  ];

  const RULES_SUMMARY = [
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "チーム構成",
      description:
        "各チーム最大8シート。各節は8チーム1テーブルで対戦します。チーム登録料（初回）は80,000円です。",
      color: "#2b70ef",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "遅刻・欠場ペナルティ",
      description:
        "試合開始時刻に遅刻または欠場した場合は失格となり、-2ptのペナルティが課されます。",
      color: "#EF4444",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.949 49.949 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.009 50.009 0 0 0 7.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.129 56.129 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
          <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 0 1-.46.71 47.878 47.878 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.877 47.877 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 0 1 6 13.18v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 0 0 .551-1.608 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.668 2.25 2.25 0 0 0 2.12 0Z" />
        </svg>
      ),
      title: "競技形式",
      description:
        "バドゥギ（Badugi）ポーカーで対戦します。各節8チーム1テーブルのフリーズアウト形式。施設使用料は6,000円/節/シートです。",
      color: "#10B981",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "プレーオフ",
      description:
        "ワイルドカード（9/6）→ セミファイナル（9/7）→ THE FINAL（9/8）の3段階。THE FINAL優勝賞金70万円。",
      color: "#F59E0B",
    },
  ];

  const PRIZE_TABLE = [
    { category: "レギュラーシーズン優勝", prize: "300,000円", icon: "🏆" },
    { category: "THE FINAL 優勝", prize: "700,000円", icon: "👑" },
    { category: "THE FINAL 2位", prize: "300,000円", icon: "🥈" },
    { category: "THE FINAL 3位", prize: "100,000円", icon: "🥉" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div
        className="rounded-2xl p-5 mb-6 text-center animate-fade-in"
        style={{
          background: "linear-gradient(135deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
        }}
      >
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">
          FSL Season 7
        </p>
        <h1 className="text-2xl font-black text-white tracking-widest mb-1">RULES</h1>
        <p className="text-xs text-white/50">2026年5月9日〜9月8日 | 全16節 | 6ディビジョン × 8チーム</p>
      </div>

      {/* ルールブックリンク */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-xl p-5 mb-6 active:scale-95 transition-all duration-200 animate-fade-in"
        style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)" }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6"
            style={{ color: "#0c1e42" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
              clipRule="evenodd"
            />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: "#0c1e42" }}>
            FSL Season 7 公式ルールブック
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(12,30,66,0.6)" }}>
            競技規定・詳細ルールを確認する
          </p>
        </div>
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "rgba(12,30,66,0.5)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>

      {/* ポイント体系 */}
      <section className="mb-6 animate-fade-in animate-delay-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          ポイントシステム
        </h2>
        <div className="bg-white rounded-xl border border-[#e8dfc0] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {POINT_TABLE.map((row, i) => (
              <div
                key={row.rank}
                className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 animate-slide-up`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-sm text-slate-700">{row.rank}</span>
                <span
                  className="text-base font-bold"
                  style={{
                    color:
                      i === 0
                        ? "#F59E0B"
                        : i === 1
                          ? "#94A3B8"
                          : i === 2
                            ? "#92400E"
                            : "#475569",
                  }}
                >
                  {row.points}pt
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* プレーオフ構成 */}
      <section className="mb-6 animate-fade-in animate-delay-150">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          プレーオフ構成
        </h2>
        <div className="space-y-3">
          {/* ワイルドカード */}
          <div className="bg-white rounded-xl border border-[#e8dfc0] p-4 animate-slide-up">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: "linear-gradient(135deg, #0c1e42, #1a3268)", color: "#e3c060" }}
              >
                WC
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-slate-900">ワイルドカード</p>
                  <span className="text-[10px] font-bold text-white bg-slate-500 px-2 py-0.5 rounded-full">
                    9/6(金)
                  </span>
                </div>
                <p className="text-xs text-body leading-relaxed">
                  各ディビジョン5〜8位の計16チームが参加。ターボトーナメント形式で上位2チームがセミファイナルへ進出。
                </p>
              </div>
            </div>
          </div>

          {/* セミファイナル */}
          <div className="bg-white rounded-xl border border-[#e8dfc0] p-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                style={{ background: "linear-gradient(135deg, #1a3268, #2b4a8a)", color: "#e3c060" }}
              >
                SF
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-slate-900">セミファイナル</p>
                  <span className="text-[10px] font-bold text-white bg-slate-500 px-2 py-0.5 rounded-full">
                    9/7(土)
                  </span>
                </div>
                <p className="text-xs text-body leading-relaxed mb-2">
                  各ディビジョン上位4チーム＋ワイルドカード上位2チームが参加。9名になった瞬間ファイナルテーブル確定。
                </p>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">スタート スタック</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      { rank: "1位シード", stack: "400BB + ポイント分" },
                      { rank: "2位シード", stack: "350BB + ポイント分" },
                      { rank: "3位シード", stack: "300BB + ポイント分" },
                      { rank: "4位シード", stack: "250BB + ポイント分" },
                    ].map((s) => (
                      <div key={s.rank} className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">{s.rank}:</span>
                        <span className="text-[10px] font-semibold text-slate-700">{s.stack}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* THE FINAL */}
          <div
            className="rounded-xl p-4 animate-slide-up"
            style={{
              animationDelay: "120ms",
              background: "linear-gradient(135deg, #0c1e42 0%, #1a3268 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
              >
                F
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-white">THE FINAL</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}
                  >
                    9/8(日)
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  9MAX 1テーブル フリーズアウト。ファイナリスト9名が頂点を争います。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 賞金 */}
      <section className="mb-6 animate-fade-in animate-delay-200">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          賞金
        </h2>
        <div className="bg-white rounded-xl border border-[#e8dfc0] overflow-hidden">
          {PRIZE_TABLE.map((item, i) => (
            <div
              key={item.category}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-sm text-slate-700">{item.category}</span>
              <span
                className="text-base font-black tabular-nums"
                style={{ color: "#c9921e" }}
              >
                {item.prize}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 基本ルール */}
      <section className="animate-fade-in animate-delay-300">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          基本ルール
        </h2>
        <div className="space-y-3">
          {RULES_SUMMARY.map((rule, i) => (
            <div
              key={rule.title}
              className="bg-white rounded-xl border border-[#e8dfc0] p-4 flex items-start gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${rule.color}15`,
                  color: rule.color,
                }}
              >
                {rule.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">
                  {rule.title}
                </p>
                <p className="text-xs text-body leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
