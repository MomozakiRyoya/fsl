import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "FSL <noreply@fukuokasuperleague.com>";

interface HookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: { display_name?: string; name?: string };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type:
      | "signup"
      | "recovery"
      | "invite"
      | "email_change"
      | "magiclink";
    site_url: string;
  };
}

function buildVerifyUrl(payload: HookPayload): string {
  const { token_hash, email_action_type, redirect_to, site_url } =
    payload.email_data;

  console.log("[hook] email_action_type:", email_action_type);
  console.log("[hook] redirect_to:", redirect_to);
  console.log("[hook] site_url:", site_url);
  console.log("[hook] token_hash length:", token_hash?.length);

  if (email_action_type === "recovery") {
    // redirect_to と site_url は Supabase がワイルドカード等を渡すため使わない
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.fukuokasuperleague.com"
    ).replace(/\/$/, "");
    const url = `${siteUrl}/auth/update-password?token_hash=${encodeURIComponent(token_hash)}&type=recovery`;
    console.log("[hook] recovery URL:", url);
    return url;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
}

function signupHtml(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c1e42;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 16px;">
    <div style="text-align:center;padding:32px 0 24px;">
      <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:rgba(255,255,255,0.4);text-transform:uppercase;">Fukuoka Super League</p>
      <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.02em;">メール確認</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0c1e42;">FSLへようこそ！</p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
        ご登録ありがとうございます。<br>
        下のボタンをクリックしてメールアドレスを確認し、アカウントを有効化してください。
      </p>
      <a href="${verifyUrl}"
        style="display:block;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;background:linear-gradient(135deg,#c9921e,#e3c060);color:#0c1e42;">
        メールアドレスを確認する
      </a>
      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        このリンクは24時間有効です。<br>
        このメールに心当たりがない場合は無視してください。
      </p>
    </div>
    <p style="text-align:center;margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
      &copy; 2026 Fukuoka Super League
    </p>
  </div>
</body>
</html>`;
}

function recoveryHtml(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c1e42;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 16px;">
    <div style="text-align:center;padding:32px 0 24px;">
      <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:rgba(255,255,255,0.4);text-transform:uppercase;">Fukuoka Super League</p>
      <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.02em;">パスワード再設定</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0c1e42;">パスワード再設定のご案内</p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
        パスワード再設定のリクエストを受け付けました。<br>
        下のボタンをクリックして新しいパスワードを設定してください。
      </p>
      <a href="${verifyUrl}"
        style="display:block;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;background:linear-gradient(135deg,#c9921e,#e3c060);color:#0c1e42;">
        パスワードを再設定する
      </a>
      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        このリンクは1時間有効です。<br>
        このメールに心当たりがない場合は無視してください。
      </p>
    </div>
    <p style="text-align:center;margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
      &copy; 2026 Fukuoka Super League
    </p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  // シークレット検証（ログのみ・現在は拒否しない）
  const hookSecret = process.env.SUPABASE_HOOK_SECRET;
  if (hookSecret) {
    const auth = request.headers.get("Authorization");
    if (!auth?.includes(hookSecret.split(",")[1] ?? hookSecret)) {
      console.warn(
        "[send-email hook] Secret mismatch - headers:",
        request.headers.get("Authorization")?.slice(0, 30),
      );
    }
  }

  const payload: HookPayload = await request.json();
  const { user, email_data } = payload;
  const verifyUrl = buildVerifyUrl(payload);

  const subjects: Record<string, string> = {
    signup: "【FSL】メールアドレスの確認",
    recovery: "【FSL】パスワード再設定",
    invite: "【FSL】招待のご案内",
    email_change: "【FSL】メールアドレス変更の確認",
    magiclink: "【FSL】ログインリンク",
  };

  const htmlMap: Record<string, string> = {
    signup: signupHtml(verifyUrl),
    recovery: recoveryHtml(verifyUrl),
  };

  const html = htmlMap[email_data.email_action_type] ?? signupHtml(verifyUrl);
  const subject =
    subjects[email_data.email_action_type] ?? "【FSL】アカウント確認";

  console.log("[send-email hook] FROM:", FROM);
  console.log("[send-email hook] TO:", user.email);
  console.log("[send-email hook] action_type:", email_data.email_action_type);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data: emailData, error } = await resend.emails.send({
    from: FROM,
    to: user.email,
    subject,
    html,
  });

  if (error) {
    console.error("[send-email hook] Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[send-email hook] Sent successfully:", emailData?.id);
  return NextResponse.json({});
}
