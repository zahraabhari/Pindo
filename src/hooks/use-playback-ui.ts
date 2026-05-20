"use client";

import { playbackEngine } from "@/services/feed/playback-engine";
import { usePlaybackStore } from "@/store/playback-store";
import { useCallback } from "react";

/**
 * Playback UI for one feed item — only the active item shows live play/pause state.
 */
export function usePlaybackUi(videoId: string) {
  const activeVideoId = usePlaybackStore((s) => s.activeVideoId);
  const mediaPlaying = usePlaybackStore((s) => s.mediaPlaying);

  const isActive = activeVideoId === videoId;
  /** Playing → show pause icon; paused/ended → show play */
  const showPauseIcon = isActive && mediaPlaying;

  const togglePlayback = useCallback(() => {
    if (!playbackEngine.isActive(videoId)) return;
    playbackEngine.toggleUserPause();
  }, [videoId]);

  return { isActive, showPauseIcon, togglePlayback };
}
