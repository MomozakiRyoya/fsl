// 各パーツの作りを SwiftPieces（https://github.com/Saivion/SwiftPieces）に寄せた約束事。
// 色は紺・金・生成り地のまま、部品の作りだけを合わせる。
//  - 角丸は段階で持つ（カード 18px・大きな面 26px）。影は 1px の細線のまま（design-brushup.test.mjs が見る）
//  - 押すと 0.97 まで縮み、ばねの緩急で戻る
//  - 選択の印は 1 つだけで、選んだ項目の下へ滑る
//  - 状態は色の面だけで伝えず、アイコンか文字を添える
//  - 動きを減らす設定では、縮み・滑り・呼吸・回転をすべて止める
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
const EMOJI = /\p{Extended_Pictographic}/u;

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

/** header で始まるブロックをすべてつないだ中身。 */
function blocks(text, header) {
  let out = "";
  let from = 0;
  for (;;) {
    const index = text.indexOf(header, from);
    if (index === -1) return out;
    const found = blockAt(text, index);
    out += `${found.body}\n`;
    from = found.end;
  }
}

/** 宣言の値。-webkit- 付きと素のものは別に数える。無ければ null。 */
function decl(body, prop) {
  const match = body.match(
    new RegExp(`(?<![-\\w])${prop}\\s*:\\s*([^;{}]+);`),
  );
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

const theme = block(css, "@theme inline").body;
const reduced = blocks(css, "@media (prefers-reduced-motion: reduce)");

// ===== 全体のトークン =====

test("角丸は SwiftPieces の段階（カード 18px・大きな面 26px）", () => {
  assert.equal(decl(theme, "--radius-xl"), "12px");
  assert.equal(decl(theme, "--radius-2xl"), "18px");
  assert.equal(decl(theme, "--radius-3xl"), "26px");
  assert.equal(decl(theme, "--radius-4xl"), "34px");
  for (const name of [
    "--radius",
    "--radius-xs",
    "--radius-sm",
    "--radius-md",
    "--radius-lg",
  ]) {
    const value = decl(theme, name);
    assert.ok(value, `${name} が無い`);
    assert.notEqual(value, "0", `${name} が 0 のまま`);
  }
});

test("ばねと滑りの緩急を変数で持つ", () => {
  assert.equal(decl(css, "--ease-spring"), "cubic-bezier(0.34, 1.3, 0.64, 1)");
  assert.equal(decl(css, "--ease-glide"), "cubic-bezier(0.22, 1, 0.36, 1)");
});

test("状態の色の面と、面の上の文字色（ダークでも紺のまま）", () => {
  // @theme inline に置くと var() で参照できないので、inline でない @theme に置く
  const plain = css.match(/@theme\s*\{([^}]*)\}/);
  assert.ok(plain, "inline でない @theme が無い");
  for (const name of [
    "--color-butter",
    "--color-sage",
    "--color-sand",
    "--color-silver",
  ]) {
    assert.ok(decl(plain[1], name), `${name} が無い`);
  }
  assert.match(decl(plain[1], "--color-on-block") ?? "", NAVY);
  // 面はダークでも明るい色なので、上の文字を明るくすると読めなくなる
  assert.doesNotMatch(css, /\.dark[^{]*\{[^}]*--color-on-block\s*:/);
});

// ===== 押したとき・カード・札 =====

test("押すと 0.97 まで縮み、ばねで戻る（動きを減らす設定では縮まない）", () => {
  const touch = block(css, "\n.touch-active {").body;
  const transition = decl(touch, "transition") ?? "";
  assert.match(transition, /transform/);
  assert.match(transition, /var\(--ease-spring\)/);
  const active = block(css, "\n.touch-active:active {").body;
  assert.equal(decl(active, "transform"), "scale(0.97)");
  assert.match(reduced, /\.touch-active:active\s*\{[^}]*transform:\s*none/);
});

test("カードは 18px に丸め、札はカプセルにする", () => {
  const card = block(css, "\n.card-native {").body;
  assert.equal(decl(card, "border-radius"), "var(--radius-2xl)");
  const pill = block(css, "\n.pill {").body;
  assert.equal(decl(pill, "border-radius"), "999px");
});

// ===== 選択の印（GlideTabs） =====

test("選択の印は位置が決まってから出し、以後の移動だけを滑らせる", () => {
  const indicator = block(css, "\n.glide-indicator {").body;
  assert.equal(decl(indicator, "opacity"), "0");
  assert.equal(decl(indicator, "pointer-events"), "none");
  const ready = block(css, "\n.glide-indicator[data-ready] {").body;
  const transition = decl(ready, "transition") ?? "";
  assert.match(transition, /transform/);
  assert.match(transition, /width/);
  assert.match(transition, /var\(--ease-glide\)/);
  assert.match(
    reduced,
    /\.glide-indicator\[data-ready\]\s*\{[^}]*transition:\s*none/,
  );
});

test("レールは溢れている側の端だけを薄くする", () => {
  for (const side of ["start", "end", "both"]) {
    const body = block(css, `\n.glide-rail[data-fade="${side}"] {`).body;
    assert.match(decl(body, "mask-image") ?? "", /linear-gradient/, side);
    assert.match(decl(body, "-webkit-mask-image") ?? "", /linear-gradient/, side);
  }
});

test("glide.ts: 端を薄くするのは溢れている側だけ", async () => {
  const { fadeOf } = await import("../src/components/ui/glide.ts");
  assert.equal(fadeOf(0, 100, 100), undefined);
  assert.equal(fadeOf(0, 300, 100), "end");
  assert.equal(fadeOf(100, 300, 100), "both");
  assert.equal(fadeOf(200, 300, 100), "start");
  // 高解像度の画面ではスクロール位置が端数になる。端に着いたのに薄いまま残さない
  assert.equal(fadeOf(0.5, 300, 100), "end");
  assert.equal(fadeOf(199.5, 300, 100), "start");
});

test("glide.ts: 選んだチップをレールの中央へ寄せ、端では止める", async () => {
  const { railScrollTarget } = await import("../src/components/ui/glide.ts");
  assert.equal(railScrollTarget(250, 60, 200, 500), 180);
  assert.equal(railScrollTarget(10, 60, 200, 500), 0);
  assert.equal(railScrollTarget(470, 30, 200, 500), 300);
  // 溢れていないレールは動かさない
  assert.equal(railScrollTarget(0, 50, 200, 150), 0);
});

test("GlideTabs: 選択を aria-pressed で伝え、印の位置は描画の前に合わせる", () => {
  const src = stripComments(read("src/components/ui/GlideTabs.tsx"));
  assert.match(src, /aria-pressed/);
  assert.match(src, /useLayoutEffect/);
  assert.match(src, /ResizeObserver/);
  assert.match(src, /glide-indicator/);
  assert.match(src, /from "\.\/glide"/);
});

// ===== 状態のタイムライン（日程） =====

test("次節の輪は呼吸する（動きを減らす設定では止める）", () => {
  const keyframes = block(css, "@keyframes timelineBreathe").body;
  assert.match(keyframes, /scale\(1\.5\)/);
  assert.match(keyframes, /opacity:\s*0\s*[;}]/);
  const breathe = block(css, "\n.timeline-breathe {").body;
  assert.match(decl(breathe, "animation") ?? "", /timelineBreathe .*infinite/);
  assert.match(reduced, /\.timeline-breathe\s*\{[^}]*animation:\s*none/);
});

