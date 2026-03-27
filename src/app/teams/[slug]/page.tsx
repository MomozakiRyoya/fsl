type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">チーム詳細</h1>
      <p className="text-slate-500 text-sm">{slug}</p>
    </main>
  )
}
