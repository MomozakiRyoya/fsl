interface Props {
  playlistId: string | null
}

export default function YouTubeSection({ playlistId }: Props) {
  if (!playlistId) return null

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-3">動画</h2>
      <a
        href={`https://www.youtube.com/playlist?list=${playlistId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-slate-200 p-4 text-sm font-medium text-primary-500 hover:bg-gray-50 transition-colors"
      >
        YouTubeプレイリストを見る
      </a>
    </section>
  )
}
