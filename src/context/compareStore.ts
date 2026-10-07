import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 3;

export interface CompareItem {
  id: string;
  brand: string;
  model: string;
  body_type?: string | null;
  image?: string | null;
}

interface CompareState {
  items: CompareItem[];
  toggle: (item: CompareItem) => "added" | "removed" | "full";
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const items = get().items;
        if (items.some((i) => i.id === item.id)) {
          set({ items: items.filter((i) => i.id !== item.id) });
          return "removed";
        }
        if (items.length >= MAX_COMPARE) return "full";
        set({ items: [...items, item] });
        return "added";
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: "compare-storage" }
  )
);
