"use client";

import { Card, Icon, Skeleton, Typography } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DiscoveryItem } from "@/types/discovery";
import Image from "next/image";
import { memo, useCallback, useState } from "react";

interface DiscoverCardProps {
  item: DiscoveryItem;
  width: number;
  onOpen?: (item: DiscoveryItem) => void;
}

function DiscoverCardInner({ item, width, onOpen }: DiscoverCardProps) {
  const height = Math.round(width * item.aspectRatio);
  const [mediaReady, setMediaReady] = useState(false);

  const title = item.product?.productTitle ?? item.title;
  const seller = item.product?.username;
  const isVideo = item.type === "video" && Boolean(item.videoSrc);

  const handleOpen = useCallback(() => {
    onOpen?.(item);
  }, [item, onOpen]);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
      variant="surface"
      className="relative cursor-pointer overflow-hidden rounded-xl focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      style={{ width, height }}
    >
      {!mediaReady && (
        <Skeleton className="absolute inset-0 z-[1] rounded-none" rounded="xl" />
      )}

      {isVideo ? (
        <video
          src={item.videoSrc}
          poster={item.thumbnail}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            mediaReady ? "opacity-100" : "opacity-0",
          )}
          onLoadedData={() => setMediaReady(true)}
        />
      ) : (
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={width}
          height={height}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            mediaReady ? "opacity-100" : "opacity-0",
          )}
          unoptimized
          onLoad={() => setMediaReady(true)}
        />
      )}

      {isVideo && (
        <span className="absolute right-2 top-2 z-[3] rounded bg-black/50 px-1.5 py-0.5">
          <Icon name="play" size="sm" className="text-white" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/80 via-black/25 to-transparent p-2">
        <Typography variant="caption-md" className="line-clamp-1 font-semibold text-white">
          {title}
        </Typography>
        <div className="flex items-center justify-between gap-2">
          {seller ? (
            <Typography variant="caption" className="truncate text-[10px] text-white/65">
              {seller}
            </Typography>
          ) : (
            <span />
          )}
          {item.product ? (
            <Typography variant="price" className="shrink-0 text-[11px]">
              {item.product.priceLabel}
            </Typography>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export const DiscoverCard = memo(
  DiscoverCardInner,
  (a, b) => a.item.id === b.item.id && a.width === b.width && a.onOpen === b.onOpen,
);
