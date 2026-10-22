/**
 * ジョーカーの印（月）。♠♦♣♥ と並べても揃うよう、文字色 1 色の塗りつぶしで描く。
 * 色つきの絵文字は揃わず、文字の ☾ は細い線の形で出るので図形にしている。
 * 大きさは em なので、隣の文字の大きさに付いてくる。
 */
export default function MoonIcon({
  className = "w-[0.8em] h-[0.8em]",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
      />
    </svg>
  );
}
