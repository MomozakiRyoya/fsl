import { getTeams, getRounds, getNews, getPlayers } from "@/lib/data";

export default async function DashboardPage() {
  const [teams, rounds, news, players] = await Promise.all([
    getTeams().catch(() => []),
    getRounds().catch(() => []),
    getNews().catch(() => []),
    getPlayers().catch(() => []),
  ]);

  const nextRound = rounds.find((r) => r.status === "next");
  const publishedNews = news.filter((n) => n.isPublished);

  const stats = [
    { label: "チーム数", value: teams.length, sub: "登録済み" },
    { label: "節数", value: rounds.length, sub: "全節" },
    { label: "選手数", value: players.length, sub: "登録済み" },
    { label: "ニュース", value: publishedNews.length, sub: "公開中" },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
          Admin
        </p>
        <h1 className="text-xl lg:text-2xl font-black text-white">
          ダッシュボード
        </h1>
      </div>

      {/* Stats grid: 2cols on mobile, 4cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {stats.map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl p-4 lg:p-5 border border-white/8"
            style={{ background: "#0c1e42" }}
          >
            <p className="text-2xl lg:text-3xl font-black text-white mb-1">
              {value}
            </p>
            <p className="text-sm font-semibold text-white/70">{label}</p>
            <p className="text-xs text-white/30 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {nextRound && (
        <div
          className="rounded-xl p-4 lg:p-5 border border-white/8 mb-4 lg:mb-6"
          style={{ background: "#0c1e42" }}
        >
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
            次節
          </p>
          <p className="text-base lg:text-lg font-bold text-white">
            {nextRound.name}
          </p>
          <p className="text-sm text-white/50 mt-1">
            {nextRound.date} · {nextRound.venue}
          </p>
        </div>
      )}

      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        <div className="px-4 lg:px-5 py-4 border-b border-white/8 flex justify-between items-center">
          <p className="text-sm font-semibold text-white">最新ニュース</p>
          <a
            href="/admin/news"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            すべて見る →
          </a>
        </div>
        {news.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="px-4 lg:px-5 py-3 border-b border-white/5 flex items-start lg:items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{item.title}</p>
              <p className="text-xs text-white/30 mt-0.5">{item.publishedAt}</p>
            </div>
            <span
              className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                item.isPublished
                  ? "bg-emerald-900/50 text-emerald-400"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {item.isPublished ? "公開" : "非公開"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
