// ついでに気づいた 4 点の約束事（2026-09-28）。
//  1. チーム詳細にフォローボタンがある（5 月の 2fef473 で置き場ごと消えていた）。文字の★は使わない
//  2. チーム一覧はディビジョンの中で点数の高い順。同点は順位表と同じ並び、順位表に無いチームは末尾
//  3. アプリ追加の案内に絵文字を使わない
//  4. 節名の絵文字（DB の節名の先頭にある星）は読み出しのところで落とす。スートはディビジョンの印なので残す
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// コメントに書いた説明の中の値に引っ掛からないよう、先に落とす。
const stripComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");

// ♠♦♣♥ も含むので、スートを持つファイルには使わない
const EMOJI = /\p{Extended_Pictographic}/u;

test("チーム詳細: フォローボタンを置いている", () => {
  const page = stripComments(read("src/app/teams/[slug]/page.tsx"));
  assert.match(page, /<FollowButton\s+teamId=\{team\.id\}\s+teamName=\{team\.name\}\s*\/>/);
});

test("フォローボタン: 文字の★を使わず、読み込み前も高さを取っておく", () => {
  const src = stripComments(read("src/components/teams/FollowButton.tsx"));
  assert.doesNotMatch(src, EMOJI, "絵文字・記号の★が残っている");
  // 読み込み前に何も描かないと、読み込んだ瞬間に下の成績が 40px ほど跳ねる
  assert.doesNotMatch(src, /return null/);
  assert.match(src, /\binvisible\b/);
  assert.match(src, /\bh-11\b/, "押しやすい高さ（44px）を固定していない");
  // 押したときはほかの部品と同じばねで縮む。ふわっとした影は使わない
  assert.match(src, /\btouch-active\b/);
  assert.doesNotMatch(src, /active:scale-/);
  assert.doesNotMatch(src, /boxShadow|shadow-/);
  // フォロー中は順位表の 1 位・次節と同じ butter の面
  assert.match(src, /\bbg-butter text-on-block\b/);
  // フォロー前は紺の帯の上に置くので白の面に紺の文字。色は直に書く
  // （ink は文字色の決めでダークでは明るくなる。紺の文字が白地の上で薄灰になって読めない）
  assert.match(src, /bg-white text-\[#0c1e42\]/);
  assert.doesNotMatch(src, /\b(bg|text)-ink\b/);
  assert.match(src, /aria-hidden="true"/, "ハートのアイコンが読み上げに乗る");
});

test("team-order.ts: 点数の高い順に並べる", async () => {
  const { sortTeamsByPoints } = await import(
    "../src/components/teams/team-order.ts"
  );
  const teams = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const standings = [
    { teamId: "b", totalPoints: 30 },
    { teamId: "c", totalPoints: 20 },
    { teamId: "a", totalPoints: 10 },
  ];
  assert.deepEqual(
    sortTeamsByPoints(teams, standings).map((t) => t.id),
    ["b", "c", "a"],
  );
});

test("team-order.ts: 順位表が点数順でなくても点数で並べる", async () => {
  const { sortTeamsByPoints } = await import(
    "../src/components/teams/team-order.ts"
  );
  const teams = [{ id: "a" }, { id: "b" }];
  const standings = [
    { teamId: "a", totalPoints: 5 },
    { teamId: "b", totalPoints: 9 },
  ];
  assert.deepEqual(
    sortTeamsByPoints(teams, standings).map((t) => t.id),
    ["b", "a"],
  );
});

test("team-order.ts: 同点は順位表と同じ並び", async () => {
  const { sortTeamsByPoints } = await import(
    "../src/components/teams/team-order.ts"
  );
  const teams = [{ id: "y" }, { id: "x" }, { id: "z" }];
  const standings = [
    { teamId: "z", totalPoints: 40 },
    { teamId: "x", totalPoints: 20 },
    { teamId: "y", totalPoints: 20 },
  ];
  assert.deepEqual(
    sortTeamsByPoints(teams, standings).map((t) => t.id),
    ["z", "x", "y"],
  );
});

test("team-order.ts: 順位表に無いチームは末尾へ、元の並びのまま", async () => {
  const { sortTeamsByPoints } = await import(
    "../src/components/teams/team-order.ts"
  );
  const teams = [{ id: "n1" }, { id: "a" }, { id: "n2" }, { id: "b" }];
  const standings = [
    { teamId: "b", totalPoints: 0 },
    { teamId: "a", totalPoints: 0 },
  ];
  assert.deepEqual(
    sortTeamsByPoints(teams, standings).map((t) => t.id),
    ["b", "a", "n1", "n2"],
  );
});

test("team-order.ts: 渡した配列は書き換えず、新しい配列を返す", async () => {
  const { sortTeamsByPoints } = await import(
    "../src/components/teams/team-order.ts"
  );
  const teams = Object.freeze([{ id: "a" }, { id: "b" }]);
  const sorted = sortTeamsByPoints(teams, [
    { teamId: "b", totalPoints: 3 },
    { teamId: "a", totalPoints: 1 },
  ]);
  assert.deepEqual(
    teams.map((t) => t.id),
    ["a", "b"],
  );
  assert.notEqual(sorted, teams);
});

test("チーム一覧: ディビジョンの中を sortTeamsByPoints で並べる", () => {
  const src = stripComments(read("src/components/teams/TeamsPageClient.tsx"));
  const section = src.slice(
    src.indexOf("function LeagueSection"),
    src.indexOf("const ALL_DIVISIONS"),
  );
  assert.match(section, /sortTeamsByPoints\(\s*teams\s*,\s*standings\s*\)/);
});

test("アプリ追加の案内: 絵文字を使わない", () => {
  const src = read("src/components/pwa/InstallGuide.tsx");
  assert.doesNotMatch(src, EMOJI);
  assert.match(src, /アプリとして使おう/);
});

test("strip-emoji.ts: 節名の先頭の ⭐ を落とす", async () => {
  const { stripEmoji } = await import("../src/lib/strip-emoji.ts");
  assert.equal(
    stripEmoji("⭐FSL 第7節（合同キャプテンマッチ）"),
    "FSL 第7節（合同キャプテンマッチ）",
  );
  assert.equal(stripEmoji("⭐ FSL 第7節"), "FSL 第7節");
});

test("strip-emoji.ts: 途中の絵文字は落とし、空白は 1 つに詰める", async () => {
  const { stripEmoji } = await import("../src/lib/strip-emoji.ts");
  assert.equal(stripEmoji("FSL ⭐ 第7節"), "FSL 第7節");
  assert.equal(stripEmoji("第7節 🏆🔥"), "第7節");
  // 異体字セレクタで絵文字にした文字・肌の色・結合した絵文字・旗
  assert.equal(stripEmoji("❤️ 第1節"), "第1節");
  assert.equal(stripEmoji("👍🏽 第1節"), "第1節");
  assert.equal(stripEmoji("👨‍👩‍👧 第1節"), "第1節");
  assert.equal(stripEmoji("🇯🇵 第1節"), "第1節");
});

test("strip-emoji.ts: スート・記号・数字は残す（絵文字の指定だけ外す）", async () => {
  const { stripEmoji } = await import("../src/lib/strip-emoji.ts");
  const plain = "♠ Spade 第1節 #3 ★ © 1/2";
  assert.equal(stripEmoji(plain), plain);
  assert.equal(stripEmoji("♥️ Heart 第2節"), "♥ Heart 第2節");
  assert.equal(stripEmoji("1️⃣ 第1節"), "1 第1節");
});

test("data.ts: getRounds は節名の絵文字を落として返す", () => {
  const src = stripComments(read("src/lib/data.ts"));
  assert.match(src, /import \{ stripEmoji \} from "\.\/strip-emoji";/);
  const start = src.indexOf("export async function getRounds");
  const body = src.slice(start, src.indexOf("export async function", start + 1));
  assert.match(body, /stripEmoji\(/);
  // 読み出しの失敗は空の一覧になるので、名前が null の節 1 件で日程が全部消えないようにする
  assert.match(body, /stripEmoji\(\s*r\.name\s*\?\?\s*""\s*\)/);
});
