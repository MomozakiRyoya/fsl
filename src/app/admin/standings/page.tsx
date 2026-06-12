import { getLeagues, getStandings } from "@/lib/data";
import StandingsDownloadClient from "./StandingsDownloadClient";

export default async function AdminStandingsPage() {
  const [leagues, standings] = await Promise.all([
    getLeagues().catch(() => []),
    getStandings().catch(() => ({})),
  ]);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
          Admin
        </p>
        <h1 className="text-xl lg:text-2xl font-black text-white">
          順位表ダウンロード
        </h1>
        <p className="text-sm text-white/40 mt-1">
          各リーグの順位表をPNG画像として保存できます
        </p>
      </div>
      <StandingsDownloadClient leagues={leagues} standings={standings} />
    </div>
  );
}
