# FSL Security Notes

## Service Role API 一覧

以下のAPIは SUPABASE_SERVICE_ROLE_KEY を使用してRLSをバイパスします。

| ファイル | 理由 |
|---------|------|
| src/app/api/account/sync-photo/route.ts | players.photo_url 更新。ログインユーザーの所有確認後に実行。 |
| src/app/api/account/delete/route.ts | auth.admin.deleteUser にはサービスロールが必須。 |
| src/app/api/feedback/route.ts | 匿名feedbackのINSERT。RLS回避のため。 |
| src/app/api/admin/feedback/route.ts | feedback全件取得・削除。ADMIN_EMAILS認可後に実行。 |

## RLS 現状

現在RLS設定はダッシュボード上で管理されており supabase/migrations/ には未記録。
主要テーブル推奨方針: teams/rounds/matches/news はREAD公開、書き込みは管理者のみ。
players は user_email = auth.email() で本人のみ更新可。

## npm audit (2026-05-12)

2 vulnerabilities (1 moderate, 1 high) — No fix available
- Next.js Middleware/Proxy bypass: proxy.ts で /admin のみ保護のため影響限定的
- postcss XSS: Build時のみ使用でありランタイム影響なし

## Open Redirect

src/lib/safe-redirect.ts で全リダイレクトパラメータを検証済み。
外部URL・//相対URL・改行コード・javascript: スキームを拒否。
