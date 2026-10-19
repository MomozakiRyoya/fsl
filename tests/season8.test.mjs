// Season 8 の切り替えの約束事（2026-10-20）。
//  1. 5つ目のレギュラー「ジョーカー（joker）」を、リーグを並べる・名前を引く箇所すべてに入れる
//  2. 公開画面の見出しと共有文は Season 8
//  3. ポイント表は label がある行だけ「10〜12位」「3-0 勝ち」のように順位の言い方を変える
//  4. ポイント表をつなぐためだけのストラクチャー（ブラインド未設定）は出さない
//  5. 順位表には現役のチームだけを並べる（Season 7 で抜けたチームは is_active=false）
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const stripComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const LEAGUE_LISTS = [
  "src/components/standings/StandingsPageClient.tsx",
  "src/components/home/MatchCountdown.tsx",
  "src/components/teams/TeamsPageClient.tsx",
  "src/app/admin/schedule/ScheduleAdminClient.tsx",
  "src/app/admin/teams/TeamsAdminClient.tsx",
  "src/app/admin/players/PlayersAdminClient.tsx",
  "src/app/admin/structures/StructuresAdminClient.tsx",
  "src/app/admin/standings/StandingsDownloadClient.tsx",
];

test("ジョーカー: リーグを並べる・名前を引く箇所すべてに joker がある", () => {
  for (const path of LEAGUE_LISTS) {
    const src = stripComments(read(path));
    assert.match(src, /["']?joker["']?\s*[:,\]]|key:\s*"joker"|value:\s*"joker"/, path);
  }
});

const SEASON_PAGES = [
  "src/components/standings/StandingsPageClient.tsx",
  "src/components/teams/TeamsPageClient.tsx",
  "src/app/players/page.tsx",
  "src/app/fan-ranking/RankingPageClient.tsx",
  "src/components/compare/ComparePageClient.tsx",
  "src/app/teams/[slug]/page.tsx",
  "src/app/info/page.tsx",
];

test("公開画面の見出しと共有文は Season 8", () => {
  for (const path of SEASON_PAGES) {
    const src = stripComments(read(path));
    assert.doesNotMatch(src, /Season\s+7/, path);
    assert.match(src, /Season\s+8/, path);
  }
});

test("案内ページの数字は Season 8（46チーム・プレミア20節・レギュラー16節）", () => {
  const src = stripComments(read("src/app/info/page.tsx"));
  assert.match(src, /value:\s*"46"/);
  assert.match(src, /value:\s*"20 \/ 16"/);
  assert.doesNotMatch(src, /value:\s*"48"/);
});

test("ポイント表: label がある行は label、無い行は「N位」", () => {
  for (const path of [
    "src/app/schedule/[roundId]/page.tsx",
    "src/app/admin/point-templates/PointTemplatesAdminClient.tsx",
  ]) {
    const src = stripComments(read(path));
    assert.match(src, /label\?:\s*string/, path);
    assert.match(src, /p\.label\s*\?\?\s*`\$\{p\.rank\}位`/, path);
  }
});

test("ポイント表: 0pt 以下の行は上位でも金色にしない（総当たりの「0-3 負け」など）", () => {
  const src = stripComments(read("src/app/schedule/[roundId]/page.tsx"));
  assert.match(src, /p\.rank\s*<=\s*3\s*&&\s*p\.pts\s*>\s*0/);
});

test("ブラインド未設定のストラクチャーは出さない", () => {
  const src = stripComments(read("src/app/schedule/[roundId]/page.tsx"));
  assert.match(
    src,
    /structure\s*&&\s*structure\.levels\.length\s*>\s*0\s*&&\s*\(?\s*<StructureTable/,
  );
});

test("順位表は現役のチームだけ（is_active=true）", () => {
  const src = stripComments(read("src/lib/supabase/queries.ts"));
  const fn = src.slice(src.indexOf("fetchStandingsFromSupabase"));
  const teamsQuery = fn.slice(0, fn.indexOf('.from("matches")'));
  assert.match(teamsQuery, /\.eq\("is_active",\s*true\)/);
});
