/**
 * 名前を大文字の区切り（小文字の直後の大文字）で分ける。SuperNova → Super / Nova。
 * 分け目に <wbr /> を挟むと、狭い列でも語の途中で割らずに折り返せる。
 * 古い iOS（16.3 以前）は後読みの正規表現で読み込みごと落ちるので、1 文字ずつ見る
 */
export function nameParts(name: string): string[] {
  const parts: string[] = [];
  let start = 0;
  for (let i = 1; i < name.length; i += 1) {
    if (/[a-z]/.test(name[i - 1]) && /[A-Z]/.test(name[i])) {
      parts.push(name.slice(start, i));
      start = i;
    }
  }
  parts.push(name.slice(start));
  return parts;
}
