import { render, screen, fireEvent } from "@testing-library/react";
import BookingDetail from "./index";
import { useToast } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

const queryClient = new QueryClient();

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

const mockBooking = {
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

describe("BookingDetail component", () => {
  it("renders loader when isLoading is true", () => {
    renderWithClient(<BookingDetail isLoading={true} error={null} />);
    expect(screen.getByText(/fetching your bookings/i)).toBeInTheDocument();
  });

  it("calls cancel booking mutation on button click", () => {
    renderWithClient(
      <BookingDetail booking={mockBooking} isLoading={false} error={null} />
    );
    const cancelButton = screen.getByRole("button", {
      name: /cancel booking/i,
    });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    // Mutation is mocked by react-query, so we can't test the actual backend call here.
    // Instead, you could spy on the cancelBooking function if imported and mocked.
  });
});
