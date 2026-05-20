"use client";

import { VideoPlayer } from "@/components/features/video/VideoPlayer";
import { videoPool } from "@/components/features/video/video-pool";
import { playbackEngine } from "@/services/feed/playback-engine";
import { VIDEO_POOL_SIZE } from "@/services/feed/feed.scheduler";
import type { FeedVideo, PreloadTier } from "@/types/feed";
import { memo, useEffect, useRef } from "react";

interface PooledFeedItemMediaProps {
  video: FeedVideo;
  tier: PreloadTier;
  slot: number | undefined;
}

function PooledFeedItemMediaInner({ video, tier, slot }: PooledFeedItemMediaProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    videoPool.init(VIDEO_POOL_SIZE);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || slot === undefined) return;

    videoPool.attach(slot, host, video.src, video.poster, tier);

    const el = videoPool.getSlot(slot);
    if (el) {
      playbackEngine.registerElement(video.id, el);
    }

    return () => {
      playbackEngine.unregisterElement(video.id);
      videoPool.detachToParking(slot);
    };
  }, [slot, tier, video.src, video.poster, video.id]);

  if (tier === "none") {
    return (
      <div
        className="absolute inset-0 bg-black"
        style={{
          backgroundImage: `url(${video.poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  if (slot === undefined) {
    return <VideoPlayer video={video} tier={tier} />;
  }

  return <div ref={hostRef} className="absolute inset-0 bg-black" />;
}

export const PooledFeedItemMedia = memo(PooledFeedItemMediaInner);
