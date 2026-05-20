/**
 * Active Viewport Scheduler (resource scheduler)
 *
 * Decides WHAT to load NOW, WHAT to queue NEXT, and WHAT to discard
 * based on active index, scroll velocity, and idle state.
 *
 * Tradeoff: we avoid decoding during fast flings (saves main-thread +
 * bandwidth) but preload aggressively when idle — mimics mobile OS
 * memory pressure policies.
 */

import type { PreloadTier, SchedulerSnapshot } from "@/types/feed";

/** px/ms — above this = "fast scroll", delay full decode */
export const FAST_SCROLL_VELOCITY = 2.5;
/** px/ms — below this = idle-ish, aggressive preload */
export const IDLE_VELOCITY = 0.15;

const POOL_SIZE = 3;

export interface SchedulerInput {
  activeIndex: number;
  velocity: number;
  itemCount: number;
  isIdle: boolean;
}

/**
 * Maps logical feed indices → preload tiers + optional pool slots.
 *
 * Pool slots (0..POOL_SIZE-1):
 *   slot 0 → active
 *   slot 1 → next
 *   slot 2 → previous or next+1 depending on scroll direction
 */
export function computeSchedulerSnapshot(
  input: SchedulerInput,
): SchedulerSnapshot {
  const { activeIndex, velocity, itemCount, isIdle } = input;
  const absVel = Math.abs(velocity);
  const isFastScroll = absVel >= FAST_SCROLL_VELOCITY;

  return {
    activeIndex: clamp(activeIndex, 0, Math.max(itemCount - 1, 0)),
    itemCount,
    velocity: absVel,
    isIdle,
    isFastScroll,
  };
}

export function getTierForIndex(
  snapshot: SchedulerSnapshot,
  index: number,
): PreloadTier {
  if (snapshot.itemCount <= 0) return "none";

  const distance = Math.abs(index - snapshot.activeIndex);
  if (distance === 0) {
    return snapshot.isFastScroll ? "metadata" : "auto";
  }
  if (distance === 1) {
    return snapshot.isFastScroll ? "none" : snapshot.isIdle ? "auto" : "metadata";
  }
  if (distance === 2 && snapshot.isIdle && !snapshot.isFastScroll) {
    return "metadata";
  }
  return "none";
}

export function getPoolSlotForIndex(
  snapshot: SchedulerSnapshot,
  index: number,
): number | undefined {
  if (snapshot.itemCount <= 0) return undefined;
  const max = snapshot.itemCount - 1;
  const targets = [
    snapshot.activeIndex,
    clamp(snapshot.activeIndex + 1, 0, max),
    clamp(snapshot.activeIndex - 1, 0, max),
  ];
  const uniqueTargets = [...new Set(targets)];
  const slot = uniqueTargets.findIndex((target) => target === index);
  return slot === -1 ? undefined : slot % POOL_SIZE;
}

export const VIDEO_POOL_SIZE = POOL_SIZE;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
