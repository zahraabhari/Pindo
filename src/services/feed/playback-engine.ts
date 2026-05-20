/**
 * Active Video Controller (global singleton)
 * Single source of truth for playback + media element state.
 */

type Listener = () => void;

type MediaListener = () => void;

export interface PlaybackEngineState {
  activeIndex: number | null;
  activeVideoId: string | null;
  generation: number;
  /** User explicitly paused the active video */
  isPausedByUser: boolean;
  /** Active element is actually playing (!paused && !ended) */
  mediaPlaying: boolean;
}

const initialState: PlaybackEngineState = {
  activeIndex: null,
  activeVideoId: null,
  generation: 0,
  isPausedByUser: false,
  mediaPlaying: false,
};

class PlaybackEngine {
  private state: PlaybackEngineState = { ...initialState };
  private listeners = new Set<Listener>();
  private elements = new Map<string, HTMLVideoElement>();
  private mediaListeners = new Map<string, MediaListener>();

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): PlaybackEngineState => ({ ...this.state });

  private emit() {
    for (const l of this.listeners) l();
  }

  private readMediaPlaying(videoId: string): boolean {
    const el = this.elements.get(videoId);
    if (!el) return false;
    return !el.paused && !el.ended;
  }

  private syncMediaPlayingFromElement(videoId: string) {
    if (this.state.activeVideoId !== videoId) return;
    const playing = this.readMediaPlaying(videoId);
    if (playing === this.state.mediaPlaying) return;
    this.state = { ...this.state, mediaPlaying: playing };
    this.emit();
  }

  private bindMediaEvents(videoId: string, el: HTMLVideoElement) {
    this.unbindMediaEvents(videoId);
    const handler = () => this.syncMediaPlayingFromElement(videoId);
    const events = ["play", "pause", "ended", "playing"] as const;
    for (const ev of events) {
      el.addEventListener(ev, handler);
    }
    this.mediaListeners.set(videoId, handler);
  }

  private unbindMediaEvents(videoId: string) {
    const handler = this.mediaListeners.get(videoId);
    const el = this.elements.get(videoId);
    if (!handler || !el) {
      this.mediaListeners.delete(videoId);
      return;
    }
    for (const ev of ["play", "pause", "ended", "playing"] as const) {
      el.removeEventListener(ev, handler);
    }
    this.mediaListeners.delete(videoId);
  }

  registerElement(videoId: string, el: HTMLVideoElement) {
    this.elements.set(videoId, el);
    el.muted = true;
    el.playsInline = true;
    this.bindMediaEvents(videoId, el);

    if (
      this.state.activeVideoId === videoId &&
      !this.state.isPausedByUser
    ) {
      void this.playElement(videoId, this.state.generation);
    } else if (this.state.activeVideoId === videoId) {
      this.syncMediaPlayingFromElement(videoId);
    }
  }

  unregisterElement(videoId: string) {
    this.unbindMediaEvents(videoId);
    this.elements.delete(videoId);
    if (this.state.activeVideoId === videoId) {
      this.state = { ...this.state, mediaPlaying: false };
      this.emit();
    }
  }

  setActive(index: number, videoId: string) {
    const prevId = this.state.activeVideoId;
    if (prevId === videoId && this.state.activeIndex === index) return;

    if (prevId && prevId !== videoId) {
      this.pauseElement(prevId);
    }

    this.state = {
      ...this.state,
      activeIndex: index,
      activeVideoId: videoId,
      generation: this.state.generation + 1,
      mediaPlaying: false,
      isPausedByUser: false,
    };
    this.emit();

    if (!this.state.isPausedByUser) {
      void this.playElement(videoId, this.state.generation);
    }
  }

  clearActive(videoId: string) {
    if (this.state.activeVideoId !== videoId) return;
    this.pauseElement(videoId);
    this.state = {
      ...this.state,
      activeIndex: null,
      activeVideoId: null,
      generation: this.state.generation + 1,
      mediaPlaying: false,
      isPausedByUser: false,
    };
    this.emit();
  }

  toggleUserPause() {
    const id = this.state.activeVideoId;
    if (!id) return;

    const el = this.elements.get(id);
    const currentlyPlaying = el ? this.readMediaPlaying(id) : false;
    const nextPaused = currentlyPlaying;

    this.state = { ...this.state, isPausedByUser: nextPaused };

    if (nextPaused) {
      this.pauseElement(id);
    } else {
      void this.playElement(id, this.state.generation);
    }
    this.emit();
  }

  private pauseElement(videoId: string) {
    const el = this.elements.get(videoId);
    if (!el) return;
    el.pause();
  }

  private async playElement(videoId: string, gen: number) {
    const el = this.elements.get(videoId);
    if (!el) return;

    try {
      el.muted = true;
      if (el.readyState < 2) {
        await new Promise<void>((resolve) => {
          const onReady = () => {
            el.removeEventListener("loadeddata", onReady);
            resolve();
          };
          el.addEventListener("loadeddata", onReady, { once: true });
        });
      }
      if (this.state.generation !== gen || this.state.activeVideoId !== videoId) {
        return;
      }
      await el.play();
      if (this.state.generation !== gen || this.state.activeVideoId !== videoId) {
        el.pause();
      } else {
        this.syncMediaPlayingFromElement(videoId);
      }
    } catch {
      this.state = { ...this.state, mediaPlaying: false };
      this.emit();
    }
  }

  isActive(videoId: string): boolean {
    return this.state.activeVideoId === videoId;
  }

  reset() {
    for (const id of this.elements.keys()) {
      this.pauseElement(id);
    }
    this.state = { ...initialState };
    this.emit();
  }
}

export const playbackEngine = new PlaybackEngine();
