// 出場選手登録一覧（/admin/roster）の削除まわりの判定。
// 画面（RosterAdminClient）と削除 API（/api/admin/rosters）の両方から使う。

export type RosterId = string | number;

/**
 * 1 回の依頼で消せる件数の上限。これを超える分は画面側で分けて送る。
 * 削除の条件（id の一覧）は DB への URL に載るので、長くなりすぎない件数にしている。
 */
export const MAX_DELETE_IDS = 100;

/**
 * 節の一覧に無い節を指している登録（過去シーズンの残り）を返す。
 * シーズンの切り替えで節は入れ替わるが、登録（rosters）は残るため。
 *
 * 節の一覧が空のとき（取得に失敗したとき）は判定できないので 1 件も返さない。
 * 空の一覧で判定すると全件が「過去分」になり、今シーズンの登録まで消してしまう。
 */
export function findStaleRosters<T extends { round_id: string }>(
  rosters: readonly T[],
  roundIds: readonly string[],
): T[] {
  if (roundIds.length === 0) return [];
  const known = new Set(roundIds);
  return rosters.filter((r) => !known.has(r.round_id));
}

function isRosterId(value: unknown): value is RosterId {
  if (typeof value === "string") return value.length > 0;
  return typeof value === "number" && Number.isSafeInteger(value);
}

/**
 * 削除 API の本文 `{ ids: [...] }` を検証し、重複を除いた id の一覧を返す。
 * 形が違う・空・上限超えのときは null（呼び出し側は 400 で止める）。
 */
export function parseDeleteIds(body: unknown): RosterId[] | null {
  if (typeof body !== "object" || body === null) return null;
  const { ids } = body as { ids?: unknown };
  if (!Array.isArray(ids) || ids.length === 0) return null;
  if (!ids.every(isRosterId)) return null;
  const unique = [...new Set(ids)];
  return unique.length > MAX_DELETE_IDS ? null : unique;
}
