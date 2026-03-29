/**
 * 入力用シートのセットアップ（全シート）
 *
 * ✏️ チーム入力         → チーム
 * ✏️ 選手入力           → 選手
 * ✏️ 節入力             → 節
 * ✏️ ニュース入力        → ニュース
 * ✏️ 対戦成績入力        → 対戦成績
 * ✏️ 出場選手入力        → 出場選手（新規）
 * ✏️ 試合結果入力        → 試合結果
 * ✏️ 順位表入力          → 順位表
 * ✏️ MVP候補入力         → MVP候補
 * ✏️ 選手成績入力        → 選手成績
 *
 * 使い方: npx tsx scripts/setup-input-sheets.ts
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
  if (!res.ok) throw new Error(`batchUpdate failed: ${await res.text()}`);
}

function checkboxRequest(sheetId: number) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      rule: { condition: { type: "BOOLEAN" }, showCustomUi: true },
    },
  };
}

function formatButtonRow(sheetId: number, colCount: number) {
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
          backgroundColor: { red: 1.0, green: 0.76, blue: 0.03 },
          textFormat: {
            bold: true,
            foregroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
            fontSize: 11,
          },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  };
}

function formatHeaderRow(sheetId: number, colCount: number) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 2,
        startColumnIndex: 0,
        endColumnIndex: colCount,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.13, green: 0.69, blue: 0.3 },
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

function freezeRows(sheetId: number) {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 2 } },
      fields: "gridProperties.frozenRowCount",
    },
  };
}

function rangeDropdown(
  sheetId: number,
  colIndex: number,
  sourceSheet: string,
  sourceCol: string,
  maxRow = 300,
) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 2,
        endRowIndex: 5000,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      rule: {
        condition: {
          type: "ONE_OF_RANGE",
          values: [
            {
              userEnteredValue: `=${sourceSheet}!$${sourceCol}$2:$${sourceCol}$${maxRow}`,
            },
          ],
        },
        showCustomUi: true,
        strict: false,
      },
    },
  };
}

function listDropdown(sheetId: number, colIndex: number, values: string[]) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 2,
        endRowIndex: 5000,
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

async function ensureInputSheet(
  doc: GoogleSpreadsheet,
  title: string,
  headers: string[],
) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title });
    console.log(`  ✅ "${title}" を作成`);
  } else {
    await sheet.clear();
    console.log(`  🔄 "${title}" をリセット`);
  }

  await sheet.loadCells("A1:Z2");
  sheet.getCell(0, 0).value = false;
  sheet.getCell(0, 1).value = "← チェックをいれると同期実行";
  sheet.getCell(0, 2).value = "最終同期:";
  headers.forEach((h, i) => {
    sheet!.getCell(1, i).value = h;
  });
  await sheet.saveUpdatedCells();

  return sheet;
}

async function main() {
  console.log("✏️  全入力シートのセットアップ開始...\n");

  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("❌ 環境変数が設定されていません");
    process.exit(1);
  }

  const doc = await getDoc();
  console.log(`📊 スプレッドシート: ${doc.title}\n`);
  console.log("シート作成中...");

  // ── マスターデータ系 ────────────────────────────────────────────────────────

  // ✏️ チーム入力
  // ID(0) チーム名(1) リーグ名(2) ホームカラー(3) キャプテン(4) 説明(5) ロゴURL(6) TwitterURL(7) InstagramURL(8) 公開中(9)
  const teamInput = await ensureInputSheet(doc, "✏️ チーム入力", [
    "ID",
    "チーム名",
    "リーグ名",
    "ホームカラー",
    "キャプテン",
    "説明",
    "ロゴURL",
    "TwitterURL",
    "InstagramURL",
    "公開中",
  ]);

  // ✏️ 選手入力
  // ID(0) 選手名(1) チーム名(2) リーグ名(3) 背番号(4)
  const playerInput = await ensureInputSheet(doc, "✏️ 選手入力", [
    "ID",
    "選手名",
    "チーム名",
    "リーグ名",
    "背番号",
  ]);

  // ✏️ 節入力
  // ID(0) 節名(1) リーグ名(2) 節番号(3) 開催日(4) 会場(5) 会場URL(6) 状態(7) プレーオフ(8)
  const roundInput = await ensureInputSheet(doc, "✏️ 節入力", [
    "ID",
    "節名",
    "リーグ名",
    "節番号",
    "開催日",
    "会場",
    "会場URL",
    "状態",
    "プレーオフ",
  ]);

  // ✏️ ニュース入力
  // ID(0) タイトル(1) スラッグ(2) カテゴリ(3) 公開日(4) サムネイルURL(5) 本文(6) 公開中(7) シーズンID(8)
  const newsInput = await ensureInputSheet(doc, "✏️ ニュース入力", [
    "ID",
    "タイトル",
    "スラッグ",
    "カテゴリ",
    "公開日",
    "サムネイルURL",
    "本文",
    "公開中",
    "シーズンID",
  ]);

  // ✏️ 対戦成績入力
  // チームA(0) チームB(1) 勝(2) 分(3) 負(4) チームA得点(5) チームB得点(6)
  const h2hInput = await ensureInputSheet(doc, "✏️ 対戦成績入力", [
    "チームA",
    "チームB",
    "勝",
    "分",
    "負",
    "チームA得点",
    "チームB得点",
  ]);

  // ── 試合運営系 ───────────────────────────────────────────────────────────────

  // ✏️ 出場選手入力（新規）
  // 節名(0) リーグ名(1) チーム名(2) 選手名(3) 背番号(4)
  const lineupInput = await ensureInputSheet(doc, "✏️ 出場選手入力", [
    "節名",
    "リーグ名",
    "チーム名",
    "選手名",
    "背番号",
  ]);

  // ✏️ 試合結果入力（既存）
  const matchInput = await ensureInputSheet(doc, "✏️ 試合結果入力", [
    "節名",
    "リーグ名",
    "チーム名",
    "順位",
    "得点pt",
  ]);

  // ✏️ 順位表入力（既存）
  const standingsInput = await ensureInputSheet(doc, "✏️ 順位表入力", [
    "リーグ名",
    "チーム名",
    "順位",
    "合計pt",
    "節別pt(JSON形式)",
  ]);

  // ✏️ MVP候補入力（既存）
  const mvpInput = await ensureInputSheet(doc, "✏️ MVP候補入力", [
    "節名",
    "選手名",
    "チーム名",
  ]);

  // ✏️ 選手成績入力（既存）
  const statsInput = await ensureInputSheet(doc, "✏️ 選手成績入力", [
    "選手名",
    "チーム名",
    "リーグ名",
    "ゴール",
    "アシスト",
    "試合数",
    "MVP数",
  ]);

  // ✏️ スタック入力（試合中のブレイク時に記入）
  // 節名(0) リーグ名(1) チーム名(2) ブレイク番号(3) 選手名(4) スタック数(5)
  const stackInput = await ensureInputSheet(doc, "✏️ スタック入力", [
    "節名",
    "リーグ名",
    "チーム名",
    "ブレイク番号",
    "選手名",
    "スタック数",
  ]);

  // ── batchUpdate: 書式・チェックボックス・ドロップダウン ────────────────────
  console.log("\n書式・ドロップダウン設定中...");

  const requests: object[] = [
    // ── チーム入力
    checkboxRequest(teamInput.sheetId),
    formatButtonRow(teamInput.sheetId, 10),
    formatHeaderRow(teamInput.sheetId, 10),
    freezeRows(teamInput.sheetId),
    rangeDropdown(teamInput.sheetId, 2, "リーグ", "B"), // リーグ名
    listDropdown(teamInput.sheetId, 9, ["TRUE", "FALSE"]), // 公開中

    // ── 選手入力
    checkboxRequest(playerInput.sheetId),
    formatButtonRow(playerInput.sheetId, 5),
    formatHeaderRow(playerInput.sheetId, 5),
    freezeRows(playerInput.sheetId),
    rangeDropdown(playerInput.sheetId, 2, "チーム", "B"), // チーム名
    rangeDropdown(playerInput.sheetId, 3, "リーグ", "B"), // リーグ名

    // ── 節入力
    checkboxRequest(roundInput.sheetId),
    formatButtonRow(roundInput.sheetId, 9),
    formatHeaderRow(roundInput.sheetId, 9),
    freezeRows(roundInput.sheetId),
    rangeDropdown(roundInput.sheetId, 2, "リーグ", "B"), // リーグ名
    listDropdown(roundInput.sheetId, 7, ["scheduled", "next", "finished"]), // 状態
    listDropdown(roundInput.sheetId, 8, ["FALSE", "TRUE"]), // プレーオフ

    // ── ニュース入力
    checkboxRequest(newsInput.sheetId),
    formatButtonRow(newsInput.sheetId, 9),
    formatHeaderRow(newsInput.sheetId, 9),
    freezeRows(newsInput.sheetId),
    listDropdown(newsInput.sheetId, 3, ["結果", "お知らせ", "イベント"]), // カテゴリ
    listDropdown(newsInput.sheetId, 7, ["TRUE", "FALSE"]), // 公開中

    // ── 対戦成績入力
    checkboxRequest(h2hInput.sheetId),
    formatButtonRow(h2hInput.sheetId, 7),
    formatHeaderRow(h2hInput.sheetId, 7),
    freezeRows(h2hInput.sheetId),
    rangeDropdown(h2hInput.sheetId, 0, "チーム", "B"), // チームA
    rangeDropdown(h2hInput.sheetId, 1, "チーム", "B"), // チームB

    // ── 出場選手入力
    checkboxRequest(lineupInput.sheetId),
    formatButtonRow(lineupInput.sheetId, 5),
    formatHeaderRow(lineupInput.sheetId, 5),
    freezeRows(lineupInput.sheetId),
    rangeDropdown(lineupInput.sheetId, 0, "節", "B"), // 節名
    rangeDropdown(lineupInput.sheetId, 1, "リーグ", "B"), // リーグ名
    rangeDropdown(lineupInput.sheetId, 2, "チーム", "B"), // チーム名
    rangeDropdown(lineupInput.sheetId, 3, "選手", "B"), // 選手名

    // ── 試合結果入力
    checkboxRequest(matchInput.sheetId),
    formatButtonRow(matchInput.sheetId, 5),
    formatHeaderRow(matchInput.sheetId, 5),
    freezeRows(matchInput.sheetId),
    rangeDropdown(matchInput.sheetId, 0, "節", "B"),
    rangeDropdown(matchInput.sheetId, 1, "リーグ", "B"),
    rangeDropdown(matchInput.sheetId, 2, "チーム", "B"),

    // ── 順位表入力
    checkboxRequest(standingsInput.sheetId),
    formatButtonRow(standingsInput.sheetId, 5),
    formatHeaderRow(standingsInput.sheetId, 5),
    freezeRows(standingsInput.sheetId),
    rangeDropdown(standingsInput.sheetId, 0, "リーグ", "B"),
    rangeDropdown(standingsInput.sheetId, 1, "チーム", "B"),

    // ── MVP候補入力
    checkboxRequest(mvpInput.sheetId),
    formatButtonRow(mvpInput.sheetId, 3),
    formatHeaderRow(mvpInput.sheetId, 3),
    freezeRows(mvpInput.sheetId),
    rangeDropdown(mvpInput.sheetId, 0, "節", "B"),
    rangeDropdown(mvpInput.sheetId, 1, "選手", "B"),
    rangeDropdown(mvpInput.sheetId, 2, "チーム", "B"),

    // ── 選手成績入力
    checkboxRequest(statsInput.sheetId),
    formatButtonRow(statsInput.sheetId, 7),
    formatHeaderRow(statsInput.sheetId, 7),
    freezeRows(statsInput.sheetId),
    rangeDropdown(statsInput.sheetId, 0, "選手", "B"),
    rangeDropdown(statsInput.sheetId, 1, "チーム", "B"),
    rangeDropdown(statsInput.sheetId, 2, "リーグ", "B"),

    // ── スタック入力
    checkboxRequest(stackInput.sheetId),
    formatButtonRow(stackInput.sheetId, 6),
    formatHeaderRow(stackInput.sheetId, 6),
    freezeRows(stackInput.sheetId),
    rangeDropdown(stackInput.sheetId, 0, "節", "B"), // 節名
    rangeDropdown(stackInput.sheetId, 1, "リーグ", "B"), // リーグ名
    rangeDropdown(stackInput.sheetId, 2, "チーム", "B"), // チーム名
    rangeDropdown(stackInput.sheetId, 4, "選手", "B"), // 選手名
  ];

  await batchUpdate(requests);

  console.log("\n✅ 全入力シートのセットアップ完了！");
  console.log("\n作成したシート（11枚）:");
  console.log(
    "  マスター: ✏️ チーム入力 / ✏️ 選手入力 / ✏️ 節入力 / ✏️ ニュース入力 / ✏️ 対戦成績入力",
  );
  console.log(
    "  試合運営: ✏️ 出場選手入力 / ✏️ 試合結果入力 / ✏️ 順位表入力 / ✏️ MVP候補入力 / ✏️ 選手成績入力 / ✏️ スタック入力",
  );
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
