import { NextRequest, NextResponse } from "next/server";
import {
  createCommentForVideo,
  listCommentsForVideo,
} from "@/services/comments/comments.server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }
  return NextResponse.json({ comments: listCommentsForVideo(videoId) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    videoId?: string;
    text?: string;
    username?: string;
  };
  const { videoId, text, username } = body;

  if (!videoId || !text?.trim()) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const comment = await createCommentForVideo({
    videoId,
    text,
    username,
  });

  return NextResponse.json({ comment });
}
