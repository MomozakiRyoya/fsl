import { createHmac, timingSafeEqual } from "node:crypto";

export type HookVerification =
  { ok: true } | { ok: false; reason: "secret-missing" | "bad-signature" };

// 署名の時刻として受け付けるずれ（Standard Webhooks の既定と同じ前後 5 分）
const TOLERANCE_SECONDS = 5 * 60;

// Supabase の画面が出すシークレット `v1,whsec_<base64>` から HMAC の鍵を取り出す。
// 空・接頭辞だけのときは null（空の鍵では誰でも署名を作れるので、未設定と同じに扱う）
function hookKey(secret: string | undefined): Buffer | null {
  const base64 = (secret ?? "")
    .trim()
    .replace(/^v1,/, "")
    .replace(/^whsec_/, "");
  const key = Buffer.from(base64, "base64");
  return key.length > 0 ? key : null;
}

// Supabase Auth の HTTP フックに届いた要求が本物かを確かめる（Standard Webhooks）。
// 署名は `webhook-id.webhook-timestamp.本文` の HMAC-SHA256 なので、本文は JSON にする前の文字列を渡す
export function verifyHookRequest(
  secret: string | undefined,
  body: string,
  headers: Pick<Headers, "get">,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): HookVerification {
  const key = hookKey(secret);
  if (!key) return { ok: false, reason: "secret-missing" };

  const id = headers.get("webhook-id");
  const timestampHeader = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (
    !id ||
    !timestampHeader ||
    !signatures ||
    !/^\d+$/.test(timestampHeader)
  ) {
    return { ok: false, reason: "bad-signature" };
  }
  // 盗み見た要求の再送を止める
  const timestamp = Number(timestampHeader);
  if (Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "bad-signature" };
  }

  const expected = Buffer.from(
    createHmac("sha256", key)
      .update(`${id}.${timestamp}.${body}`)
      .digest("base64"),
  );
  // 鍵の入れ替え中は `v1,<署名> v1,<署名>` のように複数付く（Supabase は「, 」でつなぐ）。
  // どれか 1 つ合えば通す
  const matched = signatures.split(" ").some((entry) => {
    const [version, signature] = entry.split(",");
    if (version !== "v1" || !signature) return false;
    const given = Buffer.from(signature);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  return matched ? { ok: true } : { ok: false, reason: "bad-signature" };
}
