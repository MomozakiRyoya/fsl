import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  fetchLeagues,
  fetchTeams,
  fetchRounds,
  fetchPlayers,
  fetchPlayerStats,
  fetchNews,
  fetchStandings,
  fetchMatchResults,
  fetchMvpCandidates,
  fetchHeadToHead,
} from "../src/lib/sheets/fetchers";

async function main() {
  console.log("🔍 Sheets fetcher テスト開始\n");

  const leagues = await fetchLeagues();
  console.log(`✅ リーグ:     ${leagues.length}件 - ${leagues.map(l => l.name).join(", ")}`);

  const teams = await fetchTeams();
  console.log(`✅ チーム:     ${teams.length}件`);

  const rounds = await fetchRounds();
  console.log(`✅ 節:         ${rounds.length}件`);

  const standings = await fetchStandings();
  const leagueIds = Object.keys(standings);
  console.log(`✅ 順位表:     ${leagueIds.length}リーグ分`);

  const matchResults = await fetchMatchResults();
  console.log(`✅ 試合結果:   ${matchResults.length}節分`);

  const players = await fetchPlayers();
  console.log(`✅ 選手:       ${players.length}件`);

  const stats = await fetchPlayerStats();
  console.log(`✅ 選手成績:   ${stats.length}件`);

  const news = await fetchNews();
  console.log(`✅ ニュース:   ${news.length}件`);

  const mvp = await fetchMvpCandidates();
  console.log(`✅ MVP候補:    ${mvp.length}件`);

  const h2h = await fetchHeadToHead();
  console.log(`✅ 対戦成績:   ${h2h.length}件`);

  console.log("\n✅ 全フェッチャー正常動作！");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
