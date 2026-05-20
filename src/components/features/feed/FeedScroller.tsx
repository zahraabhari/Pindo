"use client";

import { feedScrollRootRef } from "@/services/feed/feed.scroll-root";
import { useFeedRuntimeStore } from "@/store/feed-runtime-store";
import { forwardRef, useCallback, useEffect } from "react";

export const FeedScroller = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function FeedScroller(props, ref) {
  const onScroll = useFeedRuntimeStore((s) => s.recordScroll);
  const { onScroll: virtuosoOnScroll, className, ...rest } = props;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      feedScrollRootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    return () => {
      if (feedScrollRootRef.current) feedScrollRootRef.current = null;
    };
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      virtuosoOnScroll?.(e);
      onScroll(e.currentTarget.scrollTop);
    },
    [onScroll, virtuosoOnScroll],
  );

  return (
    <div
      {...rest}
      ref={setRef}
      className={`${className ?? ""} snap-y snap-mandatory overflow-y-auto`}
      onScroll={handleScroll}
    />
  );
});
