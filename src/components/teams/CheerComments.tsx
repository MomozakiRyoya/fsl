'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  text: string
  createdAt: string
  nickname: string
}

interface Props {
  teamId: string
  teamName: string
}

function getStorageKey(teamId: string) {
  return `fsl-comments-${teamId}`
}

function loadComments(teamId: string): Comment[] {
  try {
    const stored = localStorage.getItem(getStorageKey(teamId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveComments(teamId: string, comments: Comment[]) {
  try {
    localStorage.setItem(getStorageKey(teamId), JSON.stringify(comments))
  } catch {
    // ignore
  }
}

const SAMPLE_COMMENTS: Record<string, Comment[]> = {
  't1-1': [
    { id: 'demo1', text: '今シーズンも博多キングス最高！首位守ってくれ！', createdAt: '2026.03.24', nickname: 'ポーカーファン' },
    { id: 'demo2', text: '第4節もトップでした！次節も応援してます', createdAt: '2026.03.22', nickname: '天神より' },
  ],
  't1-2': [
    { id: 'demo3', text: '山本さんの活躍すごい！MVP納得', createdAt: '2026.03.17', nickname: 'エースサポーター' },
  ],
}

export default function CheerComments({ teamId, teamName }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')
  const [mounted, setMounted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = loadComments(teamId)
    // サンプルコメントをデモ用にマージ（既存ストレージが空の場合のみ）
    const demos = SAMPLE_COMMENTS[teamId] ?? []
    const merged = stored.length === 0 ? demos : stored
    setComments(merged)
  }, [teamId])

  const handleSubmit = () => {
    if (!text.trim()) return
    const newComment: Comment = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      nickname: nickname.trim() || '匿名サポーター',
    }
    const updated = [newComment, ...comments]
    setComments(updated)
    saveComments(teamId, updated)
    setText('')
    setNickname('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  if (!mounted) return null

  return (
    <>
      <div className="section-head">
        <h2 className="section-title">応援メッセージ</h2>
        {/* 地の色の上に載るので slate-500 では薄すぎる（4.5 に届かない） */}
        <span className="text-xs tabular-nums text-slate-700">{comments.length}件</span>
      </div>

      {/* 投稿フォーム */}
      <div className="card-native p-4 mb-3">
        <p className="text-xs font-bold text-slate-700 mb-2">{teamName} へ応援メッセージ</p>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネーム（任意）"
          maxLength={20}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:border-transparent bg-white text-slate-900"
          style={{ '--tw-ring-color': 'rgba(201,146,30,0.4)' } as React.CSSProperties}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`${teamName} への応援メッセージを入力...`}
          maxLength={100}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:border-transparent bg-white text-slate-900"
          style={{ '--tw-ring-color': 'rgba(201,146,30,0.4)' } as React.CSSProperties}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 tabular-nums">{text.length}/100</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="touch-active inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-bold bg-butter text-on-block disabled:opacity-40"
          >
            {submitted ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                送信済み
              </>
            ) : '送信する'}
          </button>
        </div>
      </div>

      {/* コメント一覧 */}
      {comments.length > 0 ? (
        <>
          <ul className="space-y-2">
            {comments.slice(0, 5).map((comment, i) => (
              <li
                key={comment.id}
                className="card-native px-4 py-3 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="min-w-0 truncate text-xs font-bold text-slate-700">{comment.nickname}</span>
                  <span className="flex-shrink-0 text-[11px] tabular-nums text-slate-500">{comment.createdAt}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed [word-break:keep-all] break-words">{comment.text}</p>
              </li>
            ))}
          </ul>
          {comments.length > 5 && (
            <p className="text-xs text-center text-slate-700 pt-3">他 {comments.length - 5} 件</p>
          )}
        </>
      ) : (
        <div className="card-native p-6 text-center">
          <p className="text-sm text-slate-700">まだメッセージがありません</p>
          <p className="text-xs text-slate-500 mt-1">最初の応援メッセージを送ろう</p>
        </div>
      )}
    </>
  )
}
