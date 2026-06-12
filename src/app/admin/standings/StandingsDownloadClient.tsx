"use client";

import { useRef, useState, useCallback } from "react";
import type { League, TeamStanding } from "@/lib/types/app";

const LEAGUE_SHORT: Record<string, string> = {
  premier: "プレミアリーグ",
  spade: "スペードリーグ",
  heart: "ハートリーグ",
  diamond: "ダイヤリーグ",
  club: "クローバーリーグ",
};

const CANVAS_WIDTH = 750;
const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 120;
const FOOTER_HEIGHT = 40;

function rankColor(rank: number): string {
  if (rank === 1) return "#c9921e";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#b45309";
  return "#334155";
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function drawStandingsToCanvas(
  canvas: HTMLCanvasElement,
  standings: TeamStanding[],
  leagueId: string,
  leagueColor: string,
): Promise<void> {
  const canvasHeight =
    HEADER_HEIGHT + ROW_HEIGHT * standings.length + FOOTER_HEIGHT + 24;
  canvas.width = CANVAS_WIDTH;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // --- 背景 ---
  ctx.fillStyle = "#060b14";
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

  // ヘッダー背景
  const headerGrad = ctx.createLinearGradient(
    0,
    0,
    CANVAS_WIDTH,
    HEADER_HEIGHT,
  );
  headerGrad.addColorStop(0, "#0c1e42");
  headerGrad.addColorStop(1, "#1a3268");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HEADER_HEIGHT);

  // ヘッダー下ボーダー
  ctx.fillStyle = leagueColor;
  ctx.fillRect(0, HEADER_HEIGHT - 3, CANVAS_WIDTH, 3);

  // FSL タイトル
  ctx.font = "bold 13px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.letterSpacing = "3px";
  ctx.fillText("FUKUOKA SUPER LEAGUE", 36, 42);
  ctx.letterSpacing = "0px";

  ctx.font = "bold 34px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("STANDINGS", 36, 84);

  // リーグ名バッジ
  const leagueName = LEAGUE_SHORT[leagueId] ?? leagueId;
  ctx.font = "bold 13px 'Helvetica Neue', Arial, sans-serif";
  const badgeMetrics = ctx.measureText(leagueName);
  const badgeW = badgeMetrics.width + 24;
  const badgeX = CANVAS_WIDTH - badgeW - 32;
  const badgeY = 52;

  ctx.fillStyle = leagueColor;
  roundRect(ctx, badgeX, badgeY, badgeW, 28, 14);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(leagueName, badgeX + badgeW / 2, badgeY + 18);
  ctx.textAlign = "left";

  // --- テーブルヘッダー行 ---
  const tableTop = HEADER_HEIGHT + 4;
  ctx.fillStyle = "#0c1e42";
  ctx.fillRect(0, tableTop, CANVAS_WIDTH, 36);

  ctx.font = "bold 11px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.textAlign = "center";
  ctx.fillText("#", 52, tableTop + 23);
  ctx.textAlign = "left";
  ctx.fillText("チーム", 110, tableTop + 23);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL PT", CANVAS_WIDTH - 36, tableTop + 23);
  ctx.textAlign = "left";

  // --- ロゴ画像を並列プリロード ---
  const logoImages = await Promise.all(
    standings.map((team) =>
      team.teamLogoUrl ? loadImage(team.teamLogoUrl) : Promise.resolve(null),
    ),
  );

  // --- 各行 ---
  const rowsTop = tableTop + 36;

  for (let i = 0; i < standings.length; i++) {
    const team = standings[i];
    const y = rowsTop + i * ROW_HEIGHT;

    // 行背景
    if (team.rank === 1) {
      ctx.fillStyle = "rgba(201,146,30,0.10)";
    } else if (i % 2 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.025)";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(0, y, CANVAS_WIDTH, ROW_HEIGHT);

    // 左ボーダー
    if (team.rank === 1) {
      ctx.fillStyle = "rgba(201,146,30,0.7)";
    } else if (team.rank <= 3 && leagueId === "premier") {
      ctx.fillStyle = "rgba(34,197,94,0.5)";
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
    }
    ctx.fillRect(0, y, 3, ROW_HEIGHT);

    // 区切り線
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, y + ROW_HEIGHT - 1, CANVAS_WIDTH, 1);

    // 順位バッジ
    const rankBadgeR = 16;
    const rankBadgeCx = 52;
    const rankBadgeCy = y + ROW_HEIGHT / 2;

    ctx.beginPath();
    ctx.arc(rankBadgeCx, rankBadgeCy, rankBadgeR, 0, Math.PI * 2);
    if (team.rank === 1) {
      const g = ctx.createLinearGradient(
        rankBadgeCx - rankBadgeR,
        rankBadgeCy - rankBadgeR,
        rankBadgeCx + rankBadgeR,
        rankBadgeCy + rankBadgeR,
      );
      g.addColorStop(0, "#c9921e");
      g.addColorStop(1, "#e3c060");
      ctx.fillStyle = g;
    } else if (team.rank === 2) {
      ctx.fillStyle = "#94a3b8";
    } else if (team.rank === 3) {
      ctx.fillStyle = "#b45309";
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
    }
    ctx.fill();

    ctx.font = `bold ${team.rank <= 3 ? 14 : 13}px 'Helvetica Neue', Arial, sans-serif`;
    ctx.fillStyle =
      team.rank <= 3
        ? team.rank === 1
          ? "#0c1e42"
          : "#ffffff"
        : "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(String(team.rank), rankBadgeCx, rankBadgeCy + 5);
    ctx.textAlign = "left";

    // チームロゴ
    const logoSize = 36;
    const logoX = 84;
    const logoY = y + ROW_HEIGHT / 2 - logoSize / 2;
    const logoCx = logoX + logoSize / 2;
    const logoCy = logoY + logoSize / 2;

    // 円形クリッピングパスを設定
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoCx, logoCy, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const logoImg = logoImages[i];
    if (logoImg) {
      // ロゴ画像を円形に描画
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    } else {
      // フォールバック: イニシャル
      ctx.fillStyle = leagueColor + "33";
      ctx.fillRect(logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // イニシャルテキスト（クリップ外に戻してから描画）
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoCx, logoCy, logoSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = leagueColor + "66";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const initials = team.teamName
        .replace(/\s+/g, "")
        .slice(0, 2)
        .toUpperCase();
      ctx.font = "bold 11px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillStyle = leagueColor;
      ctx.textAlign = "center";
      ctx.fillText(initials, logoCx, logoCy + 4);
      ctx.textAlign = "left";
    }

    ctx.restore();

    // チーム名
    ctx.font = `${team.rank <= 3 ? "bold" : "normal"} 16px 'Helvetica Neue', Arial, sans-serif`;
    ctx.fillStyle = team.rank === 1 ? "#f0c55a" : "#e2e8f0";
    ctx.fillText(team.teamName, 132, y + ROW_HEIGHT / 2 + 6);

    // ポイント
    ctx.font = "bold 20px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = team.rank <= 3 ? rankColor(team.rank) : "#94a3b8";
    ctx.textAlign = "right";
    ctx.fillText(
      String(team.totalPoints),
      CANVAS_WIDTH - 36,
      y + ROW_HEIGHT / 2 + 7,
    );

    // "PT" ラベル
    ctx.font = "10px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText("PT", CANVAS_WIDTH - 36, y + ROW_HEIGHT / 2 + 19);
    ctx.textAlign = "left";
  }

  // --- フッター ---
  const footerY = rowsTop + standings.length * ROW_HEIGHT + 8;
  ctx.font = "11px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.textAlign = "right";
  ctx.fillText("Fukuoka Super League", CANVAS_WIDTH - 36, footerY + 20);
  ctx.textAlign = "left";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

interface Props {
  leagues: League[];
  standings: Record<string, TeamStanding[]>;
}

export default function StandingsDownloadClient({ leagues, standings }: Props) {
  const [activeLeague, setActiveLeague] = useState<string>(
    leagues[0]?.id ?? "premier",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLeague = leagues.find((l) => l.id === activeLeague);
  const currentStandings = standings[activeLeague] ?? [];

  const handleGenerate = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    setPreviewUrl(null);

    try {
      await drawStandingsToCanvas(
        canvasRef.current,
        currentStandings,
        activeLeague,
        currentLeague?.color ?? "#2b70ef",
      );
      const url = canvasRef.current.toDataURL("image/png");
      setPreviewUrl(url);
    } finally {
      setIsGenerating(false);
    }
  }, [currentStandings, activeLeague, currentLeague]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    const leagueName = LEAGUE_SHORT[activeLeague] ?? activeLeague;
    a.href = previewUrl;
    a.download = `fsl-standings-${activeLeague}.png`;
    a.click();
  }, [previewUrl, activeLeague]);

  return (
    <div className="max-w-2xl">
      {/* リーグ選択 */}
      <div
        className="rounded-xl border border-white/8 p-4 mb-4"
        style={{ background: "#0c1e42" }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
          リーグを選択
        </p>
        <div className="flex flex-wrap gap-2">
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => {
                setActiveLeague(league.id);
                setPreviewUrl(null);
              }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={
                activeLeague === league.id
                  ? {
                      background: league.color,
                      color: "#fff",
                      boxShadow: `0 0 12px ${league.color}55`,
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                    }
              }
            >
              {LEAGUE_SHORT[league.id] ?? league.name}
            </button>
          ))}
        </div>
      </div>

      {/* 現在の選手数表示 */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-xs text-white/30">チーム数:</span>
        <span className="text-xs font-semibold text-white/60">
          {currentStandings.length}チーム
        </span>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || currentStandings.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "#e3c060", color: "#0c1e42" }}
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              生成中...
            </>
          ) : (
            "プレビューを生成"
          )}
        </button>

        {previewUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 transition-colors text-white"
          >
            PNGダウンロード
          </button>
        )}
      </div>

      {/* プレビュー */}
      {previewUrl && (
        <div
          className="rounded-xl border border-white/8 overflow-hidden"
          style={{ background: "#0c1e42" }}
        >
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <p className="text-xs font-semibold text-white/60">プレビュー</p>
            <p className="text-xs text-white/30">750px 幅</p>
          </div>
          <div className="p-4">
            <img
              src={previewUrl}
              alt="順位表プレビュー"
              className="w-full rounded-lg"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>
      )}

      {/* hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
