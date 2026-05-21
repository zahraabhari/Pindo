"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  return { isOnline, isOffline: !isOnline };
}
