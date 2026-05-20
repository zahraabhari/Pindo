"use client";

import { useSyncExternalStore } from "react";

const SERVER_VIEWPORT_HEIGHT = 800;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getViewportHeight() {
  return window.innerHeight;
}

/** Stable item height for Virtuoso — matches server snapshot until client measures. */
export function useViewportHeight() {
  return useSyncExternalStore(
    subscribe,
    getViewportHeight,
    () => SERVER_VIEWPORT_HEIGHT,
  );
}
