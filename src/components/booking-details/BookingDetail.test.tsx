/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/display-name */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingDetail from "./index";
import { Booking } from "@/app/bookings/[bookingId]/actions";

// --- Mocks ---

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

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
  formatPrice: jest.fn((price) => `$${price}`),
}));

// Mock utility components
jest.mock("@/components/utility/Loader", () => () => (
  <div data-testid="loader" />
));
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <svg data-testid="arrow-left" />,
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
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
}));
jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

// --- Mock Data ---

const mockBooking: Booking = {
  booking_id: "BK-123",
  user_id: "U-1",
  car_id: "C-1",
  start_date: "2025-11-01T10:00:00Z",
  end_date: "2025-11-05T10:00:00Z",
  total_price: "500.00",
  booking_status: "Confirmed",
  booking_created_at: "2025-10-01T12:00:00Z",
  booking_updated_at: "2025-10-01T12:05:00Z",
  car_branch_id: "B-1",
  brand: "Tesla",
  model: "Model Y",
  transmission: "Automatic",
  fuel_type: "Electric",
  passenger_capacity: 5,
  body_type: "SUV",
  carbon_emissions: 0,
  price_per_day: "125.00",
  available: true,
  image: "/images/tesla.jpg",
  car_created_at: "2024-01-01T00:00:00Z",
  car_updated_at: "2024-01-01T00:00:00Z",
  branch_id: "B-1",
  branch_name: "Downtown EV Rentals",
  branch_address: "123 Main St",
  branch_city: "Metropolis",
  branch_province: "ON",
  branch_postal_code: "M1M 1M1",
  branch_created_at: "2023-01-01T00:00:00Z",
  branch_updated_at: "2023-01-01T00:00:00Z",
  points_earned: "1000",
  points_redeemed: "200",
};

// --- Tests ---

describe("BookingDetail Component", () => {
  beforeEach(() => {
    // Clear mock history before each test
    mockRouter.back.mockClear();
    mockRouter.push.mockClear();
    (require("@/lib/utils").formatPrice as jest.Mock).mockClear();
  });

  test("should render loading state", () => {
    render(<BookingDetail booking={undefined} isLoading={true} error={null} />);

    // Check for loader and loading text
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Fetching your bookings...")).toBeInTheDocument();
  });

  test("should render error state", () => {
    render(
      <BookingDetail
        booking={undefined}
        isLoading={false}
        error={new Error("Failed to fetch")}
      />
    );

    // Check for error message and recovery button
    expect(screen.getByText("Booking Not Found")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "View All Bookings" })
    ).toBeInTheDocument();
  });

  test("should render booking details successfully", () => {
    render(
      <BookingDetail booking={mockBooking} isLoading={false} error={null} />
    );

    // Check for key details from the mock booking
    expect(screen.getByText("Booking Details")).toBeInTheDocument();
    expect(
      screen.getByText(`ID: ${mockBooking.booking_id}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${mockBooking.brand} ${mockBooking.model}`)
    ).toBeInTheDocument();
    expect(screen.getByText(mockBooking.branch_name)).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  test("should call router.back() when 'Back' button is clicked", () => {
    render(
      <BookingDetail booking={mockBooking} isLoading={false} error={null} />
    );

    // Find the "Back" button and click it
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    // Assert that router.back was called
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
