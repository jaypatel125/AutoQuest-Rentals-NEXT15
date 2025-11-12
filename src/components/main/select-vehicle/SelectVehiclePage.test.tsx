/* eslint-disable react/display-name */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/context/searchStore";
import SelectVehiclePage from "./index";
import * as actions from "@/app/(main)/select-vehicle/actions";

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock search store
jest.mock("@/context/searchStore", () => ({
  useSearchStore: jest.fn(),
}));

// Mock fetchCars
jest.mock("@/app/(main)/select-vehicle/actions.ts", () => ({
  fetchCars: jest.fn(),
}));

// Create a QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SelectVehiclePage", () => {
  const pushMock = jest.fn();
  const setSelectedCarMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: { city: "Toronto" },
      startDate: "2025-10-20",
      endDate: "2025-10-25",
      setSelectedCar: setSelectedCarMock,
    });

    (actions.fetchCars as jest.Mock).mockResolvedValue([
      {
        id: 1,
        brand: "Toyota",
        model: "Corolla",
        fuel_type: "Gasoline",
        transmission: "Automatic",
        body_type: "Sedan",
        passenger_capacity: 5,
        price_per_day: 50,
        image: "/car1.png",
      },
      {
        id: 2,
        brand: "Tesla",
        model: "Model 3",
        fuel_type: "Electric",
        transmission: "Automatic",
        body_type: "Sedan",
        passenger_capacity: 5,
        price_per_day: 100,
        image: "/car2.png",
      },
    ]);
  });

  it("renders search bar and placeholder when no city/date", () => {
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: null,
      startDate: null,
      endDate: null,
      setSelectedCar: jest.fn(),
    });
    render(<SelectVehiclePage />, { wrapper: createWrapper() });
    expect(
      screen.getByText(/Select a location and date range to get started/i)
    ).toBeInTheDocument();
  });

  it("renders car cards when data is available", async () => {
    render(<SelectVehiclePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    });
  });

  it("filters cars based on selected fuel type", async () => {
    render(<SelectVehiclePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    });

    // Click Electric checkbox
    const electricCheckbox = screen.getAllByLabelText("Electric")[0];
    fireEvent.click(electricCheckbox);

    await waitFor(() => {
      expect(screen.queryByText("Toyota Corolla")).not.toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    });
  });

  it("clears all filters when clicking Clear Filters", async () => {
    render(<SelectVehiclePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const checkbox = screen.getAllByLabelText("Electric")[0];
      fireEvent.click(checkbox);
    });

    const clearButton = screen.getAllByText(/Clear Filters/i)[0];
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    });
  });

  it("syncs selected filters with URL", async () => {
    render(<SelectVehiclePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const checkbox = screen.getAllByLabelText("Electric")[0];
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("fuelTypes=Electric"),
        { scroll: false }
      );
    });
  });
});
