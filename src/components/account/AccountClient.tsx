"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AVATAR_COLORS = [
  "#0c1e42",
  "#1a3a7a",
  "#2255a0",
  "#c9921e",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
];

export default function AccountClient({
  email,
  displayName: initialDisplayName,
  avatarColor: initialAvatarColor,
  avatarUrl: initialAvatarUrl,
}: {
  email: string;
  displayName: string;
  avatarColor: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // プロフィール
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("fsl-images")
      .upload(path, file, { upsert: true });
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("fsl-images").getPublicUrl(path);
      setAvatarUrl(publicUrl);
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    try {
      const url = new URL(avatarUrl);
      const parts = url.pathname.split("/fsl-images/");
      if (parts[1]) {
        const supabase = createClient();
        await supabase.storage.from("fsl-images").remove([parts[1]]);
      }
    } catch {}
    setAvatarUrl(null);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        avatar_color: avatarColor,
        avatar_url: avatarUrl,
      },
    });
    if (!error) {
      await fetch("/api/account/sync-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
    setSavingProfile(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "退会する") return;
    setDeletingAccount(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeletingAccount(false);
      alert("退会処理に失敗しました。もう一度お試しください。");
    }
  };

  const avatarLetter = displayName.trim()
    ? displayName.trim()[0].toUpperCase()
    : email[0]?.toUpperCase();

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="px-4 pt-6 pb-6"
        style={{
          background:
            "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
        }}
      >
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">
          My Account
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight mb-4">
          プロフィール設定
        </h1>
        {/* アバタープレビュー */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white/20"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg transition-colors duration-200"
                style={{ background: avatarColor }}
              >
                {avatarLetter}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              {displayName.trim() || "（未設定）"}
            </p>
            <p className="text-white/50 text-xs mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* プロフィール編集 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
            プロフィール
          </p>

          {/* プロフィール画像 */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              プロフィール画像
            </span>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
                    style={{ background: avatarColor }}
                  >
                    {avatarLetter}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
                >
                  {uploadingAvatar
                    ? "アップロード中..."
                    : avatarUrl
                      ? "画像を変更"
                      : "画像をアップロード"}
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="px-4 py-1.5 rounded-lg text-xs text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    削除
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 表示名 */}
          <label className="block mb-4">
            <span className="text-xs font-semibold text-slate-600 block mb-1.5">
              表示名
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              placeholder="ニックネームを入力"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none focus:border-blue-400 transition-colors placeholder:text-slate-300"
            />
          </label>

          {/* アバターカラー */}
          <div className="mb-5">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              アバターカラー
            </span>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className="w-9 h-9 rounded-full transition-transform active:scale-90"
                  style={{
                    background: color,
                    outline:
                      avatarColor === color ? `3px solid ${color}` : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            {savingProfile
              ? "保存中..."
              : profileSaved
                ? "✓ 保存しました"
                : "保存する"}
          </button>
        </div>

        {/* アカウント情報 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            アカウント情報
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
              style={{ background: avatarColor }}
            >
              {avatarLetter}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{email}</p>
              <p className="text-xs text-slate-400">メールアドレス</p>
            </div>
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            パスワード
          </p>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/update-password`,
              });
              alert("パスワード再設定メールを送信しました");
            }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            パスワード変更メールを送る
          </button>
        </div>

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl font-bold text-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95"
        >
          ログアウト
        </button>

        {/* 退会 */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-3 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          退会する
        </button>
      </div>

      {/* 退会確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              本当に退会しますか？
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              この操作は取り消せません。アカウントと投稿データがすべて削除されます。
            </p>
            <p className="text-xs font-semibold text-slate-600 mb-2">
              確認のため「退会する」と入力してください
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl mb-4 bg-white text-slate-900 outline-none focus:border-red-300"
              placeholder="退会する"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "退会する" || deletingAccount}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white disabled:opacity-40"
              >
                {deletingAccount ? "処理中..." : "退会する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
