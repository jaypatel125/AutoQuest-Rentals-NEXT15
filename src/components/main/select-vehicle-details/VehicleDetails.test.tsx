/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import VehicleDetails from "./index";
import { Cars as CarType } from "@/lib/database/table-types";

// Mock components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-testid="car-image"
    />
  ),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Users: () => <span data-testid="users-icon" />,
  Fuel: () => <span data-testid="fuel-icon" />,
  CarFront: () => <span data-testid="carfront-icon" />,
  ArrowLeft: () => <span data-testid="arrowleft-icon" />,
  ArrowRight: () => <span data-testid="arrowright-icon" />,
}));

// Mock utility function
jest.mock("@/lib/utils", () => ({
  formatPrice: (price: number) => `$${price}.00`,
}));

const mockCar: CarType = {
  id: "1",
  brand: "Tesla",
  model: "Model 3",
  body_type: "Sedan",
  carbon_emissions: 0,
  passenger_capacity: 5,
  transmission: "Automatic",
  fuel_type: "Electric",
  price_per_day: 99,
  image: "/tesla-model3.jpg",
  available: true,
  branch_id: "1",
  created_at: new Date(),
  updated_at: new Date(),
};

const mockOnRentNow = jest.fn();
const mockOnBack = jest.fn();

describe("VehicleDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders car details correctly", () => {
    render(
      <VehicleDetails
        car={mockCar}
        onRentNow={mockOnRentNow}
        onBack={mockOnBack}
      />
    );

    // Check main car information
    expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();

    // Check car specifications
    expect(screen.getByText("Sedan")).toBeInTheDocument();
    expect(screen.getByText("0 g/km CO2")).toBeInTheDocument();
    expect(screen.getByText("5 Passengers")).toBeInTheDocument();
    expect(screen.getByText("Automatic")).toBeInTheDocument();
    expect(screen.getByText("Electric")).toBeInTheDocument();

    // Check image
    const image = screen.getByTestId("car-image");
    expect(image).toHaveAttribute("src", "/tesla-model3.jpg");
    expect(image).toHaveAttribute("alt", "Tesla Model 3");
  });

  it("calls onBack when back button is clicked", () => {
    render(
      <VehicleDetails
        car={mockCar}
        onRentNow={mockOnRentNow}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("calls onRentNow when rent now button is clicked", () => {
    render(
      <VehicleDetails
        car={mockCar}
        onRentNow={mockOnRentNow}
        onBack={mockOnBack}
      />
    );

    const rentButton = screen.getByText("Rent Now");
    fireEvent.click(rentButton);

    expect(mockOnRentNow).toHaveBeenCalledTimes(1);
  });

  it("uses placeholder image when car image is not provided", () => {
    const carWithoutImage = { ...mockCar, image: "" };

    render(
      <VehicleDetails
        car={carWithoutImage}
        onRentNow={mockOnRentNow}
        onBack={mockOnBack}
      />
    );

    const image = screen.getByTestId("car-image");
    expect(image).toHaveAttribute("src", "/car-placeholder.png");
    expect(image).toHaveAttribute("alt", "Tesla Model 3");
  });
});
