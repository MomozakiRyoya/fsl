/**
 * Google Sheets セットアップスクリプト
 * - 旧英語シートの削除
 * - 各シートにヘッダー固定・ドロップダウン設定
 * - 「使い方」シートの作成
 *
 * 使い方: npx tsx scripts/setup-sheets.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL!;
const RAW_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY!;
const PRIVATE_KEY = RAW_KEY.replace(/\\n/g, "\n");

let auth: JWT;

async function getDoc(): Promise<GoogleSpreadsheet> {
  auth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  return doc;
}

/** Sheets API batchUpdate を直接呼ぶ */
async function batchUpdate(requests: object[]) {
  const { token } = await auth.getAccessToken();
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`batchUpdate failed: ${err}`);
  }
}

/** ONE_OF_LIST ドロップダウン */
function dropdownRule(
  sheetId: number,
  colIndex: number,
  values: string[],
  startRow = 1,
) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: 10000,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: values.map((v) => ({ userEnteredValue: v })),
        },
        showCustomUi: true,
        strict: false,
      },
    },
  };
}

/** ヘッダー行を固定 */
function freezeRow(sheetId: number) {
  return {
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: { frozenRowCount: 1 },
      },
      fields: "gridProperties.frozenRowCount",
    },
  };
}

/** ヘッダー行を太字・背景色 */
function formatHeader(sheetId: number, colCount: number) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: colCount,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.22, green: 0.46, blue: 0.93 },
          textFormat: {
            bold: true,
            foregroundColor: { red: 1, green: 1, blue: 1 },
          },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  };
}

