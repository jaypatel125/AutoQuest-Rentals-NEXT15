import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branches, Cars } from "@/lib/database/table-types";

// Dates come back from localStorage as ISO strings, so both forms are allowed.
type StoredDate = Date | string;

interface SearchState {
  branch?: Branches;
  startDate?: StoredDate;
  endDate?: StoredDate;
  selectedCar?: Cars;
  redeemPoints: boolean;
  setDates: (startDate?: StoredDate, endDate?: StoredDate) => void;
  setSelectedCar: (car: Cars) => void;
  setBranch: (branch: Branches) => void;
  setRedeemPoints: (value: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      startDate: undefined,
      endDate: undefined,
      selectedCar: undefined,
      branch: undefined,
      redeemPoints: true,

      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setSelectedCar: (car) => set({ selectedCar: car }),
      setBranch: (branch) => set({ branch: branch }),
      setRedeemPoints: (value) => set({ redeemPoints: value }),

      reset: () =>
        set({
          branch: undefined,
          startDate: undefined,
          endDate: undefined,
          selectedCar: undefined,
        }),
    }),
    {
      name: "search-storage",
      partialize: (state) => ({
        branch: state.branch,
        startDate: state.startDate,
        endDate: state.endDate,
        selectedCar: state.selectedCar,
        redeemPoints: state.redeemPoints,
      }),
      // Drop saved trip dates that are already in the past.
      onRehydrateStorage: () => (state) => {
        if (!state?.startDate) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(state.startDate) < today) {
          state.setDates(undefined, undefined);
        }
      },
    }
  )
);

/** Normalizes a stored date to a Date (or undefined). */
export function toDate(value?: StoredDate | null): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
