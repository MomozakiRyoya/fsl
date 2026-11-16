// 出場選手登録一覧（/admin/roster）で以前の登録を削除できない（2026-11-16）。
// 原因: 一覧には「編集」しか無く、削除の操作も削除用の API も無かった。
//       Season 8 への切り替えで rounds は消したが rosters は残したので、
//       過去シーズンの登録が節名の出ない行として並び、今シーズンの登録と重複して見えた。
//  1. 節の一覧に無い節を指す登録を「過去シーズンの残り」と判定する（純粋関数）
//  2. 削除 API は管理者確認 → service role で id 指定の削除
//  3. 一覧に行ごとの削除と、過去シーズン分のまとめて削除がある
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const url = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => (existsSync(url(path)) ? readFileSync(url(path), "utf8") : "");

const LIB = "src/lib/roster-admin.ts";
const ROUTE = "src/app/api/admin/rosters/route.ts";
const CLIENT = "src/app/admin/roster/RosterAdminClient.tsx";

const lib = existsSync(url(LIB)) ? await import(`../${LIB}`) : {};

const rosters = [
  { id: "a", round_id: "s8-premier-1" },
  { id: "b", round_id: "premier-r3" },
  { id: "c", round_id: "s8-premier-2" },
  { id: "d", round_id: "" },
];

test("節の一覧に無い節を指す登録を過去シーズンの残りと判定する", () => {
  assert.equal(typeof lib.findStaleRosters, "function", `${LIB} に findStaleRosters が無い`);
  const stale = lib.findStaleRosters(rosters, ["s8-premier-1", "s8-premier-2"]);
  assert.deepEqual(stale.map((r) => r.id), ["b", "d"]);
});

test("節の一覧が空（取得に失敗した）ときは 1 件も過去分と判定しない", () => {
  // 空の一覧で判定すると全件が「過去分」になり、まとめて削除で今シーズンの登録まで消える
  assert.equal(typeof lib.findStaleRosters, "function");
  assert.deepEqual(lib.findStaleRosters(rosters, []), []);
});

test("元の配列を書き換えない", () => {
  assert.equal(typeof lib.findStaleRosters, "function");
  const before = JSON.stringify(rosters);
  lib.findStaleRosters(rosters, ["s8-premier-1"]);
  assert.equal(JSON.stringify(rosters), before);
});

test("削除する id の一覧を検証する", () => {
  assert.equal(typeof lib.parseDeleteIds, "function", `${LIB} に parseDeleteIds が無い`);
  assert.deepEqual(lib.parseDeleteIds({ ids: ["a", "b"] }), ["a", "b"]);
  // id が数値の表でも通す。重複はまとめる
  assert.deepEqual(lib.parseDeleteIds({ ids: [3, 3, 7] }), [3, 7]);

  for (const bad of [
    null,
    "a",
    [],
    {},
    { ids: "a" },
    { ids: [] },
    { ids: [""] },
    { ids: ["a", null] },
    { ids: [{ id: "a" }] },
    { ids: [Number.NaN] },
    { ids: [1.5] },
  ]) {
    assert.equal(lib.parseDeleteIds(bad), null, JSON.stringify(bad));
  }
});

test("一度に消せる件数に上限がある", () => {
  assert.equal(typeof lib.parseDeleteIds, "function");
  assert.equal(typeof lib.MAX_DELETE_IDS, "number");
  const many = Array.from({ length: lib.MAX_DELETE_IDS + 1 }, (_, i) => `r${i}`);
  assert.equal(lib.parseDeleteIds({ ids: many }), null);
  assert.equal(lib.parseDeleteIds({ ids: many.slice(1) }).length, lib.MAX_DELETE_IDS);
});

test("削除 API は rosters を id 指定で消す", () => {
  const src = read(ROUTE);
  assert.match(src, /export async function DELETE\(/, `${ROUTE} に DELETE が無い`);
  assert.match(src, /parseDeleteIds\(/);
  assert.match(src, /\.from\("rosters"\)\s*\.delete\(\)\s*\.in\("id", ids\)/);
  // 条件なしの全件削除にならない
  assert.doesNotMatch(src, /\.delete\(\)\s*(;|\.select|\.neq|\.not)/);
  // 検証に通らない本文は 400 で止める
  assert.match(src, /status: 400/);
});

test("一覧に行ごとの削除と確認がある", () => {
  const src = read(CLIENT);
  assert.match(src, /"\/api\/admin\/rosters"/);
  assert.match(src, /method: "DELETE"/);
  assert.match(src, /削除の確認/);
  assert.match(src, /削除する/);
  // 画面から消すのは API が実際に消した行だけ
  assert.match(src, /deleted/);
});

test("過去シーズン分をまとめて削除できる", () => {
  const src = read(CLIENT);
  assert.match(src, /findStaleRosters\(/);
  assert.match(src, /過去シーズン/);
  assert.match(src, /まとめて削除/);
});