async function main() {
  console.log("🔧 Google Sheets セットアップ開始...\n");

  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("❌ 環境変数が設定されていません");
    process.exit(1);
  }

  const doc = await getDoc();
  console.log(`📊 スプレッドシート: ${doc.title}\n`);

  // ── 旧英語シートの削除 ──────────────────────────────────────────────────────
  const oldSheets = [
    "leagues",
    "teams",
    "rounds",
    "standings",
    "match_results",
    "players",
    "player_stats",
    "news",
    "mvp_candidates",
    "head_to_head",
  ];
  console.log("🗑️  旧英語シートを削除...");
  for (const title of oldSheets) {
    const sheet = doc.sheetsByTitle[title];
    if (sheet) {
      await sheet.delete();
      console.log(`  ✅ "${title}" を削除`);
    }
  }

  // ── ドロップダウン・書式設定 ────────────────────────────────────────────────
  console.log("\n📋 ドロップダウン・書式設定...");

  const requests: object[] = [];

  // チーム (isActive: col 11)
  const sheetTeams = doc.sheetsByTitle["チーム"];
  if (sheetTeams) {
    requests.push(
      dropdownRule(sheetTeams.sheetId, 11, ["TRUE", "FALSE"]),
      freezeRow(sheetTeams.sheetId),
      formatHeader(sheetTeams.sheetId, 12),
    );
    console.log("  ✅ チーム");
  }

  // 節 (status: col 8, isPlayoff: col 9)
  const sheetRounds = doc.sheetsByTitle["節"];
  if (sheetRounds) {
    requests.push(
      dropdownRule(sheetRounds.sheetId, 8, ["scheduled", "next", "finished"]),
      dropdownRule(sheetRounds.sheetId, 9, ["FALSE", "TRUE"]),
      freezeRow(sheetRounds.sheetId),
      formatHeader(sheetRounds.sheetId, 10),
    );
    console.log("  ✅ 節");
  }

  // 順位表 (ヘッダー固定のみ)
  const sheetStandings = doc.sheetsByTitle["順位表"];
  if (sheetStandings) {
    requests.push(
      freezeRow(sheetStandings.sheetId),
      formatHeader(sheetStandings.sheetId, 7),
    );
    console.log("  ✅ 順位表");
  }

  // 試合結果 (ヘッダー固定のみ)
  const sheetMatchResults = doc.sheetsByTitle["試合結果"];
  if (sheetMatchResults) {
    requests.push(
      freezeRow(sheetMatchResults.sheetId),
      formatHeader(sheetMatchResults.sheetId, 5),
    );
    console.log("  ✅ 試合結果");
  }

  // 選手 (position: col 5)
  const sheetPlayers = doc.sheetsByTitle["選手"];
  if (sheetPlayers) {
    requests.push(
      dropdownRule(sheetPlayers.sheetId, 5, ["FP", "GK"]),
      freezeRow(sheetPlayers.sheetId),
      formatHeader(sheetPlayers.sheetId, 7),
    );
    console.log("  ✅ 選手");
  }

  // 選手成績 (ヘッダー固定のみ)
  const sheetPlayerStats = doc.sheetsByTitle["選手成績"];
  if (sheetPlayerStats) {
    requests.push(
      freezeRow(sheetPlayerStats.sheetId),
      formatHeader(sheetPlayerStats.sheetId, 9),
    );
    console.log("  ✅ 選手成績");
  }

  // ニュース (category: col 3, isPublished: col 7)
  const sheetNews = doc.sheetsByTitle["ニュース"];
  if (sheetNews) {
    requests.push(
      dropdownRule(sheetNews.sheetId, 3, ["結果", "お知らせ", "イベント"]),
      dropdownRule(sheetNews.sheetId, 7, ["TRUE", "FALSE"]),
      freezeRow(sheetNews.sheetId),
      formatHeader(sheetNews.sheetId, 9),
    );
    console.log("  ✅ ニュース");
  }

  // MVP候補 (ヘッダー固定のみ)
  const sheetMvp = doc.sheetsByTitle["MVP候補"];
  if (sheetMvp) {
    requests.push(
      freezeRow(sheetMvp.sheetId),
      formatHeader(sheetMvp.sheetId, 4),
    );
    console.log("  ✅ MVP候補");
  }

  // リーグ (ヘッダー固定のみ)
  const sheetLeagues = doc.sheetsByTitle["リーグ"];
  if (sheetLeagues) {
    requests.push(
      freezeRow(sheetLeagues.sheetId),
      formatHeader(sheetLeagues.sheetId, 8),
    );
    console.log("  ✅ リーグ");
  }

  // 対戦成績 (ヘッダー固定のみ)
  const sheetH2H = doc.sheetsByTitle["対戦成績"];
  if (sheetH2H) {
    requests.push(
      freezeRow(sheetH2H.sheetId),
      formatHeader(sheetH2H.sheetId, 9),
    );
    console.log("  ✅ 対戦成績");
  }

  if (requests.length > 0) {
    await batchUpdate(requests);
  }

  // ── 使い方シートの作成 ────────────────────────────────────────────────────
  console.log("\n📖 使い方シートを作成...");

  let guideSheet = doc.sheetsByTitle["📖 使い方"];
  if (guideSheet) {
    await guideSheet.clear();
    await guideSheet.setHeaderRow(["項目", "内容", "補足"]);
  } else {
    guideSheet = await doc.addSheet({
      title: "📖 使い方",
      headerValues: ["項目", "内容", "補足"],
    });
  }

  const guideRows = [
    // ════════════════════════════════════════════════════════════
    ["━━ システム概要 ━━", "", ""],
    [
      "このスプレッドシートの役割",
      "FSLサイトのデータをすべてここで管理します。シートを編集するとサイトに自動反映されます。",
      "反映まで最大5分かかります（キャッシュ更新）",
    ],
    [
      "シートの種類",
      "2種類あります: 📊データシート（青ヘッダー）と ✏️入力シート（緑ヘッダー）",
      "",
    ],
    [
      "📊 データシート",
      "サイトが直接読み取るシート。原則として直接編集しない。",
      "リーグ / チーム / 節 / 順位表 / 試合結果 / 選手 / 選手成績 / ニュース / MVP候補 / 対戦成績",
    ],
    [
      "✏️ 入力シート",
      "スタッフが入力する専用シート。チェックボックスで📊データシートに同期。",
      "✏️ 試合結果入力 / ✏️ 順位表入力 / ✏️ MVP候補入力 / ✏️ 選手成績入力",
    ],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ Apps Script の初期設定（初回のみ）━━", "", ""],
    [
      "① Apps Scriptを開く",
      "スプレッドシートの上部メニュー「拡張機能」→「Apps Script」をクリック",
      "",
    ],
    [
      "② コードを貼り付ける",
      "apps-script.gs の内容を全選択してエディタに貼り付け、保存（Ctrl+S）",
      "Claudeに「apps-script.gsの内容を教えて」と聞けばコードが表示されます",
    ],
    [
      "③ 権限を許可する",
      "初回実行時に「権限を確認」ダイアログが出たら「許可」を押す",
      "Googleアカウントへのアクセス許可が必要です",
    ],
    [
      "④ 完了確認",
      "シートをリロードすると「🏆 FSL管理」メニューが上部に表示される",
      "表示されない場合はブラウザを再読み込み",
    ],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ 試合当日の運用フロー ━━", "", ""],
    [
      "試合前（節を追加）",
      "「節」シートに新しい節を追加。状態を「next」に変更",
      "状態の選択肢: scheduled（開催前）/ next（次節）/ finished（終了）",
    ],
    [
      "試合前（MVP候補設定）",
      "「✏️ MVP候補入力」シートに節名・選手名を入力 → チェックボックスで同期",
      "各節ごとにMVP候補を設定します",
    ],
    [
      "試合後（結果入力）",
      "「✏️ 試合結果入力」シートに結果を入力 → チェックボックスで同期",
      "チーム名・節名はドロップダウンから選択できます",
    ],
    [
      "試合後（順位表更新）",
      "「✏️ 順位表入力」シートを更新 → チェックボックスで同期",
      '節別ptはJSON形式: {"1":10,"2":7} のように節番号:ポイントで記入',
    ],
    [
      "試合後（選手成績更新）",
      "「✏️ 選手成績入力」シートを更新 → チェックボックスで同期",
      "累計成績を入力します（毎回上書きです）",
    ],
    [
      "試合後（節の状態更新）",
      "「節」シートで終了した節の状態を「finished」に変更",
      "次節がある場合は次の節を「next」に変更",
    ],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ ✏️ 入力シートの使い方 ━━", "", ""],
    [
      "黄色い行（1行目）",
      "同期ボタン行です。A1のチェックボックスをクリックすると同期が実行されます。",
      "同期後は自動でチェックが外れ、右側に実行時刻が表示されます",
    ],
    ["緑の行（2行目）", "ヘッダー行です。編集しないでください。", ""],
    [
      "3行目以降",
      "ここにデータを入力します。チーム名・選手名などはドロップダウンから選択できます。",
      "ドロップダウンの選択肢は各マスターシートから自動取得されます",
    ],
    [
      "同期後の反映",
      "同期するとデータシートが上書きされます。サイトには約5分で反映。",
      "同期前の内容は上書きされます。入力シートがバックアップ代わりです",
    ],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ マスターデータの管理 ━━", "", ""],
    [
      "リーグの追加・変更",
      "「リーグ」シートを直接編集",
      "IDは一度設定したら変更しないこと",
    ],
    [
      "チームの追加・変更",
      "「チーム」シートを直接編集。公開中をFALSEにすると非表示",
      "",
    ],
    [
      "節の追加",
      "「節」シートに新しい行を追加。状態はscheduledから始める",
      "節のIDは後から参照されるので変更しないこと",
    ],
    [
      "選手の追加・変更",
      "「選手」シートを直接編集",
      "選手IDは後から参照されるので変更しないこと",
    ],
    [
      "ニュースの投稿",
      "「ニュース」シートに直接追加。公開中をTRUEにすると公開",
      "本文はMarkdown記法が使えます（## 見出し、**太字** など）",
    ],
    ["対戦成績の更新", "「対戦成績」シートを直接編集", ""],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ 各シートの項目説明 ━━", "", ""],
    // リーグ
    ["【リーグ】", "", ""],
    ["ID", "リーグの識別子（変更不可）", "例: league-a"],
    ["リーグ名", "表示名", "例: Aリーグ"],
    [
      "スラッグ",
      "URLに使われる文字列（英小文字・ハイフンのみ）",
      "例: league-a",
    ],
    ["シーズンID", "所属シーズン", "例: 2025"],
    ["表示順", "タブやリストの並び順（数値）", "1が先頭"],
    ["カラー", "テーマカラー（16進数）", "例: #3B82F6"],
    ["説明", "リーグの説明文", ""],
    ["最大チーム数", "参加できる最大チーム数", "例: 8"],
    ["", "", ""],
    // チーム
    ["【チーム】", "", ""],
    ["ID", "チームの識別子（変更不可）", "例: team-alpha"],
    ["チーム名", "表示名", "例: チームアルファ"],
    ["スラッグ", "URLに使われる文字列", "例: team-alpha"],
    ["リーグID", "所属リーグのID（リーグシートのIDと一致）", "例: league-a"],
    ["リーグ名", "表示用のリーグ名", "例: Aリーグ"],
    ["ロゴURL", "チームロゴ画像のURL（任意）", "空白でもOK"],
    ["ホームカラー", "チームカラー（16進数）", "例: #3B82F6"],
    ["キャプテン", "キャプテンの名前", "例: 山田 太郎"],
    ["説明", "チームの紹介文", ""],
    ["TwitterURL", "Twitter/XのURL（任意）", "空白でもOK"],
    ["InstagramURL", "InstagramのURL（任意）", "空白でもOK"],
    ["公開中", "TRUE=表示 / FALSE=非表示", "TRUE または FALSE（大文字）"],
    ["", "", ""],
    // 節
    ["【節】", "", ""],
    ["ID", "節の識別子（変更不可）", "例: round-a-1"],
    ["節名", "表示名", "例: 第1節"],
    ["リーグID", "所属リーグID", "例: league-a"],
    ["リーグ名", "表示用リーグ名", "例: Aリーグ"],
    ["節番号", "節の番号（数値）", "例: 1"],
    ["開催日", "開催日（YYYY-MM-DD形式）", "例: 2025-04-01"],
    ["会場", "会場名", "例: ◯◯体育館"],
    ["会場URL", "Google MapsなどのURL（任意）", "空白でもOK"],
    [
      "状態",
      "開催状況（ドロップダウン）",
      "scheduled=開催前 / next=次節 / finished=終了",
    ],
    ["プレーオフ", "プレーオフ節かどうか", "FALSE または TRUE"],
    ["", "", ""],
    // ニュース
    ["【ニュース】", "", ""],
    ["ID", "記事の識別子（変更不可）", "例: news-001"],
    ["タイトル", "記事タイトル", "例: 第1節の結果発表"],
    ["スラッグ", "URL用スラッグ（英小文字・ハイフン）", "例: round1-result"],
    ["カテゴリ", "記事の種類（ドロップダウン）", "結果 / お知らせ / イベント"],
    ["公開日", "表示する公開日（YYYY-MM-DD）", "例: 2025-04-02"],
    ["サムネイルURL", "アイキャッチ画像のURL（任意）", "空白でもOK"],
    ["本文", "記事本文（Markdown記法対応）", "## 見出し / **太字** / - リスト"],
    [
      "公開中",
      "TRUE=公開 / FALSE=下書き",
      "FALSEにするとサイトに表示されません",
    ],
    ["シーズンID", "所属シーズン", "例: 2025"],
    ["", "", ""],
    // 選手
    ["【選手】", "", ""],
    ["ID", "選手の識別子（変更不可）", "例: player-001"],
    ["選手名", "フルネーム", "例: 田中 一郎"],
    ["チームID", "所属チームID", "例: team-alpha"],
    ["チーム名", "表示用チーム名", "例: チームアルファ"],
    ["リーグID", "所属リーグID", "例: league-a"],
    [
      "ポジション",
      "FP or GK（ドロップダウン）",
      "FP=フィールドプレーヤー / GK=ゴールキーパー",
    ],
    ["背番号", "ユニフォーム番号（数値）", "例: 10"],
    ["", "", ""],

    // ════════════════════════════════════════════════════════════
    ["━━ よくあるエラーと対処法 ━━", "", ""],
    [
      "「節名が見つかりません」",
      "入力シートの節名が「節」シートの節名と完全一致していない",
      "ドロップダウンから選択し直してください",
    ],
    [
      "「チーム名が見つかりません」",
      "入力シートのチーム名が「チーム」シートのチーム名と一致していない",
      "ドロップダウンから選択し直してください",
    ],
    [
      "サイトに反映されない",
      "編集後5分以内の場合はお待ちください。5分経っても反映されない場合はキャッシュの問題かもしれません",
      "管理者に連絡してください（手動でキャッシュをクリアできます）",
    ],
    [
      "チェックしても同期されない",
      "Apps Scriptが設定されていない可能性があります",
      "「拡張機能」→「Apps Script」を確認してください",
    ],
    [
      "ドロップダウンに選択肢が出ない",
      "参照先のマスターシートが空になっている可能性があります",
      "リーグ・チーム・節・選手シートにデータがあるか確認してください",
    ],
    [
      "TRUE/FALSEが効かない",
      "小文字の true/false は無効です",
      "必ず大文字の TRUE または FALSE を入力してください（ドロップダウンを使うと安全）",
    ],
  ];

  await guideSheet.addRows(
    guideRows as unknown as Record<string, string | number | boolean>[],
  );

  // 使い方シートの書式
  await batchUpdate([
    freezeRow(guideSheet.sheetId),
    formatHeader(guideSheet.sheetId, 3),
    // 項目列を太字
    {
      repeatCell: {
        range: {
          sheetId: guideSheet.sheetId,
          startRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
          },
        },
        fields: "userEnteredFormat.textFormat.bold",
      },
    },
    // セクションヘッダー行（【〜】）を薄い背景色に
  ]);

  console.log("  ✅ 「📖 使い方」シートを作成");
  console.log("\n✅ セットアップ完了！");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
