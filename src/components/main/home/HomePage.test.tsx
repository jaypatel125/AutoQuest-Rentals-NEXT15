import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import HomePage from "./index";
import { renderWithClient } from "@/test-utils";
import {
  fetchCarBodyTypes,
  fetchCarBrands,
  fetchFeaturedCars,
  fetchFleetStats,
} from "@/app/actions";

jest.mock("@/app/actions", () => ({
  fetchCarBrands: jest.fn(),
  fetchCarBodyTypes: jest.fn(),
  fetchFeaturedCars: jest.fn(),
  fetchFleetStats: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../searchbar", () => ({
  SearchBar: () => <div>Search Bar</div>,
}));

describe("HomePage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (fetchCarBrands as jest.Mock).mockResolvedValue(["Tesla", "Ford"]);
    (fetchCarBodyTypes as jest.Mock).mockResolvedValue(["Suv", "Sedan"]);
    (fetchFleetStats as jest.Mock).mockResolvedValue({
      vehicles: 31,
      electric: 12,
      low_emission: 19,
      brands: 12,
      branches: 5,
      cities: 5,
    });
    (fetchFeaturedCars as jest.Mock).mockResolvedValue([
      {
        id: "c1",
        brand: "Kia",
        model: "EV6",
        fuel_type: "Electric",
        body_type: "Hatchback",
        transmission: "Automatic",
        passenger_capacity: 5,
        carbon_emissions: 0,
        price_per_day: "105.00",
        image: null,
        branch_city: "Calgary",
      },
    ]);
  });

  it("renders the hero and search right away", () => {
    renderWithClient(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /drive green/i
    );
    expect(screen.getByText("Search Bar")).toBeInTheDocument();
  });

  it("shows live fleet stats instead of hard-coded numbers", async () => {
    renderWithClient(<HomePage />);
    expect(await screen.findByText("31")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
  });

  it("renders brands, body types, and featured cars", async () => {
    renderWithClient(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText("Tesla")).toBeInTheDocument();
      expect(screen.getByText("SUV")).toBeInTheDocument();
      expect(screen.getByText("Kia EV6")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /SUV/ })).toHaveAttribute(
      "href",
      "/select-vehicle?bodyTypes=Suv"
    );
  });

  it("navigates to rewards page when clicking Learn More", () => {
    renderWithClient(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /learn more/i }));
    expect(mockPush).toHaveBeenCalledWith("/rewards");
  });
});
