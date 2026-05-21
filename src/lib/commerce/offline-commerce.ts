/** Shown when a commerce mutation is attempted while offline */
export const COMMERCE_OFFLINE_MESSAGE =
  "You're offline. Please reconnect to continue.";

export function isCommerceOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}
