"use client";

const ROUND4_RESULTS = [
  { rank: 1, team: "BON", points: 187 },
  { rank: 2, team: "TRUMP", points: 160 },
  { rank: 3, team: "SuperNova", points: 136 },
];

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

const SHARE_TEXT = `【FSL Season 1 Premier League 現在の順位】
🥇 BON 187pt
🥈 TRUMP 160pt
🥉 SuperNova 136pt
#FSL #福岡スーパーリーグ #ポーカー`;

const SHARE_URL = "https://fsl-gilt.vercel.app";

export default function ShareResultCard() {
  const handleShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="animate-spring-in">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="section-title">Premier League 順位</p>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "#c9921e" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
      </div>

      {/* カード */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c1e42, #1a3a7a)" }}
      >
        <div className="px-4 pt-4 pb-5">
          {/* タイトル */}
          <p
            className="text-base font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #c9921e, #f0d060)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Premier League 現在の順位
          </p>

          {/* 上位3チーム */}
          <div className="space-y-2.5 mb-4">
            {ROUND4_RESULTS.map(({ rank, team, points }) => (
              <div key={rank} className="flex items-center gap-3">
                <span className="text-lg leading-none w-6 text-center">
                  {RANK_MEDALS[rank - 1]}
                </span>
                <div
                  className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <span className="text-sm font-semibold text-white">
                    {team}
                  </span>
                  <span
                    className="tabular-nums font-black text-sm"
                    style={{ color: "#e3c060" }}
                  >
                    {points}
                    <span className="text-xs font-bold ml-0.5">pt</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* シェアボタン */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
            style={{ background: "#000000", color: "#ffffff" }}
            aria-label="Xで試合結果をシェアする"
          >
            {/* X (旧Twitter) アイコン */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでシェア
          </button>
        </div>
      </div>
    </section>
  );
}
