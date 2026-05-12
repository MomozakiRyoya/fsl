"use client";

import { useState, useRef } from "react";
import type { BlindLevel } from "@/lib/types/app";
import { parseStructureText } from "@/lib/parse-structure";

interface Structure {
  id: string;
  name: string;
  startingStack: number;
  maxPlayers: number;
  format: string;
  levels: BlindLevel[];
}

interface RoundItem {
  id: string;
  name: string;
  leagueId: string;
  leagueName: string;
  roundNumber: number;
  date: string;
  structureId: string | null;
}

type FormData = {
  name: string;
  startingStack: string;
  maxPlayers: string;
  format: string;
};

const defaultForm = (): FormData => ({
  name: "",
  startingStack: "10000",
  maxPlayers: "9",
  format: "",
});

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4">
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: "#0c1e42" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function recalcStarts(levels: BlindLevel[]): BlindLevel[] {
  let elapsed = 0;
  return levels.map((l) => {
    const h = Math.floor(elapsed / 60);
    const m = elapsed % 60;
    const start = `${h}:${String(m).padStart(2, "0")}`;
    elapsed += parseInt(String(l.duration)) || 0;
    return { ...l, start };
  });
}

function LevelsEditor({
  levels,
  onChange,
}: {
  levels: BlindLevel[];
  onChange: (l: BlindLevel[]) => void;
}) {
  const update = (i: number, patch: Partial<BlindLevel>) => {
    const next = levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange(recalcStarts(next));
  };
  const remove = (i: number) => {
    const next = levels.filter((_, idx) => idx !== i);
    onChange(recalcStarts(next));
  };
  const move = (i: number, dir: -1 | 1) => {
    if (i + dir < 0 || i + dir >= levels.length) return;
    const next = [...levels];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(recalcStarts(next));
  };
  const addLevel = () => {
    const normals = levels.filter((l) => l.level !== "break");
    const nextLv =
      normals.length > 0
        ? Math.max(
            ...normals.map((l) => (typeof l.level === "number" ? l.level : 0)),
          ) + 1
        : 1;
    const prev = normals.at(-1);
    onChange(
      recalcStarts([
        ...levels,
        {
          level: nextLv,
          sb: prev?.sb ?? 0,
          bb: prev?.bb ?? 0,
          ante: prev?.ante ?? 0,
          duration: prev?.duration ?? "20",
          start: "0:00",
        },
      ]),
    );
  };
  const addBreak = () => {
    onChange(
      recalcStarts([
        ...levels,
        { level: "break", duration: "15", start: "0:00" },
      ]),
    );
  };

  const inputCls =
    "w-full px-1 py-1 text-xs text-right rounded border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 tabular-nums";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          ブラインドレベル編集
        </span>
        <span className="text-xs text-amber-400 font-bold">
          {levels.length} レベル
        </span>
      </div>
      <div
        className="rounded-lg overflow-hidden border border-white/8 max-h-64 overflow-y-auto"
        style={{ background: "#060b14" }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-1 py-1.5 text-white/40 text-left w-7">Lv</th>
              <th className="px-1 py-1.5 text-white/40 text-right w-16">SB</th>
              <th className="px-1 py-1.5 text-white/40 text-right w-16">BB</th>
              <th className="px-1 py-1.5 text-white/40 text-right w-16">
                Ante
              </th>
              <th className="px-1 py-1.5 text-white/40 text-right w-10">分</th>
              <th className="px-1 py-1.5 text-white/40 text-right w-10">
                開始
              </th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {levels.map((l, i) => {
              const isBreak = l.level === "break";
              return (
                <tr
                  key={i}
                  className={`border-b border-white/5 last:border-0 ${isBreak ? "bg-amber-900/20" : ""}`}
                >
                  <td className="px-1 py-1 text-white/50 text-center">
                    {isBreak ? (
                      <span className="text-amber-400 font-bold">B</span>
                    ) : (
                      l.level
                    )}
                  </td>
                  <td className="px-1 py-1">
                    {isBreak ? (
                      <span className="text-white/20 text-center block">—</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={l.sb ?? 0}
                        onChange={(e) =>
                          update(i, { sb: parseInt(e.target.value) || 0 })
                        }
                        className={inputCls}
                      />
                    )}
                  </td>
                  <td className="px-1 py-1">
                    {isBreak ? (
                      <span className="text-white/20 text-center block">—</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={l.bb ?? 0}
                        onChange={(e) =>
                          update(i, { bb: parseInt(e.target.value) || 0 })
                        }
                        className={inputCls}
                      />
                    )}
                  </td>
                  <td className="px-1 py-1">
                    {isBreak ? (
                      <span className="text-white/20 text-center block">—</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={l.ante ?? 0}
                        onChange={(e) =>
                          update(i, { ante: parseInt(e.target.value) || 0 })
                        }
                        className={inputCls}
                      />
                    )}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      min="1"
                      value={l.duration}
                      onChange={(e) => update(i, { duration: e.target.value })}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-1 py-1 text-right text-white/30 text-[10px]">
                    {l.start}
                  </td>
                  <td className="px-1 py-1">
                    <div className="flex gap-0.5 justify-end">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="w-5 h-5 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                        title="上へ"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === levels.length - 1}
                        className="w-5 h-5 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                        title="下へ"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => remove(i)}
                        className="w-5 h-5 text-red-400/50 hover:text-red-400 transition-colors"
                        title="削除"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={addLevel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          + レベル追加
        </button>
        <button
          onClick={addBreak}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-900/40 text-amber-400/60 hover:text-amber-400 hover:border-amber-900 transition-colors"
        >
          + ブレイク追加
        </button>
      </div>
    </div>
  );
}

export default function StructuresAdminClient({
  initialStructures,
  rounds: initialRounds = [],
}: {
  initialStructures: Structure[];
  rounds?: RoundItem[];
}) {
  const [structures, setStructures] = useState(initialStructures);
  const [rounds, setRounds] = useState(initialRounds);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<Structure | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [parsedLevels, setParsedLevels] = useState<BlindLevel[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [inputTab, setInputTab] = useState<"paste" | "file">("paste");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  // 節の紐づけ
  const [assignTarget, setAssignTarget] = useState<Structure | null>(null);
  const [selectedRoundIds, setSelectedRoundIds] = useState<Set<string>>(
    new Set(),
  );
  const [assigning, setAssigning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAssign = (s: Structure) => {
    const ids = rounds.filter((r) => r.structureId === s.id).map((r) => r.id);
    setSelectedRoundIds(new Set(ids));
    setAssignTarget(s);
  };

  const toggleRound = (id: string) => {
    setSelectedRoundIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    const res = await fetch(
      `/api/admin/structures/${assignTarget.id}/assign-rounds`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundIds: [...selectedRoundIds] }),
      },
    );
    setAssigning(false);
    if (res.ok) {
      setRounds((prev) =>
        prev.map((r) => ({
          ...r,
          structureId: selectedRoundIds.has(r.id)
            ? assignTarget.id
            : r.structureId === assignTarget.id
              ? null
              : r.structureId,
        })),
      );
      setAssignTarget(null);
      showToast("節を紐づけました");
    } else {
      showToast("紐づけに失敗しました");
    }
  };

  const handleParsePaste = () => {
    setParseError("");
    try {
      const levels = parseStructureText(pasteText);
      if (levels.length === 0) {
        setParseError(
          "データが解析できませんでした。列順: Lv / SB / BB / Ante / 分",
        );
        return;
      }
      setParsedLevels(levels);
    } catch {
      setParseError("解析エラーが発生しました");
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    try {
      let text = "";
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const { read, utils } = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        text = utils.sheet_to_csv(ws);
      } else {
        text = await file.text();
      }
      const levels = parseStructureText(text);
      if (levels.length === 0) {
        setParseError("データが解析できませんでした");
        return;
      }
      setParsedLevels(levels);
    } catch {
      setParseError("ファイルの読み込みに失敗しました");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setForm(defaultForm());
    setParsedLevels([]);
    setPasteText("");
    setParseError("");
    setInputTab("paste");
    setTarget(null);
    setModal("create");
  };

  const openEdit = (s: Structure) => {
    setForm({
      name: s.name,
      startingStack: String(s.startingStack),
      maxPlayers: String(s.maxPlayers),
      format: s.format,
    });
    setParsedLevels(s.levels);
    setPasteText("");
    setParseError("");
    setInputTab("paste");
    setTarget(s);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const payload = {
      name: form.name,
      startingStack: Number(form.startingStack) || 10000,
      maxPlayers: Number(form.maxPlayers) || 9,
      format: form.format,
      levels: parsedLevels,
    };
    const url =
      modal === "edit" && target
        ? `/api/admin/structures/${target.id}`
        : "/api/admin/structures";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      const raw = await res.json();
      if (modal === "edit") {
        setStructures(structures.map((s) => (s.id === target!.id ? raw : s)));
      } else {
        setStructures([raw, ...structures]);
      }
      setModal(null);
      showToast(modal === "edit" ? "更新しました" : "作成しました");
    } else {
      showToast("保存に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    setSaving(true);
    const res = await fetch(`/api/admin/structures/${target.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (res.ok) {
      setStructures(structures.filter((s) => s.id !== target.id));
      setModal(null);
      showToast("削除しました");
    } else {
      showToast("削除に失敗しました");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
            Admin
          </p>
          <h1 className="text-xl lg:text-2xl font-black text-white">
            ストラクチャー管理
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="px-4 lg:px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #c9921e, #e3c060)",
            color: "#0c1e42",
          }}
        >
          + 新規作成
        </button>
      </div>

      {/* 一覧 */}
      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#0c1e42" }}
      >
        {structures.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            ストラクチャーデータなし
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                    初期スタック
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                    最大人数
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">
                    形式
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-16">
                    Lv数
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell w-16">
                    使用節
                  </th>
                  <th className="w-48 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white font-semibold">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 hidden sm:table-cell">
                      {s.startingStack.toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 hidden sm:table-cell">
                      {s.maxPlayers}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50 hidden lg:table-cell">
                      {s.format}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {s.levels.length}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50 hidden sm:table-cell">
                      {rounds.filter((r) => r.structureId === s.id).length >
                      0 ? (
                        <span className="text-amber-400/80">
                          {rounds.filter((r) => r.structureId === s.id).length}
                          節
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <button
                          onClick={() => openAssign(s)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-900/40 text-amber-400/70 hover:text-amber-400 hover:border-amber-900/60 transition-colors whitespace-nowrap"
                        >
                          節に紐づけ
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => {
                            setTarget(s);
                            setModal("delete");
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-900 transition-colors whitespace-nowrap"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 作成/編集モーダル */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={
            modal === "edit" ? "ストラクチャーを編集" : "新規ストラクチャー"
          }
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  名前
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                  placeholder="FSL プレミア 第1節 ストラクチャー"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  初期スタック
                </label>
                <input
                  type="number"
                  value={form.startingStack}
                  onChange={(e) =>
                    setForm({ ...form, startingStack: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  最大人数
                </label>
                <input
                  type="number"
                  value={form.maxPlayers}
                  onChange={(e) =>
                    setForm({ ...form, maxPlayers: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  形式
                </label>
                <input
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
                  placeholder="フリーズアウト NLH"
                />
              </div>
            </div>

            {/* ブラインドレベル入力 */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                ブラインドレベル
              </label>
              <div className="flex gap-1 mb-3 p-1 rounded-lg border border-white/8 w-fit">
                {(["paste", "file"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setInputTab(t)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    style={
                      inputTab === t
                        ? {
                            background: "rgba(201,146,30,0.2)",
                            color: "#e3c060",
                          }
                        : { color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {t === "paste" ? "コピペ入力" : "ファイル読込"}
                  </button>
                ))}
              </div>

              {inputTab === "paste" && (
                <div>
                  <p className="text-[11px] text-white/30 mb-1.5">
                    Excel/スプレッドシートからコピーしてペースト。列順: Lv / SB
                    / BB / Ante / 分数
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 font-mono resize-none"
                    placeholder={
                      "Lv\tSB\tBB\tAnte\t分\n1\t100\t200\t0\t20\n2\t150\t300\t0\t20\nBreak\t\t\t\t15\n3\t200\t400\t50\t20"
                    }
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleParsePaste}
                      disabled={!pasteText.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
                      style={{
                        background: "rgba(201,146,30,0.2)",
                        color: "#e3c060",
                        border: "1px solid rgba(201,146,30,0.3)",
                      }}
                    >
                      解析する
                    </button>
                    {parseError && (
                      <span className="text-xs text-red-400">{parseError}</span>
                    )}
                  </div>
                </div>
              )}

              {inputTab === "file" && (
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors w-full"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    CSV / Excel (.xlsx) ファイルを選択
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <p className="text-[11px] text-white/30 mt-1.5">
                    列順: Lv / SB / BB / Ante / 分数（ヘッダー行は自動スキップ）
                  </p>
                  {parseError && (
                    <p className="text-xs text-red-400 mt-1">{parseError}</p>
                  )}
                </div>
              )}

              <LevelsEditor levels={parsedLevels} onChange={setParsedLevels} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 削除確認 */}
      {modal === "delete" && target && (
        <Modal title="削除の確認" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70 mb-6">
            「{target.name}」を削除しますか？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white disabled:opacity-40 hover:bg-red-500 transition-colors"
            >
              {saving ? "削除中..." : "削除する"}
            </button>
          </div>
        </Modal>
      )}

      {/* 節の紐づけモーダル */}
      {assignTarget && (
        <Modal
          title={`節に紐づける — ${assignTarget.name}`}
          onClose={() => setAssignTarget(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/40">
              このストラクチャーを使用する節を選択してください。
            </p>
            {rounds.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">
                節データなし
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(
                  rounds.reduce<
                    Record<string, { name: string; items: RoundItem[] }>
                  >((acc, r) => {
                    if (!acc[r.leagueId])
                      acc[r.leagueId] = { name: r.leagueName, items: [] };
                    acc[r.leagueId].items.push(r);
                    return acc;
                  }, {}),
                ).map(([leagueId, { name, items }]) => (
                  <div key={leagueId}>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">
                      {name}
                    </p>
                    <div className="space-y-1">
                      {items.map((r) => (
                        <label
                          key={r.id}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoundIds.has(r.id)}
                            onChange={() => toggleRound(r.id)}
                            className="w-4 h-4 accent-amber-500"
                          />
                          <span className="text-sm text-white/80 flex-1">
                            {r.name}
                          </span>
                          <span className="text-xs text-white/30">
                            {r.date}
                          </span>
                          {r.structureId &&
                            r.structureId !== assignTarget.id && (
                              <span className="text-[10px] text-white/20">
                                他のST使用中
                              </span>
                            )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-white/40 pt-1">
              <span>{selectedRoundIds.size}節を選択中</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAssignTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/50 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                {assigning ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg"
          style={{
            background: "#0c1e42",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
