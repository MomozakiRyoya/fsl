// チーム詳細ページの約束事（2026-09-28）。
//  1. 見出しの帯は紺の面。ライトでもダークでもチーム名は白で読める（白で終わる帯に濃い文字、はダークで白地に白になる）
//  2. 本文のカードは card-native。bg-white など、ダーク用の規則が無い色を本文に使わない
//  3. 見出しはホームと同じ section-rule / section-head / section-title
//  4. 順位は色だけで伝えず「N位」と書く。棒はリーグの最高点で割り、100% で止める
//  5. チームの色はダークのカードの上で見える色に寄せる（teamAccent）
//  6. 順位推移のグラフは幅に追従し、チーム数で段を切る。自チームだけ色を付ける
//  7. 定義の無い遅延クラスを使わない。絵文字を使わない
//  8. 節ごとの順位は同点を同じ順位にし、直近の結果とグラフで数え方を揃える
//  9. 見出し横の件数など、生成りの地に直に置く補足の文字は slate-700（slate-500 は 4.30 で 4.5 に届かない）
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

const EMOJI = /\p{Extended_Pictographic}/u;

// ダーク用の規則（globals.css の .dark ...）が無く、ダークで白地のまま残る・明るい文字が白地に載る色
const DARK_UNSAFE = [
  /\bbg-white\b/,
  /\bbg-gray-\d+\b/,
  /\btext-body\b/,
  /\btext-slate-(300|600)\b/,
  /\btext-gray-\d+\b/,
  /\bdivide-slate-\d+\b/,
  /border-\[#e8dfc0\]/,
];

const PAGE = "src/app/teams/[slug]/page.tsx";
const pageBody = () => {
  const src = stripComments(read(PAGE));
  // フォローボタンより後ろが本文（前は紺の帯）
  return src.slice(src.indexOf("<FollowButton"));
};

test("チーム詳細: 見出しの帯は紺の面で、チーム名は白", () => {
  const src = stripComments(read(PAGE));
  const hero = src.slice(src.indexOf("return ("), src.indexOf("<FollowButton"));
  assert.match(hero, /#0c1e42/, "帯が紺の面になっていない");
  // 白で終わる帯は、ダークで明るくなったチーム名が白地に載って読めない
  assert.doesNotMatch(src, /#ffffff 100%/);
  assert.doesNotMatch(src, /\$\{team\.homeColor\}(10|30|40)\b/);
  assert.match(src, /<h1[^>]*className="[^"]*\btext-white\b/);
  assert.doesNotMatch(src, /<h1[^>]*className="[^"]*\btext-slate-/);
});

test("チーム詳細: ぼかした円・すりガラス・ふわっとした影を使わない", () => {
  const src = stripComments(read(PAGE));
  assert.doesNotMatch(src, /\bopacity-10\b/, "背後に漂う円が残っている");
  assert.doesNotMatch(src, /backdrop-blur/);
  assert.doesNotMatch(src, /\bshadow-(sm|md|lg|xl|2xl)\b/);
  assert.doesNotMatch(src, /boxShadow/);
});

test("チーム詳細: 本文は card-native で、ダークで白地に白文字になる色を使わない", () => {
  const body = pageBody();
  assert.match(body, /\bcard-native\b/);
  for (const pattern of DARK_UNSAFE) {
    assert.doesNotMatch(body, pattern, `${pattern} が本文に残っている`);
  }
});

test("チーム詳細: 見出しはホームと同じ部品で組む", () => {
  const body = pageBody();
  assert.match(body, /className="section-rule\b/);
  assert.match(body, /className="section-head"/);
  assert.match(body, /<h2 className="section-title">/);
  // 小さな灰色の大文字見出しは、ダークのカードの外（生成りの地）で薄すぎた
  assert.doesNotMatch(body, /uppercase tracking-wider/);
});

test("チーム詳細: 順位は色だけでなく「N位」と書く", () => {
  const body = pageBody();
  assert.match(body, /\}位/);
  // 白地の上の金・琥珀の文字は 3:1 に届かない
  assert.doesNotMatch(body, /\btext-amber-\d+\b/);
});

test("チーム詳細: ラウンド別の棒はリーグの最高点で割り、100% で止める", () => {
  const src = stripComments(read(PAGE));
  assert.doesNotMatch(src, /maxPt\s*=\s*14/, "1 節の最高点を 14 と決め打ちしている");
  assert.match(src, /Math\.min\(\s*100/);
});

test("チーム詳細: チームの色は teamAccent を通して面に使う", () => {
  const src = stripComments(read(PAGE));
  assert.match(
    src,
    /import \{ teamAccent \} from "@\/components\/teams\/team-color";/,
  );
  assert.match(src, /teamAccent\(team\.homeColor\)/);
});

test("チーム詳細: 順位推移は自チームを渡し、節が無いときは出さない", () => {
  const src = stripComments(read(PAGE));
  assert.match(src, /<RankChart[\s\S]*?focusTeamId=\{team\.id\}/);
  assert.match(src, /COMPLETED_ROUNDS\.length > 0/);
});

test("チーム詳細: 定義のある遅延クラスだけを使う", () => {
  const css = read("src/app/globals.css");
  const defined = new Set(
    [...css.matchAll(/\.animate-delay-(\d+)\s*\{/g)].map((m) => m[1]),
  );
  for (const path of [PAGE, "src/components/teams/CheerComments.tsx"]) {
    const used = [...read(path).matchAll(/animate-delay-(\d+)/g)].map((m) => m[1]);
    for (const n of used) {
      assert.ok(defined.has(n), `${path}: animate-delay-${n} は globals.css に無い`);
    }
  }
});

test("チーム詳細: 絵文字を使わない", () => {
  for (const path of [
    PAGE,
    "src/components/standings/RankChart.tsx",
    "src/components/teams/CheerComments.tsx",
  ]) {
    assert.doesNotMatch(read(path), EMOJI, `${path} に絵文字がある`);
  }
});

test("team-color.ts: ダークのカードの上で沈む色は灰色に寄せる", async () => {
  const { teamAccent } = await import("../src/components/teams/team-color.ts");
  // ocean ほか 8 チームの色。#0f1a35 の上で 1.18:1 しかない
  assert.equal(teamAccent("#1e293b"), "#64748b");
  assert.equal(teamAccent("#1E293B"), "#64748b");
  assert.equal(teamAccent("#123"), "#64748b");
  assert.equal(teamAccent("#000000"), "#64748b");
});

test("team-color.ts: 見える色はそのまま返す（金はブランド色なので替えない）", async () => {
  const { teamAccent } = await import("../src/components/teams/team-color.ts");
  for (const color of ["#16a34a", "#dc2626", "#e11d48", "#c9921e", "#FFF"]) {
    assert.equal(teamAccent(color), color);
  }
});

test("team-color.ts: 読めない値は灰色に倒す", async () => {
  const { teamAccent } = await import("../src/components/teams/team-color.ts");
  for (const value of ["", "red", "#12345", "#ggg000", "16a34a", undefined, null]) {
    assert.equal(teamAccent(value), "#64748b", `${value} を読めてしまった`);
  }
});

test("rank-chart-layout.ts: 節の横位置は 8%〜92%、1 節だけなら真ん中", async () => {
  const { roundX } = await import(
    "../src/components/standings/rank-chart-layout.ts"
  );
  assert.equal(roundX(0, 1), 50);
  assert.equal(roundX(0, 0), 50);
  assert.equal(roundX(0, 2), 8);
  assert.equal(roundX(1, 2), 92);
  assert.equal(roundX(2, 5), 50);
  assert.equal(roundX(4, 5), 92);
});

test("rank-chart-layout.ts: 節ラベルは 7 個までに等間隔で間引き、最新の節は必ず出す", async () => {
  const { showRoundLabel } = await import(
    "../src/components/standings/rank-chart-layout.ts"
  );
  for (let count = 1; count <= 40; count++) {
    const shown = Array.from({ length: count }, (_, i) => i).filter((i) =>
      showRoundLabel(i, count),
    );
    assert.ok(shown.length <= 7, `${count} 節で ${shown.length} 個出る`);
    assert.ok(shown.includes(count - 1), `${count} 節で最新の節が出ない`);
    const gaps = new Set(shown.slice(1).map((v, i) => v - shown[i]));
    assert.ok(gaps.size <= 1, `${count} 節で間隔が揃っていない: ${shown}`);
    if (count <= 7) assert.equal(shown.length, count);
  }
});

test("rank-chart-layout.ts: 高さはチーム数で決まり、段の間は一定", async () => {
  const { rankY, chartHeight } = await import(
    "../src/components/standings/rank-chart-layout.ts"
  );
  const row = rankY(2) - rankY(1);
  assert.ok(row >= 16, "段が詰まりすぎている");
  assert.equal(rankY(6) - rankY(5), row);
  assert.equal(chartHeight(8) - chartHeight(6), row * 2);
  assert.ok(chartHeight(6) > rankY(6), "最下段の下に節ラベルの場所が無い");
});

test("RankChart: 幅に追従し、チーム数で段を切り、自チームだけ色を付ける", () => {
  const src = stripComments(read("src/components/standings/RankChart.tsx"));
  assert.doesNotMatch(src, /totalTeams\s*=\s*8\b/, "8 チームと決め打ちしている");
  assert.match(src, /teams\.length/);
  assert.match(src, /width="100%"/);
  assert.doesNotMatch(src, /overflow-x-auto/, "横スクロールで逃がしている");
  assert.match(src, /focusTeamId/);
  assert.match(src, /roundX\(/);
  assert.match(src, /showRoundLabel\(/);
  // 白い縁取りはダークのカードの上で白い輪になる
  assert.doesNotMatch(src, /stroke="white"/);
  assert.match(src, /role="img"/);
  // 見出しはページの section-title が持つ
  assert.doesNotMatch(src, /<h3/);
  for (const pattern of DARK_UNSAFE) {
    assert.doesNotMatch(src, pattern, `${pattern} が残っている`);
  }
});

test("応援メッセージ: 見出し・カード・ボタンをページの型に揃える", () => {
  const src = stripComments(read("src/components/teams/CheerComments.tsx"));
  // ページ側の section と入れ子にしない
  assert.doesNotMatch(src, /<section\b/);
  assert.match(src, /<h2 className="section-title">/);
  assert.match(src, /\bcard-native\b/);
  assert.match(src, /\btouch-active\b/);
  assert.doesNotMatch(src, /active:scale-/);
  assert.doesNotMatch(src, /linear-gradient/);
  // 入力欄は白地に濃い文字のまま（ダークでは globals.css が文字を濃く戻す）
  assert.equal((src.match(/bg-white text-slate-900/g) ?? []).length, 2);
  const withoutInputs = src.replace(/bg-white text-slate-900/g, "");
  for (const pattern of DARK_UNSAFE) {
    assert.doesNotMatch(withoutInputs, pattern, `${pattern} が残っている`);
  }
});

test("round-rank.ts: 同点は同じ順位（その節で上回ったチームの数 + 1）", async () => {
  const { roundRank } = await import("../src/components/teams/round-rank.ts");
  // 並べ替えで数える実装は、渡した配列を書き換えるとここで落ちる
  const standings = Object.freeze([
    { teamId: "a", roundPoints: { 1: 10, 2: 5 } },
    { teamId: "b", roundPoints: { 1: 8, 2: 5 } },
    { teamId: "c", roundPoints: { 1: 8 } },
    { teamId: "d", roundPoints: { 1: 3, 2: 9 } },
  ]);
  assert.equal(roundRank(standings, 1, "a"), 1);
  assert.equal(roundRank(standings, 1, "b"), 2);
  assert.equal(roundRank(standings, 1, "c"), 2);
  assert.equal(roundRank(standings, 1, "d"), 4);
  // 点の無い節は 0 点として数える
  assert.equal(roundRank(standings, 2, "d"), 1);
  assert.equal(roundRank(standings, 2, "a"), 2);
  assert.equal(roundRank(standings, 2, "b"), 2);
  assert.equal(roundRank(standings, 2, "c"), 4);
});

test("チーム詳細: 節ごとの順位は直近の結果とグラフで同じ数え方（roundRank）", () => {
  const src = stripComments(read(PAGE));
  assert.match(
    src,
    /import \{ roundRank \} from "@\/components\/teams\/round-rank";/,
  );
  // 直近の結果とグラフ（rankHistory）の 2 か所
  assert.ok(
    (src.match(/roundRank\(/g) ?? []).length >= 2,
    "片方だけ別の数え方をしている",
  );
  // 旧実装: グラフは並べ替えた配列の位置で同点を別の順位に割り、直近は indexOf で同点を揃えていた
  assert.doesNotMatch(src, /findIndex\(/);
  assert.doesNotMatch(src, /indexOf\(pt\)/);
});

test("チーム詳細: 地の色に直に置く補足の文字は slate-700（slate-500 では 4.5 に届かない）", () => {
  // slate-500 は白のカードの上なら 4.76 で足りるが、生成りの地（#f5f3ee）の上では 4.30
  const pale = /\btext-slate-(400|500)\b/;
  const CHEER = "src/components/teams/CheerComments.tsx";
  for (const path of [PAGE, CHEER]) {
    const heads =
      stripComments(read(path)).match(
        /<div className="section-head">[\s\S]*?<\/div>/g,
      ) ?? [];
    assert.ok(heads.length > 0, `${path} に section-head が無い`);
    for (const head of heads) {
      assert.doesNotMatch(head, pale, `${path} の見出しの横に薄い文字がある`);
    }
  }
  // 6 件目以降の「他 N 件」もカードの外に出る
  assert.doesNotMatch(
    stripComments(read(CHEER)),
    /<p className="[^"]*\btext-slate-(400|500)\b[^"]*">他 /,
  );
});
