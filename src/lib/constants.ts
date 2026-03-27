export const LEAGUES = [
  'Division 1',
  'Division 2',
  'Division 3',
  'Division 4',
  'Division 5',
  'Division 6',
] as const

export const ROUND_STATUS_LABELS: Record<string, string> = {
  scheduled: '予定',
  next: '次節',
  finished: '終了',
}

export const NEWS_CATEGORY_COLORS: Record<string, string> = {
  '結果': 'bg-emerald-100 text-emerald-700',
  'お知らせ': 'bg-primary-100 text-primary-700',
  'イベント': 'bg-amber-100 text-amber-700',
}
