// 下部タブバーの「今どこか」と「どこから滑ってくるか」の計算。
// 実行: npm test（node --test。Node 22.18 以降は .ts をそのまま読める）
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCurrentTab,
  originOf,
  stretchFor,
  travelOf,
} from "../src/components/layout/tabbar.ts";

const HREFS = ["/", "/standings", "/teams", "/schedule", "/mypage"];
const indexOf = (pathname) =>
  HREFS.findIndex((href) => isCurrentTab(pathname, href));

test("ホームは / のときだけ現在地になる（前方一致させると全部が光る）", () => {
  assert.equal(indexOf("/"), 0);
  assert.equal(indexOf("/news"), -1);
  assert.equal(indexOf("/live"), -1);
});

test("下の階層を開いても、持ち主のタブが現在地のまま残る", () => {
  assert.equal(indexOf("/standings"), 1);
  assert.equal(indexOf("/standings/2025"), 1);
  assert.equal(indexOf("/teams/abc"), 2);
  assert.equal(indexOf("/schedule"), 3);
  assert.equal(indexOf("/mypage/edit"), 4);
});

test("名前の先頭が同じだけの別ページは現在地にしない", () => {
  assert.equal(indexOf("/teamsx"), -1);
  assert.equal(indexOf("/my-news"), -1);
  assert.equal(indexOf("/mypagex"), -1);
});

test("伸びる量は動いた枚数で増え、3 で頭打ちになる", () => {
  assert.equal(stretchFor(0), 1);
  assert.ok(Math.abs(stretchFor(1) - 1.7) < 1e-9);
  assert.ok(Math.abs(stretchFor(2) - 2.4) < 1e-9);
  assert.equal(stretchFor(3), 3);
  assert.equal(stretchFor(4), 3);
});

test("隣へ移るときだけ動かし、向きと伸びを返す", () => {
  assert.deepEqual(travelOf(1, 3), { from: 1, dir: "forward", stretch: 2.4 });
  assert.deepEqual(travelOf(4, 0), { from: 4, dir: "backward", stretch: 3 });
});

test("出発点が無い・印の無い画面から・同じタブのままなら動かさない", () => {
  assert.equal(travelOf(null, 2), null);
  assert.equal(travelOf(-1, 2), null);
  assert.equal(travelOf(2, 2), null);
  assert.equal(travelOf(2, -1), null);
});

test("出発点は 1 つ前に描いた位置。変化が無ければ覚えている出発点を使う", () => {
  // 読み込み直後（直前が無い）
  assert.equal(originOf({ to: 2, from: null }, 2), null);
  // 順位 → チーム
  assert.equal(originOf({ to: 1, from: null }, 2), 1);
  // 描き直しの後も同じ出発点を保つ（2 回目の描画で消えない）
  assert.equal(originOf({ to: 2, from: 1 }, 2), 1);
});

test("印の無い画面を挟んでも、最後に居たタブから滑ってくる", () => {
  // 順位（1）→ ニュース（-1）→ チーム（2）
  const atNews = originOf({ to: 1, from: null }, -1);
  assert.equal(atNews, 1);
  const atTeams = originOf({ to: -1, from: atNews }, 2);
  assert.equal(atTeams, 1);
  assert.deepEqual(travelOf(atTeams, 2), {
    from: 1,
    dir: "forward",
    stretch: 1.7,
  });
});
