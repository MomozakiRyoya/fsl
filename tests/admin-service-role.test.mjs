// 管理画面の書き込みは管理者用の接続（service role）で行う（2026-10-22）。
// 今は登録済みの一般ユーザーでもニュース・選手・節・チームを直接書き換えられる。
// DB 側の書き込み許可（RLS）を外す前に、管理画面の保存がその許可に頼らないようにしておく。
//  1. 管理 API の書き込みは getAdmin()（service role）で行い、ログイン中の接続では書かない
//  2. 管理者かどうかの確認（checkAdmin）は書き込みより先に必ず通す
//  3. 管理画面のニュース一覧は非公開の記事も service role で読む
//     （news の読み取りを公開記事だけに絞っても、管理画面から非公開の記事が消えないように）
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const ROUTES = [
  "src/app/api/admin/news/route.ts",
  "src/app/api/admin/news/[id]/route.ts",
  "src/app/api/admin/players/route.ts",
  "src/app/api/admin/players/[id]/route.ts",
  "src/app/api/admin/rounds/route.ts",
  "src/app/api/admin/rounds/[id]/route.ts",
  "src/app/api/admin/teams/route.ts",
  "src/app/api/admin/teams/[id]/route.ts",
];

// export async function POST/PATCH/DELETE の本体を取り出す
function handlers(src) {
  return [...src.matchAll(/export async function (POST|PATCH|DELETE)\(/g)].map(
    (m) => {
      const rest = src.slice(m.index);
      const end = rest.indexOf("\n}\n");
      return { method: m[1], body: rest.slice(0, end === -1 ? undefined : end) };
    },
  );
}

test("管理 API は service role の接続を持つ", () => {
  for (const path of ROUTES) {
    const src = read(path);
    assert.match(src, /from "@supabase\/supabase-js"/, path);
    assert.match(src, /SUPABASE_SERVICE_ROLE_KEY/, path);
    assert.match(src, /function getAdmin\(/, path);
  }
});

test("書き込みは getAdmin() で行い、ログイン中の接続（createClient）では書かない", () => {
  for (const path of ROUTES) {
    const list = handlers(read(path));
    assert.ok(list.length > 0, path);
    for (const { method, body } of list) {
      assert.match(body, /getAdmin\(\)/, `${path} ${method}`);
      assert.doesNotMatch(body, /await createClient\(\)/, `${path} ${method}`);
      assert.doesNotMatch(body, /supabase\s*\.from\(/, `${path} ${method}`);
    }
  }
});

test("管理者の確認は書き込みより先に通す", () => {
  for (const path of ROUTES) {
    for (const { method, body } of handlers(read(path))) {
      const check = body.indexOf("await checkAdmin()");
      const write = body.indexOf("getAdmin()");
      assert.ok(check !== -1, `${path} ${method}: checkAdmin が無い`);
      assert.ok(check < write, `${path} ${method}: checkAdmin より先に書いている`);
      assert.match(
        body.slice(check, write),
        /if \(!user\)\s*return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\)/,
        `${path} ${method}: 管理者でないときに止めていない`,
      );
    }
  }
});

test("管理画面のニュース一覧（getAllNews）は service role で読む", () => {
  const data = read("src/lib/data.ts");
  const body = data.slice(data.indexOf("export async function getAllNews("));
  const fn = body.slice(0, body.indexOf("\n}\n"));
  assert.match(fn, /fetchAllNewsAsAdmin\(/);

  const src = read("src/lib/supabase/admin-news.ts");
  assert.match(src, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(src, /\.from\("news"\)/);
  // 非公開の記事も含めるので is_published で絞らない
  assert.doesNotMatch(src, /is_published", true/);
});

test("公開画面用の getNews は service role を通らず、ログイン中の接続で読む", () => {
  const data = read("src/lib/data.ts");
  const body = data.slice(data.indexOf("export async function getNews("));
  const fn = body.slice(0, body.indexOf("\n}\n"));
  assert.match(fn, /fetchNewsFromSupabase\(/);
  assert.doesNotMatch(fn, /getAllNews|fetchAllNewsAsAdmin/);
  assert.match(fn, /onlyPublished\(/);
});

test("非公開の記事まで読む getAllNews は管理画面からしか呼ばない", () => {
  const walk = (dir) =>
    readdirSync(new URL(`../${dir}`, import.meta.url)).flatMap((name) => {
      const path = `${dir}/${name}`;
      return statSync(new URL(`../${path}`, import.meta.url)).isDirectory()
        ? walk(path)
        : /\.(ts|tsx)$/.test(name)
          ? [path]
          : [];
    });
  const callers = walk("src").filter(
    (path) => path !== "src/lib/data.ts" && /getAllNews/.test(read(path)),
  );
  assert.ok(callers.length > 0);
  for (const path of callers) {
    assert.ok(path.startsWith("src/app/admin/"), `${path} が getAllNews を呼んでいる`);
  }
});
