/**
 * プリフロップ GTO シナリオデータ
 * トーナメント（MTT）コンテキスト
 * スタックは BB 換算
 */

export type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";
export type Action = "fold" | "call" | "raise";
export type FacingAction =
  | "open_opportunity"   // ファーストアクション（オープンするかフォールド）
  | "vs_open"            // オープンに対してコール/3bet/フォールド
  | "vs_3bet"            // 3betに対してコール/4bet/フォールド
  | "vs_shove"           // プッシュに対してコール/フォールド
  | "shove_opportunity"; // ショートスタックでプッシュするかフォールドか

export interface GtoFrequency {
  fold: number;   // 0-100%
  call: number;
  raise: number;
}

export interface GtoScenario {
  id: string;
  hand: string;           // 例: "AKs", "77", "KQo"
  position: Position;
  heroStack: number;      // BB換算
  villainPosition?: Position;
  villainStack?: number;
  facingAction: FacingAction;
  facingSize?: number;    // 相手のベットサイズ（BBで表現）
  players?: number;       // テーブル人数
  frequency: GtoFrequency;
  primaryAction: Action;  // 最も頻度の高いアクション
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export const GTO_SCENARIOS: GtoScenario[] = [
  // ── オープンレンジ ─────────────────────────────────────────────────────────

  {
    id: "open-01",
    hand: "AKs",
    position: "UTG",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 9,
    frequency: { fold: 0, call: 0, raise: 100 },
    primaryAction: "raise",
    explanation: "AKsはUTGからの絶対オープンハンド。6bb程度でオープン。スーテッドなのでポストフロップでもプレイアビリティが高い。",
    difficulty: "easy",
    tags: ["open", "premium", "UTG"],
  },
  {
    id: "open-02",
    hand: "72o",
    position: "BTN",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 6,
    frequency: { fold: 100, call: 0, raise: 0 },
    primaryAction: "fold",
    explanation: "72oはポーカー最弱ハンド。BTNでもフォールド。相手へのアドバンテージが全くない。",
    difficulty: "easy",
    tags: ["open", "trash", "BTN"],
  },
  {
    id: "open-03",
    hand: "K9s",
    position: "CO",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 6,
    frequency: { fold: 5, call: 0, raise: 95 },
    primaryAction: "raise",
    explanation: "K9sはCOからの標準オープン。スーテッドキング系はポジションがあればオープン価値あり。",
    difficulty: "easy",
    tags: ["open", "suited", "CO"],
  },
  {
    id: "open-04",
    hand: "Q8o",
    position: "UTG",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 9,
    frequency: { fold: 95, call: 0, raise: 5 },
    primaryAction: "fold",
    explanation: "Q8oはUTGではフォールド。UTGはアーリーポジションで後のアクションが多く、ハンド要件が高い。Q8oのようなオフスーテッドコネクターは厳しい。",
    difficulty: "easy",
    tags: ["open", "UTG", "marginal"],
  },
  {
    id: "open-05",
    hand: "A5s",
    position: "SB",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 6,
    frequency: { fold: 0, call: 0, raise: 100 },
    primaryAction: "raise",
    explanation: "A5sはSBからのオープン。ナッツロー（A2s〜A5s）はスーテッドなので非常に価値が高い。3bet時もAハイフラッシュドローが作れる。",
    difficulty: "medium",
    tags: ["open", "suited-ace", "SB"],
  },
  {
    id: "open-06",
    hand: "JTo",
    position: "HJ",
    heroStack: 50,
    facingAction: "open_opportunity",
    players: 6,
    frequency: { fold: 30, call: 0, raise: 70 },
    primaryAction: "raise",
    explanation: "JToはHJからのボーダーライン。コネクテッドなので価値はあるがオフスーテッドで厳しい。フォールドも30%程度あるのがGTO。",
    difficulty: "medium",
    tags: ["open", "connector", "HJ", "mixed"],
  },

  // ── vs オープン（3bet / コール / フォールド）───────────────────────────────

  {
    id: "vs-open-01",
    hand: "KQs",
    position: "BB",
    heroStack: 50,
    villainPosition: "BTN",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 5, call: 40, raise: 55 },
    primaryAction: "raise",
    explanation: "KQsはBBでBTNのオープンに対して3betが主なアクション。ポジション不利だが強いハンド。ブラフ3betも混ぜてバランスを保つ。",
    difficulty: "medium",
    tags: ["3bet", "BB", "suited", "vs-BTN"],
  },
  {
    id: "vs-open-02",
    hand: "22",
    position: "BTN",
    heroStack: 50,
    villainPosition: "UTG",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 20, call: 75, raise: 5 },
    primaryAction: "call",
    explanation: "22はUTGオープンに対してBTNからコール。ポケットペアはセットマイニングが目的。UTGのレンジが強いので3betは少ない。ポジションがあるのでコールEV+。",
    difficulty: "medium",
    tags: ["call", "pocket-pair", "BTN", "vs-UTG"],
  },
  {
    id: "vs-open-03",
    hand: "T9o",
    position: "BB",
    heroStack: 50,
    villainPosition: "CO",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 60, call: 35, raise: 5 },
    primaryAction: "fold",
    explanation: "T9oはBBでCOのオープンに対してフォールドが主。ポジション不利かつオフスーテッドのコネクターは厳しい。BBは1BBのディスカウントがあるが、それでもT9oはフォールドがGTO主流。",
    difficulty: "medium",
    tags: ["fold", "BB", "connector", "offsuit"],
  },
  {
    id: "vs-open-04",
    hand: "AQo",
    position: "CO",
    heroStack: 50,
    villainPosition: "UTG",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 10, call: 35, raise: 55 },
    primaryAction: "raise",
    explanation: "AQoはUTGオープンに対してCOから3bet。UTGのレンジに対してAQoはドミネートされることもあるが、3betバリューとして十分。フォールドは基本ない。",
    difficulty: "hard",
    tags: ["3bet", "CO", "AQo", "vs-UTG"],
  },
  {
    id: "vs-open-05",
    hand: "A2s",
    position: "BTN",
    heroStack: 50,
    villainPosition: "CO",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 5, call: 50, raise: 45 },
    primaryAction: "call",
    explanation: "A2sはBTNからCOオープンにコール/3bet混合。スーテッドエースは3betブラフとしても優秀（フロップでAヒットすれば強いが弱いキッカー）。ポジションがあるのでコールも十分OK。",
    difficulty: "hard",
    tags: ["mixed", "BTN", "suited-ace", "vs-CO"],
  },

  // ── vs 3bet ────────────────────────────────────────────────────────────────

  {
    id: "vs-3bet-01",
    hand: "JJ",
    position: "BTN",
    heroStack: 50,
    villainPosition: "BB",
    villainStack: 50,
    facingAction: "vs_3bet",
    facingSize: 8,
    frequency: { fold: 10, call: 55, raise: 35 },
    primaryAction: "call",
    explanation: "JJはBTNオープン→BB 3betに対してコールが主。4betすればQQ+/AKに対してアウトオブポジションになる。コールしてポストフロップで優位を保つのがGTO。",
    difficulty: "hard",
    tags: ["vs-3bet", "JJ", "BTN", "call"],
  },
  {
    id: "vs-3bet-02",
    hand: "AKo",
    position: "CO",
    heroStack: 50,
    villainPosition: "BTN",
    villainStack: 50,
    facingAction: "vs_3bet",
    facingSize: 8,
    frequency: { fold: 0, call: 30, raise: 70 },
    primaryAction: "raise",
    explanation: "AKoはCOオープン→BTN 3betに対して4betが主。AKは強すぎてフォールドはなし。4betしてバリューを積む。",
    difficulty: "medium",
    tags: ["4bet", "AKo", "CO", "vs-3bet"],
  },
  {
    id: "vs-3bet-03",
    hand: "77",
    position: "HJ",
    heroStack: 50,
    villainPosition: "CO",
    villainStack: 50,
    facingAction: "vs_3bet",
    facingSize: 8,
    frequency: { fold: 65, call: 30, raise: 5 },
    primaryAction: "fold",
    explanation: "77はHJオープン→CO 3betに対してフォールドが主。ポジション不利でポケット系は厳しい。セットが入らない限りエクイティが低い。",
    difficulty: "medium",
    tags: ["fold", "77", "HJ", "vs-3bet"],
  },

  // ── ショートスタック（プッシュ/フォールド）────────────────────────────────

  {
    id: "shove-01",
    hand: "A7o",
    position: "BTN",
    heroStack: 12,
    facingAction: "shove_opportunity",
    players: 6,
    frequency: { fold: 0, call: 0, raise: 100 },
    primaryAction: "raise",
    explanation: "A7oは12bbでBTNからオールイン一択。12bb以下ではミンレイズ等の選択肢はなくプッシュ/フォールドのみ。A7oはこのスタックでBTNから100%プッシュ。",
    difficulty: "easy",
    tags: ["shove", "short-stack", "BTN", "ace"],
  },
  {
    id: "shove-02",
    hand: "K4o",
    position: "SB",
    heroStack: 10,
    facingAction: "shove_opportunity",
    players: 6,
    frequency: { fold: 20, call: 0, raise: 80 },
    primaryAction: "raise",
    explanation: "K4oは10bbでSBからほぼプッシュ。SBはBBだけに対するので広めにプッシュ可能。K4oはこのスタックではプッシュ範囲内。",
    difficulty: "medium",
    tags: ["shove", "short-stack", "SB", "king"],
  },
  {
    id: "shove-03",
    hand: "96s",
    position: "UTG",
    heroStack: 15,
    facingAction: "shove_opportunity",
    players: 9,
    frequency: { fold: 85, call: 0, raise: 15 },
    primaryAction: "fold",
    explanation: "96sは15bbでUTGからフォールドが主。UTGはアーリーポジションでコールが多く入りやすい。スーテッドコネクターはポストフロップで強いが15bbのプッシュではエクイティ不足。",
    difficulty: "medium",
    tags: ["fold", "short-stack", "UTG", "connector"],
  },

  // ── vs プッシュ ────────────────────────────────────────────────────────────

  {
    id: "vs-shove-01",
    hand: "QQ",
    position: "BB",
    heroStack: 40,
    villainPosition: "BTN",
    villainStack: 12,
    facingAction: "vs_shove",
    facingSize: 12,
    frequency: { fold: 0, call: 100, raise: 0 },
    primaryAction: "call",
    explanation: "QQはBTN12bbプッシュに対してBBからコール一択。BTNの12bbプッシュレンジに対してQQは圧倒的なエクイティ優位。コール確定。",
    difficulty: "easy",
    tags: ["vs-shove", "QQ", "BB", "call"],
  },
  {
    id: "vs-shove-02",
    hand: "A9o",
    position: "BB",
    heroStack: 40,
    villainPosition: "SB",
    villainStack: 8,
    facingAction: "vs_shove",
    facingSize: 8,
    frequency: { fold: 10, call: 90, raise: 0 },
    primaryAction: "call",
    explanation: "A9oはSB8bbプッシュに対してBBからコールが主。SBの8bbプッシュレンジはかなり広いのでA9oはエクイティ+。BBはすでに1BB入っているのでコールコストが安い。",
    difficulty: "medium",
    tags: ["vs-shove", "A9o", "BB", "call"],
  },
  {
    id: "vs-shove-03",
    hand: "KTo",
    position: "BB",
    heroStack: 40,
    villainPosition: "UTG",
    villainStack: 12,
    facingAction: "vs_shove",
    facingSize: 12,
    frequency: { fold: 55, call: 45, raise: 0 },
    primaryAction: "fold",
    explanation: "KToはUTG12bbプッシュに対してBBからフォールドが主。UTGのプッシュレンジは比較的タイト。KToはAK/KK/QQ/JJ/TT等に対してエクイティ不利になることが多い。",
    difficulty: "hard",
    tags: ["vs-shove", "KTo", "BB", "fold", "UTG-range"],
  },

  // ── バブル・ICMシナリオ ────────────────────────────────────────────────────

  {
    id: "icm-01",
    hand: "AJs",
    position: "BTN",
    heroStack: 25,
    facingAction: "shove_opportunity",
    players: 5,
    frequency: { fold: 0, call: 0, raise: 100 },
    primaryAction: "raise",
    explanation: "AJsはバブル付近でBTNからプッシュ。ICMプレッシャーがあっても25bbでAJsはプッシュ価値がある。スーテッドのため安心感も高い。",
    difficulty: "medium",
    tags: ["shove", "ICM", "bubble", "BTN"],
  },
  {
    id: "icm-02",
    hand: "T9s",
    position: "SB",
    heroStack: 18,
    villainPosition: "BTN",
    villainStack: 50,
    facingAction: "vs_open",
    facingSize: 2.5,
    frequency: { fold: 55, call: 30, raise: 15 },
    primaryAction: "fold",
    explanation: "T9sはバブル付近でビッグスタックのBTNオープンに対してSBからフォールドが主（ICM考慮）。通常であればコール/3betも多いが、ICMプレッシャーがある時はマージナルハンドはフォールドを増やすべき。",
    difficulty: "hard",
    tags: ["fold", "ICM", "bubble", "SB", "T9s"],
  },
];

export const SCENARIO_CATEGORIES = [
  { key: "all", label: "全シナリオ" },
  { key: "open", label: "オープン判断" },
  { key: "vs-open", label: "vs オープン" },
  { key: "vs-3bet", label: "vs 3bet" },
  { key: "shove", label: "プッシュ判断" },
  { key: "vs-shove", label: "vs プッシュ" },
  { key: "ICM", label: "ICM・バブル" },
] as const;

export type CategoryKey = typeof SCENARIO_CATEGORIES[number]["key"];

export function filterScenarios(scenarios: GtoScenario[], category: CategoryKey): GtoScenario[] {
  if (category === "all") return scenarios;
  return scenarios.filter((s) => s.tags.some((t) => t === category || t.startsWith(category)));
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
