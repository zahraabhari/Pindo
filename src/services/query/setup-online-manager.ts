import { onlineManager } from "@tanstack/react-query";

let installed = false;

/**
 * Sync TanStack Query online state with the browser.
 * When offline, refetchOnWindowFocus / reconnect / mount refetches are suppressed.
 */
export function setupQueryOnlineManager(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  onlineManager.setEventListener((setOnline) => {
    const sync = () => setOnline(navigator.onLine);

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  });
}
