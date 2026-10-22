// ニュースの公開・非公開の約束事（2026-10-22）。
//  1. 公開画面（ホーム・検索・マイニュース・記事詳細）には is_published の記事だけを出す。
//     管理画面で非公開にした Season 7 の記事 4 本が、全部の公開画面に出たままだった
//  2. 管理画面（ニュース管理・ダッシュボード）は非公開の記事も並べる。並ばないと公開に戻せない
//  3. ホームのニュース欄は 0 本のとき見出しだけが浮くので、無いことを書く
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const item = (id, isPublished) => ({
  id,
  title: `記事 ${id}`,
  slug: `news-${id}`,
  category: "お知らせ",
  publishedAt: "2026-10-22",
  thumbnailUrl: null,
  body: "",
  isPublished,
  seasonId: "",
});

test("非公開の記事を落とし、公開の記事は並びを変えずに残す", async () => {
  const { onlyPublished } = await import("../src/lib/news-visibility.ts");
  const news = [item("a", true), item("b", false), item("c", true), item("d", false)];
  assert.deepEqual(
    onlyPublished(news).map((n) => n.id),
    ["a", "c"],
  );
});

test("全部非公開なら 1 本も出さない", async () => {
  const { onlyPublished } = await import("../src/lib/news-visibility.ts");
  assert.deepEqual(onlyPublished([item("a", false), item("b", false)]), []);
});

test("公開画面が使う getNews は onlyPublished を通す", () => {
  const src = read("src/lib/data.ts");
  const body = src.slice(src.indexOf("export async function getNews("));
  assert.match(body.slice(0, body.indexOf("\n}\n")), /onlyPublished\(/);
});

test("公開画面は非公開込みの getAllNews を使わない", () => {
  for (const path of [
    "src/app/page.tsx",
    "src/app/search/page.tsx",
    "src/app/my-news/page.tsx",
    "src/app/news/[slug]/page.tsx",
  ]) {
    const src = read(path);
    assert.doesNotMatch(src, /getAllNews/, path);
    assert.match(src, /getNews\(\)/, path);
  }
});

test("管理画面は非公開の記事も並べる（getAllNews を使う）", () => {
  for (const path of [
    "src/app/admin/news/page.tsx",
    "src/app/admin/dashboard/page.tsx",
  ]) {
    const src = read(path);
    assert.match(src, /getAllNews\(\)/, path);
    assert.doesNotMatch(src, /getNews\(\)/, path);
  }
});

test("ホームのニュース欄は、公開の記事が 0 本でも見出しだけを残さず、無いことを書く", () => {
  const src = read("src/components/home/HomeNewsSection.tsx");
  assert.doesNotMatch(src, /news\.length === 0\) return null/);
  assert.match(src, /公開中のニュースはありません/);
});
