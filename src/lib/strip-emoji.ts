// 絵文字として描かれる文字。既定で絵文字になる文字（星・スマホ・肌の色・旗など）と、異体字セレクタ U+FE0F で絵文字にした文字（赤いハートなど）
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F/gu;
// 絵文字の部品（結合子・異体字セレクタ・囲みキーキャップ・タグ文字）
const EMOJI_PARTS = /[\u200D\uFE0E\uFE0F\u20E3\u{E0020}-\u{E007F}]/gu;
// スペード・クラブ・ハート・ダイヤはディビジョンの印なので、絵文字の指定だけ外して文字のまま残す
const SUIT_AS_EMOJI = /([\u2660\u2663\u2665\u2666])\uFE0F/gu;

/** 表示する文字列から絵文字を落とす。落とした跡に残る空白の重なりは 1 つに詰める */
export function stripEmoji(text: string): string {
  return text
    .replace(SUIT_AS_EMOJI, "$1")
    .replace(EMOJI, "")
    .replace(EMOJI_PARTS, "")
    .replace(/ {2,}/g, " ")
    .trim();
}
