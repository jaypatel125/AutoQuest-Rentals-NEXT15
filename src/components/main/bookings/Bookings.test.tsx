/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/display-name */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Bookings from "./index"; // Adjust path as needed
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Booking } from "@/app/(main)/bookings/actions"; // Adjust path as needed

// --- Mocks ---

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock helper functions
jest.mock("@/lib/utils", () => ({
  formatDate: jest.fn((dateStr) => new Date(dateStr).toLocaleDateString()),
  formatPrice: jest.fn((price) => `$${Number(price).toFixed(2)}`),
}));

// Mock utility components
jest.mock("@/components/utility/Loader", () => () => (
  <div data-testid="loader" />
));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <svg data-testid="arrow-left" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

// --- Mock Data ---

// Create a mock router object
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
} as unknown as AppRouterInstance;

const mockBooking: Booking = {
  booking_id: "bk_123",
  image: "/images/car.jpg",
  brand: "Toyota",
  model: "Camry",
  branch_name: "Airport",
  city: "Testville",
  province: "ON",
  start_date: "2025-10-01T10:00:00Z",
  end_date: "2025-10-05T10:00:00Z",
  status: "confirmed",
  created_at: "2025-09-01T12:00:00Z",
  total_price: "400.00",
  price_per_day: "100.00",
  points_earned: "400",
  points_redeemed: "50",
  // Add any other required fields from your 'Booking' type
  id: "bk_123",
  user_id: "user_abc",
  car_id: "car_xyz",
  updated_at: "",
  branch_id: "",
  postal_code: null,
};

// --- Tests ---

describe("Bookings Component", () => {
  beforeEach(() => {
    // Clear mock function calls before each test
    (mockRouter.back as jest.Mock).mockClear();
    (mockRouter.push as jest.Mock).mockClear();
    (require("@/lib/utils").formatDate as jest.Mock).mockClear();
    (require("@/lib/utils").formatPrice as jest.Mock).mockClear();
  });

  test("should render loading state", () => {
    render(
      <Bookings
        isLoading={true}
        isError={false}
        data={[]}
        router={mockRouter}
      />
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Fetching your bookings...")).toBeInTheDocument();
  });

  test("should render error state", () => {
    render(
      <Bookings
        isLoading={false}
        isError={true}
        data={[]}
        router={mockRouter}
      />
    );

    expect(
      screen.getByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  test("should render empty state and handle 'Browse Cars' click", () => {
    render(
      <Bookings
        isLoading={false}
        isError={false}
        data={[]}
        router={mockRouter}
      />
    );

    // Check for empty state text
    expect(screen.getByText("No bookings found")).toBeInTheDocument();
    expect(
      screen.getByText(/You haven't made any bookings yet./i)
    ).toBeInTheDocument();

    // Find and click the "Browse Cars" button
    const browseButton = screen.getByRole("button", { name: "Browse Cars" });
    fireEvent.click(browseButton);

    // Check if router.push was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  test("should render booking list and handle 'View Details' click", () => {
    render(
      <Bookings
        isLoading={false}
        isError={false}
        data={[mockBooking]}
        router={mockRouter}
      />
    );

    // Check that booking details are rendered
    expect(screen.getByText("Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText("Airport, Testville, ON")).toBeInTheDocument();
    expect(screen.getByText("+400")).toBeInTheDocument(); // Points earned
    expect(screen.getByText("-50")).toBeInTheDocument(); // Points redeemed

    // Find and click the "View Details" button
    const detailsButton = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(detailsButton);

    // Check if router.push was called with the correct booking ID
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/bookings/${mockBooking.booking_id}`
    );
  });
});
