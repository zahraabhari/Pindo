/**
 * Imperative video element pool — fixed count of <video> DOM nodes
 * reparented into visible feed item containers.
 *
 * This avoids React unmount/remount of decoders when Virtuoso recycles
 * wrapper DIVs; only the container changes, not the media element.
 */

import type { PreloadTier } from "@/types/feed";

const PARKING_ID = "video-pool-parking";

class VideoPool {
  private slots: HTMLVideoElement[] = [];
  private initialized = false;

  init(poolSize: number) {
    if (this.initialized || typeof document === "undefined") return;

    let park = document.getElementById(PARKING_ID);
    if (!park) {
      park = document.createElement("div");
      park.id = PARKING_ID;
      park.style.cssText =
        "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;opacity:0";
      document.body.appendChild(park);
    }

    for (let i = 0; i < poolSize; i++) {
      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.loop = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("muted", "");
      video.className = "h-full w-full object-cover";
      video.dataset.poolSlot = String(i);
      park.appendChild(video);
      this.slots.push(video);
    }

    this.initialized = true;
  }

  getSlot(slot: number): HTMLVideoElement | undefined {
    return this.slots[slot];
  }

  attach(
    slot: number,
    container: HTMLElement,
    src: string,
    poster: string,
    tier: PreloadTier,
  ) {
    const video = this.slots[slot];
    if (!video) return;

    if (container !== video.parentElement) {
      container.appendChild(video);
    }

    if (video.poster !== poster) {
      video.poster = poster;
    }

    const preload =
      tier === "auto" ? "auto" : tier === "metadata" ? "metadata" : "none";
    if (video.preload !== preload) {
      video.preload = preload;
    }

    if (tier !== "none" && video.src !== src) {
      video.src = src;
    } else if (tier === "none") {
      video.removeAttribute("src");
      video.load();
    }
  }

  detachToParking(slot: number) {
    const video = this.slots[slot];
    const park = document.getElementById(PARKING_ID);
    if (!video || !park) return;
    video.pause();
    if (video.parentElement !== park) {
      park.appendChild(video);
    }
  }
}

export const videoPool = new VideoPool();
