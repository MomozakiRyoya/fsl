/**
 * FSL Google Sheets 管理スクリプト
 *
 * 設置方法:
 *   スプレッドシート → 拡張機能 → Apps Script → このコードを全選択して貼り付けて保存（Ctrl+S）
 *   関数「onOpen」を選択して▶実行 → 権限許可 → シートをリロード
 */

// ── チェックボックスで自動同期 ─────────────────────────────────────────────────

function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const name  = sheet.getName();
  const row   = e.range.getRow();
  const col   = e.range.getColumn();

  if (row !== 1 || col !== 1 || e.value !== "TRUE") return;

  const syncMap = {
    "✏️ チーム入力":    syncTeams_,
    "✏️ 選手入力":      syncPlayers_,
    "✏️ 節入力":        syncRounds_,
    "✏️ ニュース入力":  syncNews_,
    "✏️ 対戦成績入力":  syncHeadToHead_,
    "✏️ 出場選手入力":  syncLineups_,
    "✏️ 試合結果入力":  syncMatchResults_,
    "✏️ 順位表入力":    syncStandings_,
    "✏️ MVP候補入力":   syncMvpCandidates_,
    "✏️ 選手成績入力":  syncPlayerStats_,
    "✏️ スタック入力":  syncStacks_,
  };

  const fn = syncMap[name];
  if (!fn) return;

  fn();
  sheet.getRange("A1").setValue(false);
  sheet.getRange("D1").setValue(
    Utilities.formatDate(new Date(), "Asia/Tokyo", "MM/dd HH:mm 同期済み")
  );
}

// ── メニュー ──────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏆 FSL管理")
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("📋 マスターデータ")
        .addItem("チームを同期",     "syncTeams")
        .addItem("選手を同期",       "syncPlayers")
        .addItem("節を同期",         "syncRounds")
        .addItem("ニュースを同期",   "syncNews")
        .addItem("対戦成績を同期",   "syncHeadToHead")
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("⚽ 試合運営")
        .addItem("出場選手を同期",   "syncLineups")
        .addItem("試合結果を同期",   "syncMatchResults")
        .addItem("順位表を同期",     "syncStandings")
        .addItem("MVP候補を同期",    "syncMvpCandidates")
        .addItem("選手成績を同期",   "syncPlayerStats")
        .addItem("スタックを同期",   "syncStacks")
    )
    .addSeparator()
    .addItem("🔄 すべて同期", "syncAll")
    .addToUi();
}

// メニューから呼ぶラッパー（完了ダイアログあり）
function syncTeams()       { syncTeams_();       showDone("チーム"); }
function syncPlayers()     { syncPlayers_();     showDone("選手"); }
function syncRounds()      { syncRounds_();      showDone("節"); }
function syncNews()        { syncNews_();        showDone("ニュース"); }
function syncHeadToHead()  { syncHeadToHead_();  showDone("対戦成績"); }
function syncLineups()     { syncLineups_();     showDone("出場選手"); }
function syncMatchResults(){ syncMatchResults_();showDone("試合結果"); }
function syncStandings()   { syncStandings_();   showDone("順位表"); }
function syncMvpCandidates(){ syncMvpCandidates_(); showDone("MVP候補"); }
function syncPlayerStats() { syncPlayerStats_(); showDone("選手成績"); }
function syncStacks()      { syncStacks_();      showDone("スタック"); }

function syncAll() {
  syncTeams_(); syncPlayers_(); syncRounds_(); syncNews_(); syncHeadToHead_();
  syncLineups_(); syncMatchResults_(); syncStandings_(); syncMvpCandidates_(); syncPlayerStats_(); syncStacks_();
  SpreadsheetApp.getUi().alert("✅ すべての同期が完了しました！\nサイトには約5分で反映されます。");
}

function showDone(label) {
  SpreadsheetApp.getUi().alert("✅ " + label + "の同期が完了しました！\nサイトには約5分で反映されます。");
}

// ── ユーティリティ ────────────────────────────────────────────────────────────

/** データシート（行1=ヘッダー、行2+=データ）を取得 */
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("シートが見つかりません: " + sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

/** 入力シート（行1=ボタン、行2=ヘッダー、行3+=データ）を取得 */
function getInputData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("シートが見つかりません: " + sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 3 || lastCol < 1) return [];
  const headers = sheet.getRange(2, 1, 1, lastCol).getValues()[0];
  const data    = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();
  return data
    .map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    })
    .filter(function(row) { return row[headers[0]] !== "" && row[headers[0]] !== null; });
}

/** データシートの中身を上書き */
function writeSheetData(sheetName, headers, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  if (rows.length === 0) return;
  const data = rows.map(function(row) {
    return headers.map(function(h) { return row[h] !== undefined ? row[h] : ""; });
  });
  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
}

