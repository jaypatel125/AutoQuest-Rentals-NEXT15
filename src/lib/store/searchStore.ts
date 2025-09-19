import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  city: string;
  startDate?: Date;
  endDate?: Date;
  distance: string;
  setCity: (city: string) => void;
  setDates: (startDate?: Date, endDate?: Date) => void;
  setDistance: (distance: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      city: "",
      startDate: undefined,
      endDate: undefined,
      distance: "",
      setCity: (city) => set({ city }),
      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setDistance: (distance) => set({ distance }),
      reset: () =>
        set({
          city: "",
          startDate: undefined,
          endDate: undefined,
          distance: "",
        }),
    }),
    {
      name: "search-storage",
      partialize: (state) => ({
        city: state.city,
        startDate: state.startDate,
        endDate: state.endDate,
        distance: state.distance,
      }),
    }
  )
);
