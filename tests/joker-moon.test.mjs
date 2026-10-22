// ジョーカーの印は月（2026-10-22）。
// ♠♦♣♥ と同じく文字色 1 色の塗りつぶしで描く。
//  - 色つきの絵文字 🌙 は他のスートと揃わない
//  - 文字の ☾ は細い線の形で出て、塗りつぶしのスートより弱く見える
// なので月だけは図形（MoonIcon）で描く。
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("チーム一覧: ジョーカーのチップは月の図形で、読み上げは「ジョーカー」", () => {
  const src = read("src/components/teams/TeamsPageClient.tsx");
  const list = src.slice(
    src.indexOf("const ALL_DIVISIONS"),
    src.indexOf("];", src.indexOf("const ALL_DIVISIONS")),
  );
  assert.match(
    list,
    /\{ key: "joker", label: <MoonIcon \/>, ariaLabel: "ジョーカー" \}/,
  );
  assert.doesNotMatch(list, /"JK"/);
  assert.doesNotMatch(list, /🌙|☾|☽/);
  assert.match(src, /import MoonIcon from "@\/components\/ui\/MoonIcon";/);
});

test("MoonIcon: 文字色 1 色の塗りつぶしで、文字の大きさに合わせて伸び縮みする", () => {
  const src = read("src/components/ui/MoonIcon.tsx");
  assert.match(src, /fill="currentColor"/);
  assert.doesNotMatch(src, /stroke=/);
  // 隣のスート（文字）と同じ大きさに見えるよう em で決める
  assert.match(src, /w-\[0\.8em\] h-\[0\.8em\]/);
  // 読み上げ名はチップ側（ariaLabel）が持つ
  assert.match(src, /aria-hidden="true"/);
  // 説明に ♠♦♣♥ を書いているので、絵文字全般ではなく月の絵文字だけを見る
  assert.doesNotMatch(src, /🌙/u);
});
