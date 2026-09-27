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

// ===== ホーム =====
const page = stripComments(read("src/app/page.tsx"));
const home = (name) =>
  stripComments(read(`src/components/home/${name}.tsx`));
const EMOJI = /\p{Extended_Pictographic}/u;

test("ホームの1画面目は左揃えで、見出しの h1 は1つだけ", () => {
  const start = page.indexOf("home-hero");
  assert.notEqual(start, -1, "home-hero が無い");
  const hero = page.slice(start, page.indexOf("</section>", start));
  assert.doesNotMatch(hero, /text-center|justify-center/);
  assert.equal(page.match(/<h1[\s>]/g)?.length ?? 0, 1);
  assert.doesNotMatch(page, /backdrop-blur|drop-shadow/);
  assert.doesNotMatch(page, GRADIENT);
});

test("ホームの見出しは h2 の紺、リンクは明るい地に金の文字を置かない", () => {
  assert.doesNotMatch(page, /<p className="section-title/);
  assert.match(page, /<h2 className="section-title/);
  assert.match(page, /section-rule/);
  assert.doesNotMatch(page, /color:\s*["']#c9921e["']/i);
});

test("ホームと上のバーに絵文字を使わない", () => {
  const files = {
    page,
    TopBar: stripComments(read("src/components/layout/TopBar.tsx")),
    MatchCountdown: home("MatchCountdown"),
    HomeNewsSection: home("HomeNewsSection"),
    StandingsSection: home("StandingsSection"),
    FeaturedPlayers: home("FeaturedPlayers"),
    MyTeamsSection: home("MyTeamsSection"),
  };
  for (const [name, text] of Object.entries(files)) {
    assert.doesNotMatch(text, EMOJI, `${name} に絵文字がある`);
  }
});

test("カードの左端の色帯とグラデーションをやめる", () => {
  assert.doesNotMatch(
    home("HomeNewsSection"),
    /CATEGORY_BORDER|absolute left-0 top-0 bottom-0|rounded-l-/,
  );
  assert.doesNotMatch(home("StandingsSection"), /borderLeft/);
  for (const name of ["MatchCountdown", "MyTeamsSection", "FeaturedPlayers"]) {
    assert.doesNotMatch(home(name), GRADIENT, `${name} にグラデーションがある`);
  }
});

test("直近の試合が無いときは、見出しだけ残さず「無い」と書く", () => {
  const countdown = home("MatchCountdown");
  assert.doesNotMatch(countdown, /upcoming\.length\s*===\s*0\)\s*return null/);
  assert.match(countdown, /予定されている試合はありません/);
});

test("明るい地の紺の文字と罫線は ink で書き、ダークでは明るい色に返す", () => {
  // @theme inline だと値が埋め込まれて .dark で差し替えられないので、inline でない @theme に置く
  const ink = css.match(/@theme\s*\{[^}]*--color-ink:\s*([^;]+);/);
  assert.ok(ink, "--color-ink が inline でない @theme に無い");
  assert.match(ink[1], NAVY);
  const dark = block(css, "\n.dark {").body;
  assert.ok(decl(dark, "--color-ink"), ".dark で --color-ink を差し替えていない");
  for (const name of [
    "StandingsSection",
    "HomeNewsSection",
    "FeaturedPlayers",
    "MyTeamsSection",
  ]) {
    assert.doesNotMatch(
      home(name),
      /(?<![:\w-])(text|border)-\[#0c1e42\]/i,
      `${name} が紺を直書きしている（ダークで消える）`,
    );
  }
});

test("body に背景色を直書きしない（.dark body の暗い背景が効くように）", () => {
  const layout = stripComments(read("src/app/layout.tsx"));
  const body = layout.match(/<body[^>]*>/s);
  assert.ok(body, "layout.tsx に <body> が無い");
  assert.doesNotMatch(body[0], /backgroundColor/, "body の style が .dark body を打ち消す");
});
