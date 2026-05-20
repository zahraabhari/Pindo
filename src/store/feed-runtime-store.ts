"use client";

import {
  computeSchedulerSnapshot,
  getPoolSlotForIndex,
  getTierForIndex,
  IDLE_VELOCITY,
} from "@/services/feed/feed.scheduler";
import type { PreloadTier, SchedulerSnapshot } from "@/types/feed";
import { useCallback } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

const EMPTY_SCHEDULER: SchedulerSnapshot = {
  activeIndex: 0,
  itemCount: 0,
  velocity: 0,
  isIdle: true,
  isFastScroll: false,
};

interface FeedRuntimeStore {
  scheduler: SchedulerSnapshot;
  lastScrollTop: number | null;
  lastScrollTimeMs: number | null;
  recordScroll: (scrollTop: number) => void;
  updateScheduler: (activeIndex: number, itemCount: number) => void;
  reset: () => void;
}

function isSameScheduler(a: SchedulerSnapshot, b: SchedulerSnapshot): boolean {
  return (
    a.activeIndex === b.activeIndex &&
    a.itemCount === b.itemCount &&
    a.isFastScroll === b.isFastScroll &&
    a.isIdle === b.isIdle &&
    Math.abs(a.velocity - b.velocity) < 0.01
  );
}

export const useFeedRuntimeStore = create<FeedRuntimeStore>((set, get) => ({
  scheduler: EMPTY_SCHEDULER,
  lastScrollTop: null,
  lastScrollTimeMs: null,
  recordScroll: (scrollTop) => {
    const now = performance.now();
    const { lastScrollTop, lastScrollTimeMs } = get();
    if (lastScrollTop == null || lastScrollTimeMs == null) {
      set({ lastScrollTop: scrollTop, lastScrollTimeMs: now });
      return;
    }

    const dt = Math.max(now - lastScrollTimeMs, 1);
    const velocity = Math.abs(scrollTop - lastScrollTop) / dt;
    const nextScheduler = computeSchedulerSnapshot({
      ...get().scheduler,
      velocity,
      isIdle: velocity < IDLE_VELOCITY,
    });

    set((state) => ({
      lastScrollTop: scrollTop,
      lastScrollTimeMs: now,
      scheduler: isSameScheduler(state.scheduler, nextScheduler)
        ? state.scheduler
        : nextScheduler,
    }));
  },
  updateScheduler: (activeIndex, itemCount) => {
    const { scheduler } = get();
    const next = computeSchedulerSnapshot({
      activeIndex,
      itemCount,
      velocity: scheduler.velocity,
      isIdle: scheduler.isIdle,
    });

    set((state) => ({
      scheduler: isSameScheduler(state.scheduler, next) ? state.scheduler : next,
    }));
  },
  reset: () =>
    set({
      scheduler: EMPTY_SCHEDULER,
      lastScrollTop: null,
      lastScrollTimeMs: null,
    }),
}));

export function useFeedScheduleForIndex(
  index: number,
): { tier: PreloadTier; slot: number | undefined } {
  const selector = useCallback(
    (state: FeedRuntimeStore) => {
      const scheduler = state.scheduler;
      return {
        tier: getTierForIndex(scheduler, index),
        slot: getPoolSlotForIndex(scheduler, index),
      };
    },
    [index],
  );
  return useFeedRuntimeStore(useShallow(selector));
}
