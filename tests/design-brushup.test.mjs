// 画面全体の組み方の約束事（色は紺・金・生成り地のまま、design-swiss に寄せる）。
//  - 角は立てる。影は 1px の細線だけ。グラデーションとぼかしは使わない
//  - 見出しは左揃え・大文字にしない。セクションは 1px の紺の罫線で区切る
//  - 押しても動かさない（色と濃さで返す）
//  - 例外は下部のガラスのタブバー（tabbar-glass.test.mjs が見る）
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// コメントに書いた説明の中の値に引っ掛からないよう、先に落とす。
const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const css = stripComments(read("src/app/globals.css"));
const NAVY = /#0c1e42|var\(--navy\)/i;
const GRADIENT = /gradient|bg-linear-|bg-radial|bg-conic/i;

/** index 以降で最初の { から、対になる } までの中身。 */
function blockAt(text, index) {
  const open = text.indexOf("{", index);
  assert.notEqual(open, -1, "{ が見つからない");
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return { start: index, end: i, body: text.slice(open + 1, i) };
      }
    }
  }
  assert.fail("括弧が閉じていない");
}

/** header で始まる最初のブロック。 */
function block(text, header) {
  const index = text.indexOf(header);
  assert.notEqual(index, -1, `${header} が見つからない`);
  return blockAt(text, index);
}

/** 宣言の値。-webkit- 付きと素のものは別に数える。無ければ null。 */
function decl(body, prop) {
  const match = body.match(
    new RegExp(`(?<![-\\w])${prop}\\s*:\\s*([^;{}]+);`),
  );
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

const theme = block(css, "@theme inline").body;

test("端末のバーとホーム画面の起動色は紺・生成り地", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /themeColor:\s*["']#0c1e42["']/i);
  const manifest = read("src/app/manifest.ts");
  assert.match(manifest, /theme_color:\s*["']#0c1e42["']/i);
  assert.match(manifest, /background_color:\s*["']#f5f3ee["']/i);
});

test("書体は和文を先に決める（Inter 始まりにしない）", () => {
  const font = decl(theme, "--font-sans");
  assert.ok(font, "--font-sans が無い");
  assert.doesNotMatch(font, /^['"]?Inter/i);
  assert.match(font, /Hiragino Sans/);
});

test("角丸のトークンはすべて 0", () => {
  for (const name of [
    "--radius",
    "--radius-xs",
    "--radius-sm",
    "--radius-md",
    "--radius-lg",
    "--radius-xl",
    "--radius-2xl",
    "--radius-3xl",
    "--radius-4xl",
  ]) {
    assert.equal(decl(theme, name), "0", `${name} が 0 でない`);
  }
});

test("影のトークンはすべて 1px の細線", () => {
  for (const name of [
    "--shadow",
    "--shadow-2xs",
    "--shadow-xs",
    "--shadow-sm",
    "--shadow-md",
    "--shadow-lg",
    "--shadow-xl",
    "--shadow-2xl",
  ]) {
    const value = decl(theme, name);
    assert.ok(value, `${name} が無い`);
    assert.match(value, /^0 0 0 1px /, `${name} が細線でない: ${value}`);
  }
});

test("セクション見出しは大文字にせず紺、区切りは 1px の紺の罫線", () => {
  const title = block(css, "\n.section-title {").body;
  assert.notEqual(decl(title, "text-transform"), "uppercase");
  assert.match(decl(title, "color") ?? "", NAVY);

  const rule = block(css, "\n.section-rule {").body;
  const border = decl(rule, "border-top") ?? "";
  assert.match(border, /^1px solid /);
  assert.match(border, NAVY);
});

test("カードとバッジは角を立て、押しても動かさない", () => {
  const card = block(css, "\n.card-native {").body;
  assert.equal(decl(card, "border-radius"), "0");
  assert.match(decl(card, "box-shadow") ?? "", /^0 0 0 1px /);
  const cardActive = block(css, "\n.card-native:active {").body;
  assert.equal(decl(cardActive, "transform"), null);

  const touchActive = block(css, "\n.touch-active:active {").body;
  assert.equal(decl(touchActive, "transform"), null);

  const pill = block(css, "\n.pill {").body;
  assert.equal(decl(pill, "border-radius"), "0");

  const shadow = block(css, "\n.shadow-native {").body;
  assert.match(decl(shadow, "box-shadow") ?? "", /^0 0 0 1px /);
});

test("上のバーは不透明の紺（ぼかしとグラデーションを使わない）", () => {
  const topBar = stripComments(read("src/components/layout/TopBar.tsx"));
  assert.doesNotMatch(topBar, /backdrop|blur\(/i);
  assert.doesNotMatch(topBar, GRADIENT);
  assert.match(topBar, NAVY);
});
