// NGワードリスト（コンプラ違反・スパム・暴言）
const NG_WORDS = [
  // 暴言・誹謗中傷
  "死ね", "ころせ", "殺せ", "消えろ", "うざい", "きもい", "馬鹿", "バカ",
  "アホ", "クズ", "ゴミ", "カス", "ブス", "デブ", "頭おかしい", "最悪",
  "氏ね", "しね", "殺す", "ぶっ殺", "ボケ", "クソ",
  // 差別的表現
  "在日", "チョン", "チャンコロ", "ニガー", "土人",
  // 個人情報要求
  "電話番号", "住所", "LINE教えて", "連絡先教えて",
  // スパム
  "儲かる", "副業", "稼げる", "無料でもらえる", "クリックして", "http://", "https://",
  "フォローして", "登録して", "DM送って",
  // English profanity
  "fuck", "shit", "bitch", "asshole", "bastard", "damn",
];

export function containsNgWord(text: string): boolean {
  const lower = text.toLowerCase();
  return NG_WORDS.some((word) => lower.includes(word.toLowerCase()));
}

export function filterContent(text: string): { ok: boolean; reason?: string } {
  if (!text.trim()) {
    return { ok: false, reason: "テキストを入力してください" };
  }
  if (text.length > 500) {
    return { ok: false, reason: "500文字以内で入力してください" };
  }
  if (containsNgWord(text)) {
    return {
      ok: false,
      reason: "不適切な表現が含まれています。コンプラ違反・暴言・スパムは禁止です",
    };
  }
  return { ok: true };
}
