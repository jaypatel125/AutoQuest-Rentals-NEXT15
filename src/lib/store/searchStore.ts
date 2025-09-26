import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branch, Car } from "@/lib/database/table-types";

interface SearchState {
  city: string;
  branch?: Branch;
  startDate?: Date;
  endDate?: Date;
  distance: string;
  selectedCar?: Car;
  setCity: (city: string) => void;
  setDates: (startDate?: Date, endDate?: Date) => void;
  setDistance: (distance: string) => void;
  setSelectedCar: (car: Car) => void;
  setBranch: (branch: Branch) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      city: "",
      startDate: undefined,
      endDate: undefined,
      distance: "",
      selectedCar: undefined,
      branch: undefined,

      setCity: (city) => set({ city }),
      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setDistance: (distance) => set({ distance }),
      setSelectedCar: (car) => set({ selectedCar: car }),
      setBranch: (branch) => set({ branch: branch }),

      reset: () =>
        set({
          city: "",
          branch: undefined,
          startDate: undefined,
          endDate: undefined,
          distance: "",
          selectedCar: undefined,
        }),
    }),
    {
      name: "search-storage",
      partialize: (state) => ({
        city: state.city,
        branch: state.branch,
        startDate: state.startDate,
        endDate: state.endDate,
        distance: state.distance,
        selectedCar: state.selectedCar,
      }),
    }
  )
);
