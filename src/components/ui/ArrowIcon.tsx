/** 「見る・進む」の矢印。文字と同じ色（currentColor）で描く。 */
export default function ArrowIcon({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path d="M2.5 8h10.5M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}