// ===== 桁ごとに回る数字（Odometer） =====

test("回る数字は桁ごとの窓で切り、回っている間だけ上下をぼかす", () => {
  const slot = block(css, "\n.odometer-slot {").body;
  // overflow: hidden だと inline-block の基線が下端に落ち、前後の文字とずれる
  assert.equal(decl(slot, "clip-path"), "inset(0)");
  assert.equal(decl(slot, "overflow"), null);
  assert.equal(decl(block(css, "\n.odometer-reel {").body, "position"), "absolute");
  const rolling = block(css, "\n.odometer[data-rolling] .odometer-slot {").body;
  const fade =
    "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)";
  assert.equal(decl(rolling, "mask-image"), fade);
  assert.equal(decl(rolling, "-webkit-mask-image"), fade);
});

test("odometer.ts: 桁数は整数部の長さ（0 も 1 桁）", async () => {
  const { digitCount } = await import("../src/components/ui/odometer.ts");
  assert.equal(digitCount(0), 1);
  assert.equal(digitCount(7), 1);
  assert.equal(digitCount(145), 3);
  assert.equal(digitCount(-38), 2);
});

test("odometer.ts: 下の桁が 9→0 へ回るときだけ、上の桁も一緒に回る", async () => {
  const { odometerSlots } = await import("../src/components/ui/odometer.ts");
  const plain = (slots) =>
    slots.map(({ digit, next, offset }) => [digit, next, offset]);
  // 上の桁から順に [今の数字, 次の数字, 次へ回った割合]
  assert.deepEqual(plain(odometerSlots(145, 3)), [
    ["1", "2", 0],
    ["4", "5", 0],
    ["5", "6", 0],
  ]);
  // 9 から 10 へ: 1 の位と一緒に、まだ空の 10 の位が 1 へ回る
  assert.deepEqual(plain(odometerSlots(9.5, 2)), [
    ["", "1", 0.5],
    ["9", "0", 0.5],
  ]);
  assert.deepEqual(plain(odometerSlots(19.25, 2)), [
    ["1", "2", 0.25],
    ["9", "0", 0.25],
  ]);
  // 1 の位が 9 でなければ、上の桁は止まったまま
  assert.deepEqual(plain(odometerSlots(12.5, 2)), [
    ["1", "2", 0],
    ["2", "3", 0.5],
  ]);
  assert.deepEqual(plain(odometerSlots(99.5, 3)), [
    ["", "1", 0.5],
    ["9", "0", 0.5],
    ["9", "0", 0.5],
  ]);
  // 上の桁の 0 は出さない（1 の位の 0 は出す）
  assert.deepEqual(plain(odometerSlots(0, 3)), [
    ["", "1", 0],
    ["", "1", 0],
    ["0", "1", 0],
  ]);
});

