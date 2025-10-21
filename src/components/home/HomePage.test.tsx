/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "./index";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Mock the database actions to prevent serverless import errors
jest.mock("@/app/actions", () => ({
  fetchCarBrands: jest.fn(),
  fetchCarBodyTypes: jest.fn(),
}));

// Mock components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/Seachbar", () => ({
  SearchBar: () => <div>Search Bar</div>,
}));

jest.mock("../utility/Loader", () => () => <div>Loading...</div>);

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: any) => <img {...props} />,
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Car: () => <span>CarIcon</span>,
  CalendarIcon: () => <span>CalendarIcon</span>,
  MapPin: () => <span>MapPinIcon</span>,
}));

// Typecast mocks
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe("HomePage", () => {
  const mockBrands = ["Tesla", "Toyota", "BMW"];
  const mockBodyTypes = ["SUV", "Sedan", "Hatchback"];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    // Default mock for useQuery - return successful data
    mockedUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "brands") {
        return { data: mockBrands, isLoading: false, error: null };
      }
      if (queryKey[0] === "bodyTypes") {
        return { data: mockBodyTypes, isLoading: false, error: null };
      }
      return { data: null, isLoading: false, error: null };
    });
  });

  it("shows loading state when data is loading", () => {
    mockedUseQuery.mockImplementation(({ queryKey }) => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    render(<HomePage />);

    expect(screen.getByText("Fetching vehicle details...")).toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockedUseQuery.mockImplementation(({ queryKey }) => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    }));

    render(<HomePage />);

    expect(screen.getByText("Vehicle details not found")).toBeInTheDocument();
  });

  it("navigates to rewards page when Learn More button is clicked", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByText("Learn More"));
    expect(mockPush).toHaveBeenCalledWith("/rewards");
  });

  it("displays all brands and body types from API", () => {
    render(<HomePage />);

    mockBrands.forEach((brand) => {
      expect(screen.getByText(brand)).toBeInTheDocument();
    });

    mockBodyTypes.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });
});
