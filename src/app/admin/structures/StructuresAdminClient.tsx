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
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function LevelsPreview({ levels }: { levels: BlindLevel[] }) {
  if (levels.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          プレビュー
        </span>
        <span className="text-xs text-amber-400 font-bold">{levels.length} レベル</span>
      </div>
      <div
        className="rounded-lg overflow-hidden border border-white/8 max-h-52 overflow-y-auto"
        style={{ background: "#060b14" }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8">
              {["Lv", "SB", "BB", "Ante", "分", "開始"].map((h) => (
                <th key={h} className="px-2 py-1.5 text-white/40 text-right first:text-left">
                  {h}
                </th>
              ))}
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
                  <td className="px-2 py-1 text-white/70">
                    {isBreak ? "Break" : l.level}
                  </td>
                  <td className="px-2 py-1 text-right text-white/60">
                    {isBreak ? "—" : (l.sb ?? 0).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-2 py-1 text-right text-white/60">
                    {isBreak ? "—" : (l.bb ?? 0).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-2 py-1 text-right text-white/60">
                    {isBreak ? "—" : (l.ante ?? 0).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-2 py-1 text-right text-white/60">{l.duration}</td>
                  <td className="px-2 py-1 text-right text-white/40">{l.start}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StructuresAdminClient({
  initialStructures,
}: {
  initialStructures: Structure[];
}) {
  const [structures, setStructures] = useState(initialStructures);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [target, setTarget] = useState<Structure | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [parsedLevels, setParsedLevels] = useState<BlindLevel[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [inputTab, setInputTab] = useState<"paste" | "file">("paste");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleParsePaste = () => {
    setParseError("");
    try {
      const levels = parseStructureText(pasteText);
      if (levels.length === 0) {
        setParseError("データが解析できませんでした。列順: Lv / SB / BB / Ante / 分");
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
                  <th className="w-40 px-4 py-3" />
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
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
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
          title={modal === "edit" ? "ストラクチャーを編集" : "新規ストラクチャー"}
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
                  onChange={(e) => setForm({ ...form, startingStack: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
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
                    Excel/スプレッドシートからコピーしてペースト。列順: Lv / SB / BB / Ante / 分数
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 font-mono resize-none"
                    placeholder={"Lv\tSB\tBB\tAnte\t分\n1\t100\t200\t0\t20\n2\t150\t300\t0\t20\nBreak\t\t\t\t15\n3\t200\t400\t50\t20"}
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

              <LevelsPreview levels={parsedLevels} />
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