test("CountUp: 桁ごとに回し、読み上げには最後の数字だけを渡す", () => {
  const src = stripComments(read("src/components/ui/CountUp.tsx"));
  assert.match(src, /from "\.\/odometer"/);
  assert.match(src, /aria-hidden/);
  assert.match(src, /sr-only/);
  assert.match(src, /prefers-reduced-motion/);
  assert.match(src, /odometer-slot/);
});

// ===== 各ページ =====

test("順位表: 選択は GlideTabs、順位の札は色の面、紺の塗りの帯と左の色帯を使わない", () => {
  const src = stripComments(
    read("src/components/standings/StandingsPageClient.tsx"),
  );
  assert.match(src, /<GlideTabs\b/);
  assert.ok(!src.includes("borderLeft"), "行に左の色帯が残っている");
  for (const cls of ["bg-butter", "bg-silver", "bg-sand"]) {
    assert.ok(src.includes(cls), `順位の札に ${cls} が無い`);
  }
  assert.doesNotMatch(src, /background:\s*"#0c1e42"/, "紺の塗りの帯が残っている");
});

test("順位表: チーム名は「…」で切らず 2 行まで。節の列を詰め、狭い画面ではロゴより名前を優先する", () => {
  const src = stripComments(
    read("src/components/standings/StandingsPageClient.tsx"),
  );
  // 375px で名前の列が 63px しか無く、「KEN POKER」が「KEN P…」になっていた
  assert.doesNotMatch(src, /\btruncate\b/, "チーム名を 1 行で切っている");
  assert.match(src, /\bline-clamp-2\b/);
  assert.match(src, /<BreakableName\b/);
  const round = src.match(/lastRounds\.map\(\(\) => "([\d.]+)rem"\)/);
  assert.ok(round, "節の列の幅が見つからない");
  assert.ok(Number(round[1]) <= 1.75, `節の列が ${round[1]}rem のまま`);
  // 320px ではロゴを残すと名前が 62px になり、「BARTENDER」が語の途中で割れる
  assert.match(src, /\bhidden min-\[360px\]:block\b/);
  assert.match(src, /\bhidden min-\[360px\]:flex\b/);
  // 320px で「大日本全ツ連盟」が「大日本全ツ連／盟」と 1 字だけ次の行に落ちていた
  assert.match(src, /\btext-balance\b/);
});

test("チーム名: 大文字の区切りで折り返せるようにし、語の途中では割らない", async () => {
  const { nameParts } = await import("../src/components/ui/name-parts.ts");
  assert.deepEqual(nameParts("CRownCLownCRew"), ["CRown", "CLown", "CRew"]);
  assert.deepEqual(nameParts("SuperNova"), ["Super", "Nova"]);
  assert.deepEqual(nameParts("NY BackRay's"), ["NY Back", "Ray's"]);
  for (const name of ["SHAMBLES", "B.B. Guardians", "大日本全ツ連盟", "P.P.P"]) {
    assert.deepEqual(nameParts(name), [name], name);
  }
  // 古い iOS（16.3 以前）は後読みの正規表現で読み込みごと落ちる
  const src = stripComments(read("src/components/ui/name-parts.ts"));
  assert.ok(!src.includes("(?<"), "後読みを使っている");
  const view = stripComments(read("src/components/ui/BreakableName.tsx"));
  assert.match(view, /<wbr\s*\/>/);
});

