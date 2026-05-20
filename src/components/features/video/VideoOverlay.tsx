"use client";

import { SocialActionRail } from "@/components/features/commerce/overlay/SocialActionRail";
import { VideoDescription } from "@/components/features/commerce/overlay/VideoDescription";
import { useCommentCount } from "@/services/comments/comments.hooks";
import { enrichVideoWithProduct } from "@/services/commerce/enrich-product";
import { useUiStore } from "@/store/ui-store";
import type { FeedVideo } from "@/types/feed";
import { memo, useCallback, useMemo } from "react";

interface VideoOverlayProps {
  video: FeedVideo;
}

function VideoOverlayInner({ video }: VideoOverlayProps) {
  const enriched = useMemo(() => enrichVideoWithProduct(video), [video]);
  const product = enriched.product!;
  const { count, isLoading } = useCommentCount(video.id);
  const openComments = useUiStore((s) => s.openComments);

  const handleOpenComments = useCallback(() => {
    openComments(video.id);
  }, [openComments, video.id]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pb-6 pt-24">
        <div className="flex items-end justify-between px-4">
          <VideoDescription
            product={product}
            commentCount={count}
            onOpenComments={handleOpenComments}
          />
          <SocialActionRail
            video={enriched}
            commentCount={count}
            commentsLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export const VideoOverlay = memo(VideoOverlayInner);
