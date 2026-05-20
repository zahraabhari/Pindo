"use client";

import { feedScrollRootRef } from "@/services/feed/feed.scroll-root";
import { useEffect, useRef } from "react";

const DEFAULT_THRESHOLDS: number[] = [0, 0.25, 0.5, 0.75, 1];

interface UseIntersectionVisibilityOptions {
  threshold?: number[];
  onRatioChange: (ratio: number) => void;
}

/**
 * Visibility within the Virtuoso scroll container (not just the window).
 */
export function useIntersectionVisibility({
  threshold = DEFAULT_THRESHOLDS,
  onRatioChange,
}: UseIntersectionVisibilityOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const onRatioRef = useRef(onRatioChange);
  onRatioRef.current = onRatioChange;
  const rootRef = useRef<Element | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    rootRef.current = feedScrollRootRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) onRatioRef.current(entry.intersectionRatio);
      },
      { root: rootRef.current, threshold, rootMargin: "0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // threshold is module-level constant by default — stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
