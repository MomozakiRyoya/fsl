"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("順位") || q.includes("1位"))
    return "現在のDivision 1首位は博多キングスです（52pt）。天神エースが47ptで2位につけています。詳しくは順位表ページをご覧ください。";
  if (q.includes("次") && (q.includes("試合") || q.includes("節")))
    return "次節は第5節です。2026年4月12日（日）にMEGAにて開催予定。Division 1では博多キングスvs天神エースの首位攻防戦が注目です！";
  if (q.includes("得点") || q.includes("ゴール") || q.includes("得点王"))
    return "現在の得点王は博多キングスの加藤蓮選手（18得点）です。2位は天神エースの木村遼選手（15得点）。得点ランキングはホームページでご確認いただけます。";
  if (q.includes("mvp"))
    return "第4節のMVP候補は加藤蓮、木村遼、西村聡の3名です。ホームページのMVP投票で投票できます！";
  if (q.includes("博多キングス") || q.includes("hakata"))
    return "博多キングスはDivision 1首位のチームです（52pt）。キャプテンは田中海斗選手。今シーズンの得点王・加藤蓮選手を擁する優勝最有力候補です。";
  if (q.includes("チーム") && q.includes("数"))
    return "FSL Season 1には全48チームが参加しています。Division 1〜6の6つのディビジョンに分かれ、各8チームが戦います。";
  if (q.includes("場所") || q.includes("会場"))
    return "メイン会場はフットサルポイント福岡MEGAです。会場情報ページでアクセス方法やGoogleマップへのリンクをご確認いただけます。";
  if (q.includes("ルール") || q.includes("形式"))
    return "各節でポイント制を採用しています。順位に応じてポイントが付与され、シーズン終了時の総合ポイントで最終順位が決まります。上位チームはプレーオフへ進出。";
  if (q.includes("ありがとう") || q.includes("ありがとございます"))
    return "どういたしまして！FSLをもっと楽しんでいただけると嬉しいです⚽ 他に何か聞きたいことがあれば何でも聞いてください！";
  return "すみません、その質問には答えられませんでした。「順位」「次の試合」「得点王」「チーム名」などについて聞いてみてください！";
}

const SUGGESTED_QUESTIONS = [
  "現在の1位は？",
  "次の試合はいつ？",
  "得点王は誰？",
];

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "bot",
  text: "こんにちは！FSLについて何でも聞いてください。順位・試合日程・チーム情報などお答えします⚽",
  timestamp: new Date(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSuggestionsVisible(false);
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getBotResponse(text.trim());
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleSuggestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="fixed inset-0 bottom-[58px] flex flex-col max-w-lg mx-auto lg:static lg:h-screen lg:bottom-auto">
      {/* ヘッダー */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{
          background:
            "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            FSL
          </div>
          <div>
            <h1 className="text-sm font-black text-white">FSL アシスタント</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-white/50">オンライン</span>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* ボットアバター */}
            {message.role === "bot" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mb-0.5 shadow-sm"
                style={{
                  background: "#0c1e42",
                  color: "#e3c060",
                }}
              >
                FSL
              </div>
            )}

            {/* メッセージバブル */}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "text-slate-900 font-medium"
                  : "bg-white text-slate-800 border border-slate-100"
              }`}
              style={
                message.role === "user"
                  ? {
                      background:
                        "linear-gradient(135deg, #c9921e 0%, #e3c060 100%)",
                    }
                  : {}
              }
            >
              {message.text}
            </div>
          </div>
        ))}

        {/* 入力中インジケーター */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mb-0.5 shadow-sm"
              style={{ background: "#0c1e42", color: "#e3c060" }}
            >
              FSL
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* おすすめ質問ボタン（初期表示のみ） */}
        {suggestionsVisible && messages.length === 1 && (
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-slate-400 font-medium text-center">
              よく聞かれる質問
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="px-3 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力バー */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="FSLについて質問する..."
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all placeholder:text-slate-400"
            maxLength={500}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: inputText.trim()
                ? "linear-gradient(135deg, #c9921e, #e3c060)"
                : "#e2e8f0",
            }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: inputText.trim() ? "#0c1e42" : "#94a3b8" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
