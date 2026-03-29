/**
 * Google スプレッドシートにモックデータを一括投入するスクリプト
 * 使い方: npx tsx scripts/populate-sheets.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// .env.local を読み込み
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  MOCK_LEAGUES,
  MOCK_TEAMS,
  MOCK_ROUNDS,
  MOCK_STANDINGS,
  MOCK_MATCH_RESULTS,
  MOCK_PLAYERS,
  MOCK_PLAYER_STATS,
  MOCK_NEWS,
  MOCK_MVP_CANDIDATES,
  MOCK_HEAD_TO_HEAD,
} from "../src/lib/mock-data";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL!;
const RAW_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY!;
const PRIVATE_KEY = RAW_KEY.replace(/\\n/g, "\n");

async function getDoc(): Promise<GoogleSpreadsheet> {
  const auth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  return doc;
}

async function clearAndPopulate<T extends Record<string, unknown>>(
  doc: GoogleSpreadsheet,
  title: string,
  headers: string[],
  rows: T[],
) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title, headerValues: headers });
    console.log(`  ✅ シート "${title}" を作成`);
  } else {
    await sheet.clearRows();
    await sheet.setHeaderRow(headers);
    console.log(`  🔄 シート "${title}" をクリア`);
  }
  if (rows.length > 0) {
    await sheet.addRows(rows as Record<string, string | number | boolean>[]);
  }
  console.log(`  📝 ${rows.length} 行を追加`);
}

async function main() {
  console.log("🚀 Google Sheets へのデータ投入を開始...\n");

  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("❌ 環境変数が設定されていません");
    process.exit(1);
  }

  const doc = await getDoc();
  console.log(`📊 スプレッドシート: ${doc.title}\n`);

  // ── リーグ ─────────────────────────────────────────────────────────────────
  console.log("リーグ ...");
  await clearAndPopulate(
    doc,
    "リーグ",
    [
      "ID",
      "リーグ名",
      "スラッグ",
      "シーズンID",
      "表示順",
      "カラー",
      "説明",
      "最大チーム数",
    ],
    MOCK_LEAGUES.map((l) => ({
      ID: l.id,
      リーグ名: l.name,
      スラッグ: l.slug,
      シーズンID: l.seasonId,
      表示順: l.order,
      カラー: l.color,
      説明: l.description,
      最大チーム数: l.maxTeams,
    })),
  );

  // ── チーム ─────────────────────────────────────────────────────────────────
  console.log("チーム ...");
  await clearAndPopulate(
    doc,
    "チーム",
    [
      "ID",
      "チーム名",
      "スラッグ",
      "リーグID",
      "リーグ名",
      "ロゴURL",
      "ホームカラー",
      "キャプテン",
      "説明",
      "TwitterURL",
      "InstagramURL",
      "公開中",
    ],
    MOCK_TEAMS.map((t) => ({
      ID: t.id,
      チーム名: t.name,
      スラッグ: t.slug,
      リーグID: t.leagueId,
      リーグ名: t.leagueName,
      ロゴURL: t.logoUrl ?? "",
      ホームカラー: t.homeColor,
      キャプテン: t.captainName,
      説明: t.description,
      TwitterURL: t.twitterUrl ?? "",
      InstagramURL: t.instagramUrl ?? "",
      公開中: t.isActive ? "TRUE" : "FALSE",
    })),
  );

  // ── 節 ────────────────────────────────────────────────────────────────────
  console.log("節 ...");
  await clearAndPopulate(
    doc,
    "節",
    [
      "ID",
      "節名",
      "リーグID",
      "リーグ名",
      "節番号",
      "開催日",
      "会場",
      "会場URL",
      "状態",
      "プレーオフ",
    ],
    MOCK_ROUNDS.map((r) => ({
      ID: r.id,
      節名: r.name,
      リーグID: r.leagueId,
      リーグ名: r.leagueName,
      節番号: r.roundNumber,
      開催日: r.date,
      会場: r.venue,
      会場URL: r.venueUrl ?? "",
      状態: r.status,
      プレーオフ: r.isPlayoff ? "TRUE" : "FALSE",
    })),
  );

  // ── 順位表 ─────────────────────────────────────────────────────────────────
  console.log("順位表 ...");
  const standingRows: Record<string, string | number>[] = [];
  for (const [leagueId, leagueStandings] of Object.entries(MOCK_STANDINGS)) {
    for (const s of leagueStandings) {
      standingRows.push({
        リーグID: leagueId,
        順位: s.rank,
        チームID: s.teamId,
        チーム名: s.teamName,
        ロゴURL: s.teamLogoUrl ?? "",
        合計pt: s.totalPoints,
        節別pt: JSON.stringify(s.roundPoints),
      });
    }
  }
  await clearAndPopulate(
    doc,
    "順位表",
    ["リーグID", "順位", "チームID", "チーム名", "ロゴURL", "合計pt", "節別pt"],
    standingRows,
  );

  // ── 試合結果 ───────────────────────────────────────────────────────────────
  console.log("試合結果 ...");
  const matchResultRows: Record<string, string | number>[] = [];
  for (const mr of MOCK_MATCH_RESULTS) {
    for (const result of mr.results) {
      matchResultRows.push({
        節ID: mr.roundId,
        順位: result.rank,
        チームID: result.teamId,
        チーム名: result.teamName,
        得点pt: result.points,
      });
    }
  }
  await clearAndPopulate(
    doc,
    "試合結果",
    ["節ID", "順位", "チームID", "チーム名", "得点pt"],
    matchResultRows,
  );

  // ── 選手 ───────────────────────────────────────────────────────────────────
  console.log("選手 ...");
  await clearAndPopulate(
    doc,
    "選手",
    ["ID", "選手名", "チームID", "チーム名", "リーグID", "背番号"],
    MOCK_PLAYERS.map((p) => ({
      ID: p.id,
      選手名: p.name,
      チームID: p.teamId,
      チーム名: p.teamName,
      リーグID: p.leagueId,
      背番号: p.number,
    })),
  );

  // ── 選手成績 ───────────────────────────────────────────────────────────────
  console.log("選手成績 ...");
  await clearAndPopulate(
    doc,
    "選手成績",
    [
      "選手ID",
      "選手名",
      "チームID",
      "チーム名",
      "リーグID",
      "ゴール",
      "アシスト",
      "試合数",
      "MVP数",
    ],
    MOCK_PLAYER_STATS.map((s) => ({
      選手ID: s.playerId,
      選手名: s.playerName,
      チームID: s.teamId,
      チーム名: s.teamName,
      リーグID: s.leagueId,
      ゴール: s.goals,
      アシスト: s.assists,
      試合数: s.games,
      MVP数: s.mvpCount,
    })),
  );

  // ── ニュース ───────────────────────────────────────────────────────────────
  console.log("ニュース ...");
  await clearAndPopulate(
    doc,
    "ニュース",
    [
      "ID",
      "タイトル",
      "スラッグ",
      "カテゴリ",
      "公開日",
      "サムネイルURL",
      "本文",
      "公開中",
      "シーズンID",
    ],
    MOCK_NEWS.map((n) => ({
      ID: n.id,
      タイトル: n.title,
      スラッグ: n.slug,
      カテゴリ: n.category,
      公開日: n.publishedAt,
      サムネイルURL: n.thumbnailUrl ?? "",
      本文: n.body,
      公開中: n.isPublished ? "TRUE" : "FALSE",
      シーズンID: n.seasonId,
    })),
  );

  // ── MVP候補 ────────────────────────────────────────────────────────────────
  console.log("MVP候補 ...");
  await clearAndPopulate(
    doc,
    "MVP候補",
    ["選手ID", "選手名", "チーム名", "節ID"],
    MOCK_MVP_CANDIDATES.map((m) => ({
      選手ID: m.playerId,
      選手名: m.playerName,
      チーム名: m.teamName,
      節ID: m.roundId,
    })),
  );

  // ── 対戦成績 ───────────────────────────────────────────────────────────────
  console.log("対戦成績 ...");
  await clearAndPopulate(
    doc,
    "対戦成績",
    [
      "チームAのID",
      "チームBのID",
      "チームA",
      "チームB",
      "勝",
      "分",
      "負",
      "チームA得点",
      "チームB得点",
    ],
    MOCK_HEAD_TO_HEAD.map((h) => ({
      チームAのID: h.teamAId,
      チームBのID: h.teamBId,
      チームA: h.teamAName,
      チームB: h.teamBName,
      勝: h.wins,
      分: h.draws,
      負: h.losses,
      チームA得点: h.teamAGoals,
      チームB得点: h.teamBGoals,
    })),
  );

  console.log("\n✅ 全データの投入が完了しました！");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
