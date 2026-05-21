import { resolveFeedHead } from "@/services/feed/feed.server";
import { getFeedSearchQuery } from "@/services/pexels";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Cursor-free head refresh for SWR merge — does not advance pagination */
export async function GET(req: NextRequest) {
  const query = getFeedSearchQuery(req.nextUrl.searchParams.get("query"));

  const result = await resolveFeedHead(query);

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  return NextResponse.json(result.body, { headers: result.headers });
}
