import { parseFeedRouteQuery, resolveFeedSlice } from "@/services/feed/feed.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { cursor, query } = parseFeedRouteQuery(
    req.nextUrl.searchParams.get("cursor"),
    req.nextUrl.searchParams.get("query"),
  );

  const result = await resolveFeedSlice(cursor, query);

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  return NextResponse.json(result.body, { headers: result.headers });
}
