# 教訓メモ

## FSLプロジェクト

- Next.js 15では動的ルートの`params`は`Promise<{ slug: string }>`として受け取り、`await params`で取得する
- Tailwind CSS 4.xは`tailwind.config.ts`ではなく、`globals.css`内の`@theme inline`ブロックでカスタムカラーを定義する
