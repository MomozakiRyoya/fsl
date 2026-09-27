// 下部タブバーの見た目の約束事（globals.css・BottomNav.tsx・板を避ける側）。
//  - ガラスは効く環境でだけ効かせる。効かない環境と「透明度を下げる」を選んだ人には不透明の面を返す
//  - 背後が真っ白でも、タブの文字は 4.5:1 を保つ
//  - 板の丈ぶんの逃げ場は、本文・チャット・モーダル・トーストが同じ変数で持つ
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// コメントに書いた説明の中の値に引っ掛からないよう、先に落とす。
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");

const css = stripComments(read("src/app/globals.css"));
const nav = read("src/components/layout/BottomNav.tsx");

const SUPPORTS =
  "@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))";

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

function token(name) {
  const value = decl(css, name);
  assert.ok(value, `${name} が定義されていない`);
  return value;
}

function color(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const fn = value.match(/^rgba?\(([^)]+)\)$/);
  assert.ok(fn, `色として読めない: ${value}`);
  const [r, g, b, a = 1] = fn[1].split(",").map(Number);
  return { r, g, b, a };
}

/** 半透明の top を不透明の bottom に重ねた色。 */
const over = (top, bottom) => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

function luminance({ r, g, b }) {
  const linear = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * ガラスの面の色。背後を brightness() で暗くし、ガラスの色、光沢の順に重ねる。
 * brightness() は sRGB の値をそのまま倍する（Chrome・Safari の実装）。
 * ぼかしは一様な背後の色を変えないので、背後を 1 色で置いたときは無視できる。
 * 光沢は上端がいちばん濃いので、その値で数える（文字の位置ではもっと薄い）。
 */
function glassOver(backdrop) {
  const k = Number(token("--fsl-glass-brightness"));
  const dimmed = { r: backdrop.r * k, g: backdrop.g * k, b: backdrop.b * k, a: 1 };
  return over(
    color(token("--fsl-glass-gloss")),
    over(color(token("--fsl-glass")), dimmed),
  );
}

const rem = (value) => {
  const match = value.match(/^([\d.]+)rem$/);
  assert.ok(match, `rem で書く: ${value}`);
  return Number(match[1]) * 16;
};

test("入れ物は display と z-index を持たない（lg:hidden と z-50 を効かせるため）", () => {
  // globals.css は @layer を使っていないので、ここに書いた値は
  // Tailwind のユーティリティ（@layer utilities）より強くなる。
  const { body } = block(css, ".fsl-tabbar {");
  assert.equal(decl(body, "display"), null);
  assert.equal(decl(body, "z-index"), null);
});

test("素の板は不透明で、ぼかしを持たない（ガラスが効かない環境の受け皿）", () => {
  const base = block(css, ".fsl-tabbar-panel {");
  assert.ok(base.start < block(css, SUPPORTS).start, "素の板は @supports より前に書く");
  assert.equal(decl(base.body, "backdrop-filter"), null);
  assert.equal(decl(base.body, "-webkit-backdrop-filter"), null);
  assert.equal(decl(base.body, "background-color"), "var(--fsl-tabbar-panel)");
  assert.equal(color(token("--fsl-tabbar-panel")).a, 1);
  assert.equal(decl(base.body, "border-radius"), "9999px");
  // 幅と中央寄せは JSX 側のユーティリティ（mx-auto max-w-lg）が持つ。
  assert.equal(decl(base.body, "margin"), null);
  assert.equal(decl(base.body, "max-width"), null);
});

test("ガラスは @supports の中でだけ効かせ、Safari 用の接頭辞も持つ", () => {
  const panel = block(block(css, SUPPORTS).body, ".fsl-tabbar-panel {");
  assert.equal(decl(panel.body, "background-color"), "var(--fsl-glass)");
  for (const prop of ["-webkit-backdrop-filter", "backdrop-filter"]) {
    const value = decl(panel.body, prop);
    assert.ok(value, `${prop} が無い`);
    assert.match(value, /blur\(/);
    assert.match(value, /saturate\(100%\)/);
    assert.match(value, /brightness\(/);
  }
});

test("「透明度を下げる」を選んだ人には不透明の面へ戻す（@supports より後で上書き）", () => {
  const reduced = block(css, "@media (prefers-reduced-transparency: reduce)");
  assert.ok(reduced.start > block(css, SUPPORTS).end);
  const panel = block(reduced.body, ".fsl-tabbar-panel {");
  assert.equal(decl(panel.body, "background-color"), "var(--fsl-tabbar-panel)");
  assert.equal(decl(panel.body, "background-image"), "none");
  assert.equal(decl(panel.body, "-webkit-backdrop-filter"), "none");
  assert.equal(decl(panel.body, "backdrop-filter"), "none");
});

test("ガラスは CSS 側だけが持つ（インラインで書くと上の受け皿が効かない）", () => {
  assert.doesNotMatch(nav, /backdropFilter|WebkitBackdropFilter/);
  for (const name of [
    "fsl-tabbar",
    "fsl-tabbar-panel",
    "fsl-tabbar-indicator",
    "fsl-tabbar-link",
    "fsl-tabbar-label",
  ]) {
    assert.match(nav, new RegExp(`["\\s]${name}["\\s]`), `${name} を使っていない`);
    assert.ok(css.includes(`.${name} {`), `.${name} が globals.css に無い`);
  }
});

test("現在地の印の幅と列の数は、タブの数に揃える", () => {
  const tabs = (nav.match(/href: "\//g) ?? []).length;
  assert.ok(tabs > 0);
  assert.match(nav, new RegExp(`grid-cols-${tabs}\\b`));
  const { body } = block(css, ".fsl-tabbar-indicator {");
  assert.equal(decl(body, "width"), `calc((100% - 0.5rem) / ${tabs})`);
});

test("動きは「視差効果を減らす」を選んでいない人にだけ付ける", () => {
  const motion = block(css, "@media (prefers-reduced-motion: no-preference)");
  const uses = [...css.matchAll(/animation(?:-name)?\s*:\s*fsl-tab-/g)];
  assert.ok(uses.length >= 2);
  for (const use of uses) {
    assert.ok(
      use.index > motion.start && use.index < motion.end,
      "fsl-tab-* の animation が @media の外にある",
    );
  }
  // 伸びの原点は進む側の縁。後ろの縁だけが遅れて追いつく形になる。
  const forward = block(motion.body, '.fsl-tabbar-indicator[data-dir="forward"]::before {');
  const backward = block(motion.body, '.fsl-tabbar-indicator[data-dir="backward"]::before {');
  assert.equal(decl(forward.body, "transform-origin"), "right");
  assert.equal(decl(backward.body, "transform-origin"), "left");
});

test("伸びは 1 から始まり 1 に戻る（戻さないと伸びたまま残る）", () => {
  const { body } = block(css, "@keyframes fsl-tab-stretch");
  const first = body.search(/(?<![\d.])0%\s*\{/);
  const last = body.indexOf("100%");
  assert.notEqual(first, -1);
  assert.notEqual(last, -1);
  assert.equal(decl(blockAt(body, first).body, "transform"), "scaleX(1)");
  assert.equal(decl(blockAt(body, last).body, "transform"), "scaleX(1)");
});

test("逃げ場は タブの高さ＋内側の余白＋下の余白＋ホームバー で数える", () => {
  const space = token("--fsl-tabbar-space");
  const link = block(css, ".fsl-tabbar-link {");
  assert.equal(decl(link.body, "min-height"), "3.5rem");
  assert.match(space, /3\.5rem/);
  assert.match(space, /var\(--fsl-tabbar-inset\)/);
  assert.match(space, /env\(safe-area-inset-bottom/);
});

test("本文・チャット・モーダル・トーストは同じ変数で板を避ける", () => {
  const cases = [
    ["src/components/layout/ClientLayoutWrapper.tsx", /(?<![\w:-])pb-20\b/],
    ["src/app/chat/page.tsx", /bottom-\[58px\]/],
    ["src/components/home/SponsorBanner.tsx", /pb-\[58px\]/],
    ["src/app/roster/RosterClient.tsx", /(?<![\w:-])bottom-24\b/],
  ];
  for (const [path, old] of cases) {
    const text = read(path);
    assert.match(text, /var\(--fsl-tabbar-space\)/, `${path} が逃げ場の変数を使っていない`);
    assert.doesNotMatch(text, old, `${path} に板の丈を決め打ちした値が残っている`);
  }
});

test("背後が真っ白でも、タブの文字は 4.5:1 を保つ（ガラスと不透明の面の両方）", () => {
  const glass = glassOver({ r: 255, g: 255, b: 255, a: 1 });
  const panel = color(token("--fsl-tabbar-panel"));
  const active = color(token("--fsl-tab-active"));
  const current = color(token("--fsl-tab-current"));
  const idle = color(token("--fsl-tab-idle"));
  const cases = [
    ["現在地（印の上）", current, over(active, glass)],
    ["触れているタブ", current, glass],
    ["ほかのタブ", idle, glass],
    ["現在地（不透明の面）", current, over(active, panel)],
    ["ほかのタブ（不透明の面）", idle, panel],
  ];
  for (const [name, fg, bg] of cases) {
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${name}: ${ratio.toFixed(2)}:1`);
  }
});

test("板は明るい地から浮き、暗い地でも縁で形が見える（3:1）", () => {
  const light = color(decl(block(css, "\nbody {").body, "background-color"));
  const dark = color(decl(block(css, ".dark body {").body, "background-color"));
  const rim = color(token("--fsl-glass-rim"));
  const onLight = contrast(glassOver(light), light);
  const onDark = contrast(over(rim, glassOver(dark)), dark);
  assert.ok(onLight >= 3, `明るい地: ${onLight.toFixed(2)}:1`);
  assert.ok(onDark >= 3, `暗い地の縁: ${onDark.toFixed(2)}:1`);
});

test("いちばん長いラベルが 320px 幅でも 1 行に収まる", () => {
  const labels = [...nav.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(labels.length > 0);
  const longest = Math.max(...labels.map((label) => [...label].length));
  const panel = block(css, ".fsl-tabbar-panel {");
  // 板の内寸 = 画面幅 − 左右の余白 − 縁 − 内側の余白。それを 5 等分したのが 1 タブの取り分。
  const chrome =
    2 * rem(token("--fsl-tabbar-inset")) +
    2 * Number.parseFloat(decl(panel.body, "border")) +
    2 * rem(decl(panel.body, "padding"));
  const narrow = rem(decl(block(css, ".fsl-tabbar-label {").body, "font-size"));
  const wide = rem(
    decl(
      block(block(css, "@media (min-width: 22.5rem)").body, ".fsl-tabbar-label {").body,
      "font-size",
    ),
  );
  // 和文は 1 文字が font-size とほぼ同じ幅を取る。字間（0.02em）も足す。
  for (const [viewport, size] of [
    [320, narrow],
    [360, wide],
  ]) {
    const share = (viewport - chrome) / labels.length;
    const need = longest * size * 1.02;
    assert.ok(need <= share, `${viewport}px: ${need.toFixed(1)}px 必要 / 取り分 ${share.toFixed(1)}px`);
  }
});
