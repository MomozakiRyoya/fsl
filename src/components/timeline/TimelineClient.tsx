"use client";

import { useState } from "react";

interface Post {
  id: string;
  content: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

const AVATAR_COLORS = [
  "#0c1e42",
  "#1a3a7a",
  "#2255a0",
  "#c9921e",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#0891b2",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ seed }: { seed: string }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-black text-white"
      style={{ width: 40, height: 40, background: getAvatarColor(seed) }}
    >
      FS
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const baseLikes =
    Math.abs(parseInt(post.id.replace(/\D/g, "").slice(-3) || "0")) % 25;

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <Avatar seed={post.id} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-bold text-slate-900">FSLファン</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            {timeAgo(post.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        {/* アクション行 */}
        <div className="flex items-center gap-4 mt-2.5 -ml-1.5">
          {/* 返信 */}
          <button className="flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors group">
            <span className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </span>
          </button>
          {/* リポスト */}
          <button className="flex items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors group">
            <span className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </span>
          </button>
          {/* いいね */}
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1 transition-colors group ${liked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${liked ? "bg-rose-50" : "group-hover:bg-rose-50"}`}
            >
              <svg
                className="w-4 h-4"
                fill={liked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </span>
            {baseLikes + (liked ? 1 : 0) > 0 && (
              <span className="text-xs">{baseLikes + (liked ? 1 : 0)}</span>
            )}
          </button>
          {/* シェア */}
          <button className="flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors group ml-auto">
            <span className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TimelineClient({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "投稿に失敗しました");
    } else {
      setPosts([data.post, ...posts]);
      setContent("");
    }
  };

  const remaining = 140 - content.length;

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white pt-11">
      {/* Sticky ヘッダー */}
      <div
        className="sticky top-11 z-30 px-4 h-14 flex items-center border-b border-slate-100"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <h1 className="text-lg font-black text-slate-900">タイムライン</h1>
      </div>

      {/* 投稿コンポーズエリア */}
      <div className="border-b border-slate-100 px-4 pt-3 pb-2">
        <div className="flex gap-3">
          <Avatar seed="compose" />
          <div className="flex-1 min-w-0 flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full text-base text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
              style={{ background: "#fff", minHeight: 72 }}
              placeholder="今なにを思ってる？"
            />
            {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              {content.length > 100 && (
                <span
                  className={`text-xs font-medium ${remaining <= 0 ? "text-red-500" : remaining <= 20 ? "text-amber-500" : "text-slate-400"}`}
                >
                  {remaining}
                </span>
              )}
              <button
                onClick={handlePost}
                disabled={loading || !content.trim() || remaining < 0}
                className="px-5 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {loading ? "投稿中..." : "投稿"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* タイムライン */}
      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-sm">まだ投稿がありません</p>
          <p className="text-slate-300 text-xs mt-1">最初の投稿をしてみよう</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
