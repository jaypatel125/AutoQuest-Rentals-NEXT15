import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchStore } from "@/context/searchStore";
import SelectVehiclePage from "./index";
import * as actions from "@/app/(main)/select-vehicle/actions";
import { renderWithClient } from "@/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/context/searchStore", () => ({
  ...jest.requireActual("@/context/searchStore"),
  useSearchStore: jest.fn(),
}));

jest.mock("@/app/(main)/select-vehicle/actions", () => ({
  fetchCars: jest.fn(),
}));

jest.mock("../searchbar", () => ({
  SearchBar: () => <div>Search Bar</div>,
}));

const day = 24 * 60 * 60 * 1000;
const start = new Date(Date.now() + 5 * day);
const end = new Date(Date.now() + 9 * day);

const cars = [
  {
    id: "1",
    brand: "Toyota",
    model: "Corolla",
    fuel_type: "Petrol",
    transmission: "Automatic",
    body_type: "Sedan",
    passenger_capacity: 5,
    carbon_emissions: 140,
    price_per_day: "50.00",
    image: null,
  },
  {
    id: "2",
    brand: "Tesla",
    model: "Model 3",
    fuel_type: "Electric",
    transmission: "Automatic",
    body_type: "Sedan",
    passenger_capacity: 5,
    carbon_emissions: 0,
    price_per_day: "100.00",
    image: null,
  },
];

describe("SelectVehiclePage", () => {
  const replaceMock = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: { city: "Toronto" },
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      setSelectedCar: jest.fn(),
    });
    (actions.fetchCars as jest.Mock).mockResolvedValue(cars);
  });

  it("lets visitors browse before choosing a trip", async () => {
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: null,
      startDate: null,
      endDate: null,
      setSelectedCar: jest.fn(),
    });
    renderWithClient(<SelectVehiclePage />);
    expect(
      screen.getByText(/Select a location and date range to get started/i)
    ).toBeInTheDocument();
    expect(await screen.findByText("Toyota Corolla")).toBeInTheDocument();
    expect(actions.fetchCars).toHaveBeenCalledWith("", undefined, undefined);
  });

  it("renders car cards with trip totals when dates are set", async () => {
    renderWithClient(<SelectVehiclePage />);
    expect(await screen.findByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    // 4 days x $50 + $15 fee + 13% HST = $241.00
    expect(screen.getByText(/\$241\.00 total/)).toBeInTheDocument();
  });

  it("filters cars based on selected fuel type", async () => {
    renderWithClient(<SelectVehiclePage />);
    await screen.findByText("Toyota Corolla");

    fireEvent.click(screen.getAllByLabelText("Electric")[0]);

    await waitFor(() => {
      expect(screen.queryByText("Toyota Corolla")).not.toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    });
  });

  it("clears all filters when clicking Clear Filters", async () => {
    renderWithClient(<SelectVehiclePage />);
    await screen.findByText("Toyota Corolla");
    fireEvent.click(screen.getAllByLabelText("Electric")[0]);
    await waitFor(() =>
      expect(screen.queryByText("Toyota Corolla")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getAllByText(/Clear Filters/i)[0]);

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    });
  });

  it("syncs selected filters with the URL without adding history entries", async () => {
    renderWithClient(<SelectVehiclePage />);
    await screen.findByText("Toyota Corolla");
    fireEvent.click(screen.getAllByLabelText("Electric")[0]);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        expect.stringContaining("fuelTypes=Electric"),
        { scroll: false }
      );
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("applies filters passed in the URL", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("fuelTypes=Electric")
    );
    renderWithClient(<SelectVehiclePage />);
    expect(await screen.findByText("Tesla Model 3")).toBeInTheDocument();
    expect(screen.queryByText("Toyota Corolla")).not.toBeInTheDocument();
  });
});
