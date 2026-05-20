import { create } from "zustand";

interface InteractionState {
  likes: Record<string, boolean>;
  pending: Record<string, boolean>;
  saved: Record<string, boolean>;
  toggleLike: (videoId: string) => Promise<void>;
  toggleSave: (itemId: string) => void;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  likes: {},
  pending: {},
  saved: {},

  toggleLike: async (videoId: string) => {
    const prev = get().likes[videoId] ?? false;
    const next = !prev;

    set((s) => ({
      likes: { ...s.likes, [videoId]: next },
      pending: { ...s.pending, [videoId]: true },
    }));

    try {
      await syncLike(videoId, next);
      set((s) => {
        const pending = { ...s.pending };
        delete pending[videoId];
        return { pending };
      });
    } catch {
      set((s) => ({
        likes: { ...s.likes, [videoId]: prev },
        pending: { ...s.pending, [videoId]: false },
      }));
    }
  },

  toggleSave: (itemId: string) => {
    const prev = get().saved[itemId] ?? false;
    set((s) => ({ saved: { ...s.saved, [itemId]: !prev } }));
  },
}));

async function syncLike(videoId: string, liked: boolean): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  if (videoId.endsWith("fail")) {
    throw new Error("sync failed");
  }
  void liked;
}
