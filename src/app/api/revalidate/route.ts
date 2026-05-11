import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PATHS = [
  "/",
  "/standings",
  "/schedule",
  "/teams",
  "/news",
  "/players",
  "/live",
];
const MAX_PATHS = 10;

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const body = await request.json();

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedPaths: unknown[] = body.paths ?? ALLOWED_PATHS;
  if (!Array.isArray(requestedPaths) || requestedPaths.length > MAX_PATHS) {
    return NextResponse.json({ error: "Invalid paths" }, { status: 400 });
  }

  const paths = requestedPaths.filter(
    (p): p is string => typeof p === "string" && ALLOWED_PATHS.includes(p),
  );

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
