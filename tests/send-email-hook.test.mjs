// Supabase Auth の send-email フック（HTTP）に届いた要求が本物かの判定。
// Supabase は Authorization ではなく Standard Webhooks の署名
// （webhook-id・webhook-timestamp・webhook-signature）を付けてくる。
// 実行: npm test（node --test。Node 22.18 以降は .ts をそのまま読める）
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyHookRequest } from "../src/app/api/auth/hook/send-email/verify.ts";

const ACCEPT = { ok: true };
const REJECT_MISSING = { ok: false, reason: "secret-missing" };
const REJECT_BAD = { ok: false, reason: "bad-signature" };

// Supabase の画面（Auth Hooks）が出すのと同じ形のシークレット `v1,whsec_<base64>`
const KEY = Buffer.from("fsl-send-email-hook-test-key-32b");
const SECRET = `v1,whsec_${KEY.toString("base64")}`;
const NOW = 1_790_000_000;
const BODY = JSON.stringify({
  user: { id: "u1", email: "player@example.com" },
  email_data: {
    token: "",
    token_hash: "th",
    redirect_to: "https://www.fukuokasuperleague.com/",
    email_action_type: "signup",
    site_url: "https://www.fukuokasuperleague.com",
  },
});

// 送り手（Supabase）側の署名。`id.時刻.本文` の HMAC-SHA256 を base64 にして "v1," を付ける
function sign(key, id, timestamp, body) {
  const mac = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return `v1,${mac}`;
}

function supabaseHeaders({ id = "msg_1", timestamp = NOW, signature } = {}) {
  return new Headers({
    "content-type": "application/json",
    "webhook-id": id,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": signature ?? sign(KEY, id, timestamp, BODY),
  });
}

test("シークレットが未設定・空なら、署名が付いていても拒否する（fail closed）", () => {
  for (const secret of [undefined, "", "  \n"]) {
    assert.deepEqual(
      verifyHookRequest(secret, BODY, supabaseHeaders(), NOW),
      REJECT_MISSING,
      `secret=${JSON.stringify(secret)}`,
    );
  }
});

test("接頭辞だけのシークレットは鍵が空で誰でも署名できるので、未設定と同じに拒否する", () => {
  const forged = supabaseHeaders({
    signature: sign(Buffer.alloc(0), "msg_1", NOW, BODY),
  });
  assert.deepEqual(
    verifyHookRequest("v1,whsec_", BODY, forged, NOW),
    REJECT_MISSING,
  );
});

test("Standard Webhooks の仕様書にある既知の値を通す", () => {
  const headers = new Headers({
    "webhook-id": "msg_p5jXN8AQM9LWM0D4loKWxJek",
    "webhook-timestamp": "1614265330",
    "webhook-signature": "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
  });
  assert.deepEqual(
    verifyHookRequest(
      "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw",
      '{"test": 2432232314}',
      headers,
      1614265330,
    ),
    ACCEPT,
  );
});

test("Supabase の画面が出す形のシークレットで、Supabase と同じ見出しの要求を通す", () => {
  assert.deepEqual(
    verifyHookRequest(SECRET, BODY, supabaseHeaders(), NOW),
    ACCEPT,
  );
  // 鍵の入れ替え中は署名が複数付く。区切りは空白（「, 」でつないだ形も読めること）。
  // どれか 1 つ合えば通す
  const other = sign(Buffer.from("old-key"), "msg_1", NOW, BODY);
  const rotating = `${other}, ${sign(KEY, "msg_1", NOW, BODY)}`;
  assert.deepEqual(
    verifyHookRequest(SECRET, BODY, supabaseHeaders({ signature: rotating }), NOW),
    ACCEPT,
  );
});

test("別の鍵の署名・書き換えた本文・欠けた見出し・Authorization だけの要求は拒否する", () => {
  const wrongKey = supabaseHeaders({
    signature: sign(Buffer.from("attacker-key"), "msg_1", NOW, BODY),
  });
  assert.deepEqual(verifyHookRequest(SECRET, BODY, wrongKey, NOW), REJECT_BAD);

  // 宛先を差し替えた本文（署名は元の本文のもの）
  const tampered = BODY.replace("player@", "victim@");
  assert.deepEqual(
    verifyHookRequest(SECRET, tampered, supabaseHeaders(), NOW),
    REJECT_BAD,
  );

  for (const name of ["webhook-id", "webhook-timestamp", "webhook-signature"]) {
    const headers = new Headers(
      [...supabaseHeaders()].filter(([key]) => key !== name),
    );
    assert.deepEqual(verifyHookRequest(SECRET, BODY, headers, NOW), REJECT_BAD, name);
  }

  // Supabase が使わない方式（シークレットそのものを Bearer で渡す）は受け付けない
  const bearer = new Headers({ authorization: `Bearer whsec_${KEY.toString("base64")}` });
  assert.deepEqual(verifyHookRequest(SECRET, BODY, bearer, NOW), REJECT_BAD);
});

test("時刻が前後 5 分を超えてずれた要求は拒否する（盗み見た要求の再送を防ぐ）", () => {
  for (const timestamp of [NOW - 301, NOW + 301, "soon"]) {
    assert.deepEqual(
      verifyHookRequest(SECRET, BODY, supabaseHeaders({ timestamp }), NOW),
      REJECT_BAD,
      String(timestamp),
    );
  }
  // 5 分以内なら通す（Supabase とこちらの時計が少しずれていても止めない）
  for (const timestamp of [NOW - 300, NOW + 300]) {
    assert.deepEqual(
      verifyHookRequest(SECRET, BODY, supabaseHeaders({ timestamp }), NOW),
      ACCEPT,
      String(timestamp),
    );
  }
});
