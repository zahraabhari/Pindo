"use client";

import { playbackEngine } from "@/services/feed/playback-engine";
import { usePlaybackStore } from "@/store/playback-store";
import type { PreloadTier } from "@/types/feed";
import type { FeedVideo } from "@/types/feed";
import { memo, useEffect, useRef } from "react";

export interface VideoPlayerProps {
  video: FeedVideo;
  tier: PreloadTier;
  poolSlot?: number;
}

function VideoPlayerInner({ video, tier, poolSlot }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inlineRef = useRef<HTMLVideoElement>(null);
  const activeVideoId = usePlaybackStore((s) => s.activeVideoId);
  const isActive = activeVideoId === video.id;

  const resolveElement = (): HTMLVideoElement | null => {
    if (poolSlot !== undefined) {
      return document.querySelector<HTMLVideoElement>(
        `[data-pool-slot="${poolSlot}"]`,
      );
    }
    return inlineRef.current;
  };

  useEffect(() => {
    const el = resolveElement();
    if (!el) return;

    playbackEngine.registerElement(video.id, el);
    return () => {
      playbackEngine.unregisterElement(video.id);
      if (!playbackEngine.isActive(video.id)) {
        el.pause();
      }
    };
  }, [video.id, poolSlot]);

  useEffect(() => {
    const el = resolveElement();
    if (!el || isActive) return;
    el.pause();
  }, [isActive, poolSlot, video.id]);

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

  if (poolSlot !== undefined) {
    return <div ref={containerRef} className="absolute inset-0 bg-black" />;
  }

  const preload =
    tier === "auto" ? "auto" : tier === "metadata" ? "metadata" : "none";

  return (
    <div ref={containerRef} className="absolute inset-0 bg-black">
      <video
        ref={inlineRef}
        key={video.key}
        className="h-full w-full object-cover"
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload={preload}
      />
    </div>
  );
}

export const VideoPlayer = memo(VideoPlayerInner);
