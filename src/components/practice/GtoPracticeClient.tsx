"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GTO_SCENARIOS,
  SCENARIO_CATEGORIES,
  filterScenarios,
  shuffleArray,
  type GtoScenario,
  type CategoryKey,
  type Action,
} from "@/lib/gto-scenarios";

const STORAGE_KEY = "fsl_gto_stats";

interface Stats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

function loadStats(): Stats {
  if (typeof window === "undefined") return { total: 0, correct: 0, streak: 0, bestStreak: 0 };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return { total: 0, correct: 0, streak: 0, bestStreak: 0 };
  }
}

function saveStats(s: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const ACTION_LABELS: Record<Action, string> = { fold: "フォールド", call: "コール", raise: "レイズ / プッシュ" };
const ACTION_COLORS: Record<Action, string> = {
  fold: "bg-red-500 hover:bg-red-600 active:bg-red-700",
  call: "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700",
  raise: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
};
const ACTION_LIGHT: Record<Action, string> = {
  fold: "bg-red-50 border-red-200 text-red-700",
  call: "bg-emerald-50 border-emerald-200 text-emerald-700",
  raise: "bg-blue-50 border-blue-200 text-blue-700",
};

function HandBadge({ hand }: { hand: string }) {
  const isSuited = hand.endsWith("s");
  const isPair = hand.length === 2 || (hand.length === 3 && hand[0] === hand[1]);
  const color = isSuited ? "#2563eb" : isPair ? "#7c3aed" : "#0c1e42";
  return (
    <span className="text-4xl font-black tracking-tight" style={{ color, fontFamily: "monospace" }}>
      {hand}
    </span>
  );
}

function FrequencyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-slate-500 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-xs font-bold text-right tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

function facingLabel(scenario: GtoScenario): string {
  switch (scenario.facingAction) {
    case "open_opportunity":
      return `ファーストアクション（${scenario.players || 6}人テーブル）`;
    case "vs_open":
      return `${scenario.villainPosition} がオープン ${scenario.facingSize}BB`;
    case "vs_3bet":
      return `${scenario.villainPosition} が 3bet ${scenario.facingSize}BB`;
    case "vs_shove":
      return `${scenario.villainPosition} (${scenario.villainStack}BB) がオールイン`;
    case "shove_opportunity":
      return `オールインするかフォールドか（${scenario.players || 6}人テーブル）`;
  }
}

export default function GtoPracticeClient() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [queue, setQueue] = useState<GtoScenario[]>([]);
  const [current, setCurrent] = useState<GtoScenario | null>(null);
  const [answered, setAnswered] = useState<Action | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
  }, []);

  const startQueue = useCallback((cat: CategoryKey) => {
    const filtered = filterScenarios(GTO_SCENARIOS, cat);
    const shuffled = shuffleArray(filtered);
    setQueue(shuffled.slice(1));
    setCurrent(shuffled[0] ?? null);
    setAnswered(null);
  }, []);

  useEffect(() => { startQueue("all"); }, [startQueue]);

  const handleAnswer = (action: Action) => {
    if (!current || answered) return;
    setAnswered(action);
    const isCorrect = action === current.primaryAction;
    setStats((prev) => {
      const streak = isCorrect ? prev.streak + 1 : 0;
      const next: Stats = {
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
      saveStats(next);
      return next;
    });
  };

  const handleNext = () => {
    if (queue.length === 0) {
      startQueue(category);
      return;
    }
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setAnswered(null);
  };

  const handleCategory = (cat: CategoryKey) => {
    setCategory(cat);
    startQueue(cat);
  };

  const handleReset = () => {
    const cleared: Stats = { total: 0, correct: 0, streak: 0, bestStreak: 0 };
    setStats(cleared);
    saveStats(cleared);
    startQueue(category);
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const isCorrect = answered !== null && current !== null && answered === current.primaryAction;

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div
        className="px-4 pt-6 pb-5"
        style={{ background: "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)" }}
      >
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">GTO Training</p>
        <h1 className="text-2xl font-black text-white tracking-tight">プリフロップ道場</h1>
        <p className="text-xs text-white/50 mt-1">正解率を上げてGTOプレイヤーを目指せ</p>
      </div>

      {/* スタッツバー */}
      {mounted && (
        <div className="flex items-center gap-0 bg-white border-b border-slate-100">
          {[
            { label: "正答率", value: `${accuracy}%`, color: accuracy >= 70 ? "#10b981" : "#f59e0b" },
            { label: "解答数", value: `${stats.total}`, color: "#0c1e42" },
            { label: "連続正解", value: `${stats.streak}🔥`, color: "#ef4444" },
            { label: "最長連続", value: `${stats.bestStreak}`, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label} className="flex-1 py-3 text-center border-r border-slate-100 last:border-0">
              <p className="text-lg font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* カテゴリタブ */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {SCENARIO_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className="flex-none px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                category === cat.key
                  ? { background: "#0c1e42", color: "white" }
                  : { background: "white", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* メインカード */}
      {current && (
        <div className="px-4 pb-6">
          {/* シナリオカード */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
            {/* ハンド表示 */}
            <div className="px-5 pt-6 pb-4 text-center border-b border-slate-50">
              <HandBadge hand={current.hand} />
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
                  {current.position}
                </span>
                <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold border border-amber-200">
                  {current.heroStack}BB
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  current.difficulty === "easy"
                    ? "bg-emerald-100 text-emerald-700"
                    : current.difficulty === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {current.difficulty === "easy" ? "EASY" : current.difficulty === "medium" ? "MEDIUM" : "HARD"}
                </span>
              </div>
            </div>

            {/* シチュエーション */}
            <div className="px-5 py-4">
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">シチュエーション</p>
              <p className="text-sm font-medium text-slate-700">{facingLabel(current)}</p>
            </div>
          </div>

          {/* アクションボタン */}
          {!answered ? (
            <div className="grid grid-cols-3 gap-2">
              {(["fold", "call", "raise"] as Action[]).map((action) => (
                <button
                  key={action}
                  onClick={() => handleAnswer(action)}
                  className={`py-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 shadow-sm ${ACTION_COLORS[action]}`}
                >
                  {ACTION_LABELS[action]}
                </button>
              ))}
            </div>
          ) : (
            /* 答え合わせ */
            <div className="animate-fade-in">
              {/* 正誤表示 */}
              <div className={`rounded-2xl p-4 mb-4 border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{isCorrect ? "✅" : "❌"}</span>
                  <span className={`font-black text-lg ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                    {isCorrect ? "正解！" : "不正解"}
                  </span>
                  {!isCorrect && (
                    <span className="text-sm text-slate-600">
                      → 正解: <strong>{ACTION_LABELS[current.primaryAction]}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{current.explanation}</p>
              </div>

              {/* GTO頻度バー */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">GTO 頻度</p>
                <div className="space-y-2">
                  <FrequencyBar label="フォールド" value={current.frequency.fold} color="#ef4444" />
                  <FrequencyBar label="コール" value={current.frequency.call} color="#10b981" />
                  <FrequencyBar label="レイズ" value={current.frequency.raise} color="#3b82f6" />
                </div>
              </div>

              {/* あなたの選択 */}
              <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border mb-4 ${ACTION_LIGHT[answered]}`}>
                <span className="text-xs font-medium text-slate-500">あなたの選択:</span>
                <span className="font-bold">{ACTION_LABELS[answered]}</span>
                <span className="text-xs opacity-70">({current.frequency[answered]}%)</span>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
                style={{ background: "#0c1e42" }}
              >
                次の問題 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* リセット */}
      {mounted && stats.total > 0 && (
        <div className="px-4 pb-6 text-center">
          <button onClick={handleReset} className="text-xs text-slate-400 underline">
            スコアをリセット
          </button>
        </div>
      )}
    </div>
  );
}
