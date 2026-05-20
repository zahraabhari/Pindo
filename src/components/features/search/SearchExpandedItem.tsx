"use client";

import { VideoOverlay } from "@/components/features/video/VideoOverlay";
import { Button, Icon } from "@/components/ui";
import { playbackEngine } from "@/services/feed/playback-engine";
import type { DiscoveryItem } from "@/types/discovery";
import type { FeedVideo } from "@/types/feed";
import Image from "next/image";
import { memo, useEffect, useMemo, useRef } from "react";

interface SearchExpandedItemProps {
  item: DiscoveryItem;
  onClose: () => void;
}

function toFeedVideo(item: DiscoveryItem): FeedVideo {
  const seller = item.product?.username ?? item.title;
  return {
    id: item.id,
    key: item.id,
    title: item.product?.productTitle ?? item.title,
    author: seller,
    src: item.videoSrc ?? item.thumbnail,
    poster: item.thumbnail,
    width: item.width,
    height: item.height,
    duration: 0,
    product: item.product,
  };
}

function SearchExpandedItemInner({ item, onClose }: SearchExpandedItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const feedVideo = useMemo(() => toFeedVideo(item), [item]);
  const isVideo = item.type === "video" && Boolean(item.videoSrc);

  useEffect(() => {
    if (!isVideo || !videoRef.current) {
      playbackEngine.clearActive(item.id);
      return;
    }
    const el = videoRef.current;
    playbackEngine.registerElement(item.id, el);
    playbackEngine.setActive(0, item.id);
    return () => {
      playbackEngine.unregisterElement(item.id);
      playbackEngine.clearActive(item.id);
    };
  }, [isVideo, item.id]);

  return (
    <div className="absolute inset-0 z-[90] bg-black">
      <Button
        type="button"
        variant="glass"
        size="sm"
        onClick={onClose}
        className="absolute left-3 top-3 z-50"
      >
        <Icon name="chevron-left" size="sm" />
        <span className="ml-1">Back</span>
      </Button>

      <div className="relative h-full w-full overflow-hidden bg-black">
        {isVideo ? (
          <video
            ref={videoRef}
            src={item.videoSrc}
            poster={item.thumbnail}
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="metadata"
          />
        ) : (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <VideoOverlay video={feedVideo} />
      </div>
    </div>
  );
}

export const SearchExpandedItem = memo(SearchExpandedItemInner);

