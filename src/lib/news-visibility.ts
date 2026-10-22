import type { NewsItem } from "./types/app";

/** 公開画面に出してよい記事だけを残す。管理画面で非公開にした記事（is_published=false）を落とし、並びは変えない */
export function onlyPublished(news: NewsItem[]): NewsItem[] {
  return news.filter((n) => n.isPublished);
}
