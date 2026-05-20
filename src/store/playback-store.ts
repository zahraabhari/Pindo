import { playbackEngine } from "@/services/feed/playback-engine";
import { create } from "zustand";

interface PlaybackStore {
  activeIndex: number | null;
  activeVideoId: string | null;
  generation: number;
  isPausedByUser: boolean;
  mediaPlaying: boolean;
  syncFromEngine: () => void;
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  activeIndex: null,
  activeVideoId: null,
  generation: 0,
  isPausedByUser: false,
  mediaPlaying: false,
  syncFromEngine: () => {
    const s = playbackEngine.getState();
    const prev = get();
    if (
      prev.activeIndex === s.activeIndex &&
      prev.activeVideoId === s.activeVideoId &&
      prev.generation === s.generation &&
      prev.isPausedByUser === s.isPausedByUser &&
      prev.mediaPlaying === s.mediaPlaying
    ) {
      return;
    }
    set({
      activeIndex: s.activeIndex,
      activeVideoId: s.activeVideoId,
      generation: s.generation,
      isPausedByUser: s.isPausedByUser,
      mediaPlaying: s.mediaPlaying,
    });
  },
}));

export function subscribePlaybackEngine() {
  return playbackEngine.subscribe(() => {
    usePlaybackStore.getState().syncFromEngine();
  });
}
