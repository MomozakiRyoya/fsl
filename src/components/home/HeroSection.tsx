import type { Season } from '@/lib/types/app'

interface Props {
  season: Season | null
}

export default function HeroSection({ season }: Props) {
  return (
    <section className="bg-primary-500 rounded-xl p-8 mb-6 text-center text-white">
      <h1 className="text-3xl font-bold mb-2">Fukuoka Super League</h1>
      <p className="text-primary-100">
        {season ? `${season.name} 開催中` : 'シーズン情報を準備中'}
      </p>
    </section>
  )
}
