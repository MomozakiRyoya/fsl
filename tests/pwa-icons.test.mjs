// PWA のアイコンは FSL のロゴ 1 つを白地に載せた正方形（2026-11-02）。
//  - 縦長のロゴを引き伸ばさず、余白を足して正方形にする
//  - maskable は OS が丸や角丸に切り抜くので、ロゴを中央 80% の円の内側に収める
// 実行: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

const load = async (name) => {
  const sharp = (await import("sharp")).default;
  const file = new URL(`../public/icons/${name}`, import.meta.url).pathname;
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, ...info };
};

const isInk = ({ data, width, channels }, x, y) => {
  const i = (y * width + x) * channels;
  return Math.min(data[i], data[i + 1], data[i + 2]) < 200;
};

const inkBox = (img) => {
  let [left, top, right, bottom] = [img.width, img.height, -1, -1];
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (!isInk(img, x, y)) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  return { left, top, right, bottom };
};

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable.png", 512],
]) {
  test(`${name}: ${size}px の正方形で、ロゴが歪まず中央にあり端で切れない`, async () => {
    const img = await load(name);
    assert.equal(img.width, size);
    assert.equal(img.height, size);

    const box = inkBox(img);
    const [w, h] = [box.right - box.left + 1, box.bottom - box.top + 1];
    // 元画像のロゴ（文字まで含む）は横 : 縦 がおよそ 0.42。引き伸ばすと大きくずれる
    assert.ok(w / h > 0.38 && w / h < 0.47, `横 : 縦 が ${(w / h).toFixed(3)}`);
    assert.ok(Math.abs(box.left - (size - 1 - box.right)) <= size * 0.02);
    assert.ok(Math.abs(box.top - (size - 1 - box.bottom)) <= size * 0.02);
    assert.ok(box.top > 0 && box.left > 0);
    // 小さく表示しても読めるよう、縦は 7 割以上使う
    assert.ok(h / size >= 0.7, `縦の占有率が ${(h / size).toFixed(3)}`);
  });
}

test("icon-maskable.png: ロゴが中央 80% の円（切り抜かれない範囲）に収まる", async () => {
  const img = await load("icon-maskable.png");
  const center = (img.width - 1) / 2;
  const radius = img.width * 0.4;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (!isInk(img, x, y)) continue;
      assert.ok(
        Math.hypot(x - center, y - center) <= radius,
        `(${x}, ${y}) が切り抜かれる範囲にある`,
      );
    }
  }
});