test("日程: 節は状態のタイムラインに並べ、札は時刻から決めた状態を見る", () => {
  const src = stripComments(
    read("src/components/schedule/SchedulePageClient.tsx"),
  );
  assert.match(src, /<GlideTabs\b/);
  assert.match(src, /timeline-breathe/);
  assert.match(src, /getEffectiveStatus/);
  // 生の status を見ると、時刻を過ぎた節に「次節」「予定」と出る
  assert.ok(!src.includes("[round.status]"), "札が生の status を見ている");
  assert.ok(!src.includes("borderLeft"), "左の色帯が残っている");
  assert.doesNotMatch(src, EMOJI, "絵文字が残っている");
  // 丸と矢印に幅を取られ、320px で「（合同エースマッ／チ）」と 2 字だけ次の行に落ちていた。
  // 字の間では折らず、空白と括弧の前で折る（収まらない長さのときだけ字の間で折る）
  const name = src.match(/<p\s+className=\{?[`"]([^`"]*\bfont-bold\b[^`"]*)[`"]/);
  assert.ok(name, "節名の段落が無い");
  assert.match(name[1], /\[word-break:keep-all\]/);
  assert.match(name[1], /\bbreak-words\b/);
});

test("チーム: 絞り込みは GlideTabs、検索欄は白地に濃い文字のカプセル", () => {
  const src = stripComments(read("src/components/teams/TeamsPageClient.tsx"));
  assert.match(src, /<GlideTabs\b/);
  assert.ok(!src.includes("borderLeft"), "カードに左の色帯が残っている");
  assert.ok(!src.includes("★"), "フォロー中の印が文字の★のまま");
  const input = src.match(/<input[\s\S]*?className="([^"]*)"/);
  assert.ok(input, "検索欄が無い");
  assert.match(input[1], /\bbg-white text-slate-900\b/);
  assert.match(input[1], /\brounded-full\b/);
  // 札を右端に置くと、320px で名前の列が 60px まで縮み、ディビジョン名とキャプテン名が切れる
  const card = src.slice(src.indexOf("function TeamCard"), src.indexOf("function LeagueSection"));
  const name = card.search(
    /group-hover:underline[^>]*>\s*<BreakableName name=\{team\.name\}/,
  );
  assert.ok(name > 0, "カードにチーム名が無い");
  assert.ok(card.indexOf("フォロー中") < name, "フォロー中の札が名前の上ではなく右端にある");
  // 1 行で切ると、375px で「DELIVERY BARTENDER」が末尾を「…」にされる
  const nameClass = card.match(/<p className="([^"]*group-hover:underline[^"]*)"/);
  assert.ok(nameClass, "チーム名の行が無い");
  assert.doesNotMatch(nameClass[1], /\btruncate\b/, "チーム名を 1 行で切っている");
  assert.match(nameClass[1], /\bline-clamp-2\b/);
  // 幅は max-w-lg（512px）のまま md で 2 列にすると名前の列が 67px、lg の 3 列でも 82px しかなく、
  // 「TRUM|P」「SHAMBL|ES」と語の途中で割れていた。2 列にするのは器が広がる lg から
  const grid = src.match(/className="(grid grid-cols-1[^"]*)"/);
  assert.ok(grid, "カードの並びが無い");
  assert.doesNotMatch(grid[1], /\bmd:grid-cols-/, "器が 512px のまま md で段を割っている");
  assert.doesNotMatch(grid[1], /\blg:grid-cols-[3-9]\b/, "lg で 3 列以上にしている");
  assert.match(grid[1], /\blg:grid-cols-2\b/);
});

test("ダーク: 白地の入力欄は文字を濃いまま残す", () => {
  // .dark .text-slate-900 は文字だけを明るくし、bg-white は白のまま残る。
  // 欄の側で濃い文字に戻さないと、入力した文字が白地に白で見えなくなる
  for (const field of ["input", "textarea", "select"]) {
    const index = css.search(new RegExp(`\\.dark ${field}\\.bg-white\\b`));
    assert.notEqual(index, -1, `.dark ${field}.bg-white の決めが無い`);
    assert.match(
      decl(blockAt(css, index).body, "color") ?? "",
      /^(#0f172a|var\(--color-slate-900\))$/i,
      `${field} の文字が濃い色に戻っていない`,
    );
  }
});
