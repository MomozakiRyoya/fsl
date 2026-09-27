import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const NEW_IMAGE = "/fsl-season7-group.jpg";
const OLD_IMAGE = "/fsl-season6-group.jpg";

test("新しい集合写真が public に置かれている", () => {
  assert.ok(existsSync(new URL(`../public${NEW_IMAGE}`, import.meta.url)));
});

test("ホームのヒーローは旧写真から新写真へクロスフェードする", () => {
  const page = read("src/app/page.tsx");
  assert.ok(page.includes(`src="${OLD_IMAGE}"`), "旧写真が下地に無い");
  assert.ok(page.includes(`src="${NEW_IMAGE}"`), "新写真が無い");
  assert.match(page, /hero-crossfade/, "新写真にクロスフェードのクラスが無い");
});

test("クロスフェードの keyframes と reduced-motion の逃げ道がある", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /@keyframes heroCrossfade/);
  assert.match(css, /\.hero-crossfade\s*\{[^}]*animation:\s*heroCrossfade/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.hero-crossfade/s,
    "動きを減らす設定で新写真をすぐ出す指定が無い",
  );
});

test("ローディング画面の背景は新しい集合写真", () => {
  const splash = read("src/components/pwa/SplashScreen.tsx");
  assert.ok(splash.includes(`url(${NEW_IMAGE})`));
  assert.ok(!splash.includes(OLD_IMAGE));
});