/** 名前→IDのルックアップマップ */
function buildNameMap(sheetName, nameCol, idCol) {
  const map = {};
  getSheetData(sheetName).forEach(function(row) {
    if (row[nameCol]) map[String(row[nameCol])] = row[idCol];
  });
  return map;
}

/** 文字列をIDスラッグに変換（日本語はそのまま + 連番で一意化） */
function toId(text, prefix) {
  const base = (prefix || "") + String(text)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 40);
  return base || "item-" + Date.now();
}

// ── チームの同期 ──────────────────────────────────────────────────────────────

function syncTeams_() {
  const inputRows = getInputData("✏️ チーム入力");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const teamName   = String(row["チーム名"]  || "");
    const leagueName = String(row["リーグ名"]  || "");
    const id         = String(row["ID"] || "") || toId(teamName, "team-");
    const leagueId   = leagueMap[leagueName];

    if (!leagueId) errors.push((i+3) + "行目: リーグ名「" + leagueName + "」が見つかりません");
    if (leagueId) {
      outputRows.push({
        ID: id,
        チーム名:       teamName,
        スラッグ:       String(row["ID"] || "") || toId(teamName),
        リーグID:       leagueId,
        リーグ名:       leagueName,
        ロゴURL:        row["ロゴURL"]        || "",
        ホームカラー:   row["ホームカラー"]   || "#3B82F6",
        キャプテン:     row["キャプテン"]     || "",
        説明:           row["説明"]           || "",
        TwitterURL:     row["TwitterURL"]     || "",
        InstagramURL:   row["InstagramURL"]   || "",
        公開中:         row["公開中"] === "FALSE" ? "FALSE" : "TRUE",
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("チーム",
    ["ID","チーム名","スラッグ","リーグID","リーグ名","ロゴURL","ホームカラー","キャプテン","説明","TwitterURL","InstagramURL","公開中"],
    outputRows);
}

// ── 選手の同期 ────────────────────────────────────────────────────────────────

function syncPlayers_() {
  const inputRows = getInputData("✏️ 選手入力");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const playerName = String(row["選手名"]   || "");
    const teamName   = String(row["チーム名"] || "");
    const leagueName = String(row["リーグ名"] || "");
    const id         = String(row["ID"] || "") || toId(playerName, "player-");
    const teamId     = teamMap[teamName];
    const leagueId   = leagueMap[leagueName];

    if (!teamId)   errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");
    if (!leagueId) errors.push((i+3) + "行目: リーグ名「" + leagueName + "」が見つかりません");
    if (teamId && leagueId) {
      outputRows.push({
        ID: id, 選手名: playerName, チームID: teamId, チーム名: teamName,
        リーグID: leagueId, 背番号: Number(row["背番号"]) || 0,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("選手", ["ID","選手名","チームID","チーム名","リーグID","背番号"], outputRows);
}

// ── 節の同期 ──────────────────────────────────────────────────────────────────

function syncRounds_() {
  const inputRows = getInputData("✏️ 節入力");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const nodeName   = String(row["節名"]    || "");
    const leagueName = String(row["リーグ名"] || "");
    const id         = String(row["ID"] || "") || toId(nodeName, "round-");
    const leagueId   = leagueMap[leagueName];

    if (!leagueId) errors.push((i+3) + "行目: リーグ名「" + leagueName + "」が見つかりません");
    if (leagueId) {
      outputRows.push({
        ID: id, 節名: nodeName, リーグID: leagueId, リーグ名: leagueName,
        節番号: Number(row["節番号"]) || 0,
        開催日: row["開催日"] || "",
        会場: row["会場"] || "",
        会場URL: row["会場URL"] || "",
        状態: row["状態"] || "scheduled",
        プレーオフ: row["プレーオフ"] === "TRUE" ? "TRUE" : "FALSE",
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("節", ["ID","節名","リーグID","リーグ名","節番号","開催日","会場","会場URL","状態","プレーオフ"], outputRows);
}

// ── ニュースの同期 ────────────────────────────────────────────────────────────

function syncNews_() {
  const inputRows = getInputData("✏️ ニュース入力");
  const outputRows = [];

  inputRows.forEach(function(row) {
    const title = String(row["タイトル"] || "");
    const id    = String(row["ID"] || "") || toId(title, "news-");
    const slug  = String(row["スラッグ"] || "") || toId(title);
    outputRows.push({
      ID: id, タイトル: title, スラッグ: slug,
      カテゴリ: row["カテゴリ"] || "お知らせ",
      公開日: row["公開日"] || "",
      サムネイルURL: row["サムネイルURL"] || "",
      本文: row["本文"] || "",
      公開中: row["公開中"] === "FALSE" ? "FALSE" : "TRUE",
      シーズンID: row["シーズンID"] || "2025",
    });
  });

  writeSheetData("ニュース",
    ["ID","タイトル","スラッグ","カテゴリ","公開日","サムネイルURL","本文","公開中","シーズンID"],
    outputRows);
}

// ── 対戦成績の同期 ────────────────────────────────────────────────────────────

function syncHeadToHead_() {
  const inputRows = getInputData("✏️ 対戦成績入力");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const teamAName = String(row["チームA"] || "");
    const teamBName = String(row["チームB"] || "");
    const teamAId   = teamMap[teamAName];
    const teamBId   = teamMap[teamBName];

    if (!teamAId) errors.push((i+3) + "行目: チームA「" + teamAName + "」が見つかりません");
    if (!teamBId) errors.push((i+3) + "行目: チームB「" + teamBName + "」が見つかりません");
    if (teamAId && teamBId) {
      outputRows.push({
        チームAのID: teamAId, チームBのID: teamBId,
        チームA: teamAName, チームB: teamBName,
        勝: Number(row["勝"]) || 0, 分: Number(row["分"]) || 0, 負: Number(row["負"]) || 0,
        チームA得点: Number(row["チームA得点"]) || 0,
        チームB得点: Number(row["チームB得点"]) || 0,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("対戦成績",
    ["チームAのID","チームBのID","チームA","チームB","勝","分","負","チームA得点","チームB得点"],
    outputRows);
}

// ── 出場選手の同期 ────────────────────────────────────────────────────────────

function syncLineups_() {
  const inputRows = getInputData("✏️ 出場選手入力");
  const roundMap  = buildNameMap("節",    "節名",    "ID");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const playerMap = buildNameMap("選手",  "選手名",  "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const nodeName   = String(row["節名"]    || "");
    const leagueName = String(row["リーグ名"] || "");
    const teamName   = String(row["チーム名"] || "");
    const playerName = String(row["選手名"]  || "");
    const roundId    = roundMap[nodeName];
    const leagueId   = leagueMap[leagueName];
    const teamId     = teamMap[teamName];
    const playerId   = playerMap[playerName];

    if (!roundId)  errors.push((i+3) + "行目: 節名「" + nodeName + "」が見つかりません");
    if (!teamId)   errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");
    if (!playerId) errors.push((i+3) + "行目: 選手名「" + playerName + "」が見つかりません");

    if (roundId && teamId && playerId) {
      outputRows.push({
        節ID: roundId, リーグID: leagueId || "", チームID: teamId,
        チーム名: teamName, 選手ID: playerId, 選手名: playerName,
        背番号: Number(row["背番号"]) || 0,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("出場選手",
    ["節ID","リーグID","チームID","チーム名","選手ID","選手名","背番号"],
    outputRows);
}

// ── 試合結果の同期 ────────────────────────────────────────────────────────────

function syncMatchResults_() {
  const inputRows = getInputData("✏️ 試合結果入力");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const roundMap  = buildNameMap("節",    "節名",    "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const nodeName = String(row["節名"]    || "");
    const teamName = String(row["チーム名"] || "");
    const roundId  = roundMap[nodeName];
    const teamId   = teamMap[teamName];

    if (!roundId) errors.push((i+3) + "行目: 節名「" + nodeName + "」が見つかりません");
    if (!teamId)  errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");
    if (roundId && teamId) {
      outputRows.push({
        節ID: roundId, 順位: row["順位"], チームID: teamId,
        チーム名: teamName, 得点pt: row["得点pt"],
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("試合結果", ["節ID","順位","チームID","チーム名","得点pt"], outputRows);
}

// ── 順位表の同期 ──────────────────────────────────────────────────────────────

function syncStandings_() {
  const inputRows  = getInputData("✏️ 順位表入力");
  const leagueMap  = buildNameMap("リーグ", "リーグ名", "ID");
  const teamMap    = buildNameMap("チーム", "チーム名", "ID");
  const logoMap    = buildNameMap("チーム", "チーム名", "ロゴURL");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const leagueName = String(row["リーグ名"] || "");
    const teamName   = String(row["チーム名"] || "");
    const leagueId   = leagueMap[leagueName];
    const teamId     = teamMap[teamName];
    const roundPtRaw = String(row["節別pt(JSON形式)"] || "{}");

    if (!leagueId) errors.push((i+3) + "行目: リーグ名「" + leagueName + "」が見つかりません");
    if (!teamId)   errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");

    let roundPt = "{}";
    try { JSON.parse(roundPtRaw); roundPt = roundPtRaw; }
    catch(e) { errors.push((i+3) + "行目: 節別ptのJSON形式が不正: " + roundPtRaw); }

    if (leagueId && teamId) {
      outputRows.push({
        リーグID: leagueId, 順位: row["順位"], チームID: teamId,
        チーム名: teamName, ロゴURL: logoMap[teamName] || "",
        合計pt: row["合計pt"], "節別pt": roundPt,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("順位表", ["リーグID","順位","チームID","チーム名","ロゴURL","合計pt","節別pt"], outputRows);
}

// ── MVP候補の同期 ─────────────────────────────────────────────────────────────

function syncMvpCandidates_() {
  const inputRows = getInputData("✏️ MVP候補入力");
  const roundMap  = buildNameMap("節",  "節名",   "ID");
  const playerMap = buildNameMap("選手", "選手名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const nodeName   = String(row["節名"]   || "");
    const playerName = String(row["選手名"] || "");
    const teamName   = String(row["チーム名"] || "");
    const roundId    = roundMap[nodeName];
    const playerId   = playerMap[playerName];

    if (!roundId)  errors.push((i+3) + "行目: 節名「" + nodeName + "」が見つかりません");
    if (!playerId) errors.push((i+3) + "行目: 選手名「" + playerName + "」が見つかりません");
    if (roundId && playerId) {
      outputRows.push({ 選手ID: playerId, 選手名: playerName, チーム名: teamName, 節ID: roundId });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("MVP候補", ["選手ID","選手名","チーム名","節ID"], outputRows);
}

// ── 選手成績の同期 ────────────────────────────────────────────────────────────

function syncPlayerStats_() {
  const inputRows = getInputData("✏️ 選手成績入力");
  const playerMap = buildNameMap("選手",  "選手名",  "ID");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const playerName = String(row["選手名"] || "");
    const teamName   = String(row["チーム名"] || "");
    const leagueName = String(row["リーグ名"] || "");
    const playerId   = playerMap[playerName];
    const teamId     = teamMap[teamName];
    const leagueId   = leagueMap[leagueName];

    if (!playerId) errors.push((i+3) + "行目: 選手名「" + playerName + "」が見つかりません");
    if (!teamId)   errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");
    if (!leagueId) errors.push((i+3) + "行目: リーグ名「" + leagueName + "」が見つかりません");

    if (playerId && teamId && leagueId) {
      outputRows.push({
        選手ID: playerId, 選手名: playerName, チームID: teamId,
        チーム名: teamName, リーグID: leagueId,
        ゴール:   Number(row["ゴール"])   || 0,
        アシスト: Number(row["アシスト"]) || 0,
        試合数:   Number(row["試合数"])   || 0,
        MVP数:    Number(row["MVP数"])    || 0,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("選手成績",
    ["選手ID","選手名","チームID","チーム名","リーグID","ゴール","アシスト","試合数","MVP数"],
    outputRows);
}

// ── スタックの同期 ────────────────────────────────────────────────────────────

function syncStacks_() {
  const inputRows = getInputData("✏️ スタック入力");
  const roundMap  = buildNameMap("節",    "節名",    "ID");
  const teamMap   = buildNameMap("チーム", "チーム名", "ID");
  const leagueMap = buildNameMap("リーグ", "リーグ名", "ID");
  const outputRows = [];
  const errors = [];

  inputRows.forEach(function(row, i) {
    const nodeName   = String(row["節名"]       || "");
    const leagueName = String(row["リーグ名"]   || "");
    const teamName   = String(row["チーム名"]   || "");
    const playerName = String(row["選手名"]     || "");
    const stackCount = Number(row["スタック数"] || 0);
    const breakNum   = Number(row["ブレイク番号"] || 0);
    const roundId    = roundMap[nodeName];
    const leagueId   = leagueMap[leagueName];
    const teamId     = teamMap[teamName];

    if (!roundId)  errors.push((i+3) + "行目: 節名「" + nodeName + "」が見つかりません");
    if (!teamId)   errors.push((i+3) + "行目: チーム名「" + teamName + "」が見つかりません");
    if (!playerName) errors.push((i+3) + "行目: 選手名が入力されていません");

    if (roundId && teamId && playerName) {
      outputRows.push({
        節ID: roundId, リーグID: leagueId || "", チームID: teamId,
        チーム名: teamName, 選手名: playerName,
        スタック数: stackCount, ブレイク番号: breakNum,
      });
    }
  });

  if (errors.length > 0) { SpreadsheetApp.getUi().alert("⚠️ エラー:\n" + errors.slice(0,10).join("\n")); return; }
  writeSheetData("スタック",
    ["節ID","リーグID","チームID","チーム名","選手名","スタック数","ブレイク番号"],
    outputRows);
}
