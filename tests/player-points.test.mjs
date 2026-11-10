// 選手ページをポーカー用にする（2026-11-10）。
// チーム詳細のメンバー一覧 → /players/[id] に飛ぶと、入力した個人ポイントが出ていなかった。
// 原因: 集計（getPlayerStats）の playerId は「選手名::チームID」なのに、
//       選手ページは players テーブルの id で探していたので、一致する行が無かった。
// あわせてサッカー用のひな型（得点・アシスト・MVP・背番号）をやめ、
// 個人ポイントの記録（player_results）から直接まとめる。
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { summarizePlayerSeason } from "../src/lib/player-season.ts";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const rounds = [
  { id: "r1", name: "第1節", roundNumber: 1, date: "2026-10-01" },
  { id: "r2", name: "第2節", roundNumber: 2, date: "2026-10-15" },
  { id: "r3", name: "第3節", roundNumber: 3, date: "2026-11-01" },
];

const rows = [
  { round_id: "r2", player_name: "Taro", team_id: "bon", rank: 1, points: 12 },
  { round_id: "r1", player_name: "Taro", team_id: "bon", rank: 3, points: 5 },
  { round_id: "r1", player_name: "Taro", team_id: "joker", rank: 1, points: 99 },
  { round_id: "r1", player_name: "Hanako", team_id: "bon", rank: 3, points: 7 },
  { round_id: "r3", player_name: " taro ", team_id: "bon", rank: 2, points: 0 },
];

test("選手名とチームで自分の記録だけを集める（同名の別チーム・他の選手は入れない）", () => {
  const s = summarizePlayerSeason(rows, rounds, { name: "Taro", teamId: "bon" });
  assert.equal(s.totalPoints, 17);
  assert.equal(s.roundsPlayed, 3);
});

test("名前の大文字小文字・前後の空白は同じ選手とみなす（マイページの ilike と揃える）", () => {
  const s = summarizePlayerSeason(rows, rounds, { name: "TARO", teamId: "bon" });
  assert.equal(s.roundsPlayed, 3);
});

test("平均と最高は節ごとの個人ポイントから出す（0pt の節も出場に数える）", () => {
  const s = summarizePlayerSeason(rows, rounds, { name: "Taro", teamId: "bon" });
  assert.equal(s.averagePoints, 5.7);
  assert.equal(s.bestPoints, 12);
});

test("節ごとの成績は節の順に並べ、節名・日付・チーム順位を付ける", () => {
  const s = summarizePlayerSeason(rows, rounds, { name: "Taro", teamId: "bon" });
  assert.deepEqual(
    s.history.map((h) => [h.roundName, h.date, h.teamRank, h.points]),
    [
      ["第1節", "2026-10-01", 3, 5],
      ["第2節", "2026-10-15", 1, 12],
      ["第3節", "2026-11-01", 2, 0],
    ],
  );
});

test("記録が無ければ 0 件（平均・最高は null）", () => {
  const s = summarizePlayerSeason(rows, rounds, { name: "Jiro", teamId: "bon" });
  assert.equal(s.roundsPlayed, 0);
  assert.equal(s.averagePoints, null);
  assert.equal(s.bestPoints, null);
});

test("選手ページはポーカー用の項目だけを出す", () => {
  const src = read("src/app/players/[id]/page.tsx");
  assert.ok(src.includes("summarizePlayerSeason("), "個人ポイントの記録からまとめる");
  assert.ok(!src.includes("s.playerId === id"), "集計の playerId と players の id を比べない");
  for (const label of ["合計ポイント", "出場節数", "平均ポイント", "最高ポイント", "節ごとの成績"]) {
    assert.ok(src.includes(label), `${label} を出す`);
  }
  for (const soccer of ["得点", "アシスト", "MVP", "背番号", "player.number", "Division 1", "🏆"]) {
    assert.ok(!src.includes(soccer), `${soccer} を出さない`);
  }
});

// ホームの個人ランキングは service role で player_results を読んでいる。
// 選手ページだけ一般の接続（RLS がかかる）で読むと行が欠け、ホームと合計が食い違った
test("選手ページの個人ポイントは、ホームのランキングと同じ管理者用の接続で読む", () => {
  const src = read("src/lib/supabase/player-results.ts");
  assert.ok(src.includes("SUPABASE_SERVICE_ROLE_KEY"), "service role で読む");
  assert.ok(!src.includes('from "./server"'), "RLS がかかる接続を使わない");
  assert.ok(
    src.includes('.select("round_id, player_name, team_id, rank, points")'),
    "必要な列だけを読む",
  );
});

test("チーム詳細のメンバー一覧は、写真が無いとき背番号ではなく頭文字を出す", () => {
  const src = read("src/app/teams/[slug]/page.tsx");
  assert.ok(!src.includes("{player.number}"), "背番号を出さない");
});
