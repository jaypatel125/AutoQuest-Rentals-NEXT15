import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branches, Cars } from "@/lib/database/table-types";

interface SearchState {
  branch?: Branches;
  startDate?: Date;
  endDate?: Date;
  selectedCar?: Cars;
  setDates: (startDate?: Date, endDate?: Date) => void;
  setSelectedCar: (car: Cars) => void;
  setBranch: (branch: Branches) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      startDate: undefined,
      endDate: undefined,
      selectedCar: undefined,
      branch: undefined,

      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setSelectedCar: (car) => set({ selectedCar: car }),
      setBranch: (branch) => set({ branch: branch }),

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
      }),
    }
  )
);
