import {
  parseDiscoverRouteQuery,
  resolveDiscoverPage,
} from "@/services/search/search.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { page, query } = parseDiscoverRouteQuery(
    req.nextUrl.searchParams.get("page"),
    req.nextUrl.searchParams.get("q"),
  );

  const result = await resolveDiscoverPage(page, query);

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  return NextResponse.json(result.body, {
    headers: { "Cache-Control": "private, max-age=45" },
  });
}
