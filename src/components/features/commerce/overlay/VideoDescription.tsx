"use client";

import { Button, Icon, Typography } from "@/components/ui";
import { getCommentAvatarUrl } from "@/services/commerce/comment-avatar";
import type { ProductMeta } from "@/types/commerce";
import { memo, useState } from "react";

interface VideoDescriptionProps {
  product: ProductMeta;
  commentCount?: number;
  onOpenComments?: () => void;
}

function VideoDescriptionInner({
  product,
  commentCount = 0,
  onOpenComments,
}: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const longCaption = product.caption.length > 72;
  const sellerSeed = product.username.replace(/^@/, "").trim() || "seller";
  const avatarUrl = getCommentAvatarUrl(sellerSeed);
  const teaser = product.shortDescription ?? product.caption;

  return (
    <div className="pointer-events-auto max-w-[78%] space-y-1.5 pr-14 text-white drop-shadow-md">
      <div className="flex items-center gap-2">
        <img
          src={avatarUrl}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 object-cover ring-1 ring-white/15"
          loading="lazy"
        />
        <div className="min-w-0">
          <Typography variant="title" className="leading-tight">
            {product.username}
          </Typography>
          <Typography variant="subtitle" className="line-clamp-1 text-[13px] leading-tight">
            {product.productTitle}
          </Typography>
        </div>
      </div>

      <Typography variant="body-muted" className="line-clamp-2 text-[12px] leading-snug text-white/75">
        {teaser}
      </Typography>

      <Typography variant="price" className="text-[13px]">
        {product.priceLabel}
      </Typography>

      {onOpenComments && (
        <button
          type="button"
          onClick={onOpenComments}
          className="block text-left text-[12px] font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
        >
          {commentCount > 0
            ? `View all ${commentCount} comments`
            : "View comments"}
        </button>
      )}

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          expanded ? "max-h-40" : "max-h-10"
        }`}
      >
        <Typography variant="body" className={expanded ? "" : "line-clamp-2"}>
          {product.caption}
        </Typography>
      </div>

      {longCaption && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
          className="h-auto p-0 text-xs font-semibold text-white/70 hover:bg-transparent hover:text-white"
        >
          {expanded ? "less" : "more"}
        </Button>
      )}

      {product.hashtags.length > 0 && (
        <Typography variant="hashtag">{product.hashtags.join(" ")}</Typography>
      )}

      {product.musicTrack && (
        <p className="flex items-center gap-1 text-xs text-white/60">
          <Icon name="music" size="sm" />
          <span className="truncate">{product.musicTrack}</span>
        </p>
      )}
    </div>
  );
}

export const VideoDescription = memo(
  VideoDescriptionInner,
  (prev, next) =>
    prev.product === next.product &&
    prev.commentCount === next.commentCount &&
    prev.onOpenComments === next.onOpenComments,
);
