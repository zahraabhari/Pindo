import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 12;

export const TRENDING_QUERIES = [
  "nature",
  "skincare",
  "outdoor",
  "minimal",
  "eco",
  "travel",
] as const;

interface SearchStore {
  history: string[];
  addHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      history: [],
      addHistory: (raw) => {
        const query = raw.trim().toLowerCase();
        if (!query) return;
        const next = [query, ...get().history.filter((h) => h !== query)].slice(
          0,
          MAX_HISTORY,
        );
        set({ history: next });
      },
      clearHistory: () => set({ history: [] }),
    }),
    { name: "pindo-search-history" },
  ),
);
