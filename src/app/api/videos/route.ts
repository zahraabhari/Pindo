import { parseFeedRouteQuery, resolveFeedPage } from "@/services/feed/feed.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { page, query } = parseFeedRouteQuery(
    req.nextUrl.searchParams.get("page"),
    req.nextUrl.searchParams.get("query"),
  );

  const result = await resolveFeedPage(page, query);

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  return NextResponse.json(result.body, { headers: result.headers });
}
