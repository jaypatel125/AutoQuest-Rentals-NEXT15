import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import BookingDetail from "./index";
import { useToast } from "@/hooks/use-toast";
import {
  Booking,
  cancelBooking,
} from "@/app/(main)/bookings/[bookingId]/actions";
import { renderWithClient } from "@/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/app/(main)/bookings/[bookingId]/actions", () => ({
  cancelBooking: jest.fn(),
}));

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const mockToast = jest.fn();

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    booking_id: "BK-123",
    user_id: "U-1",
    car_id: "C-1",
    start_date: new Date(Date.now() + 10 * day).toISOString(),
    end_date: new Date(Date.now() + 14 * day).toISOString(),
    sub_total: "500.00",
    total_price: "560.00",
    booking_status: "Confirmed",
    booking_created_at: new Date(Date.now() - day).toISOString(),
    booking_updated_at: new Date(Date.now() - day).toISOString(),
    cancelled_at: null,
    refund_amount: null,
    paid_online: true,
    car_branch_id: "B-1",
    brand: "Tesla",
    model: "Model Y",
    transmission: "Automatic",
    fuel_type: "Electric",
    passenger_capacity: 5,
    body_type: "Suv",
    carbon_emissions: 0,
    price_per_day: "125.00",
    available: true,
    image: "",
    branch_id: "B-1",
    branch_name: "Downtown EV Rentals",
    branch_address: "123 Main St",
    branch_city: "Toronto",
    branch_province: "ON",
    branch_postal_code: "M1M 1M1",
    points_earned: "1000",
    points_redeemed: "200",
    ...overrides,
  };
}

describe("BookingDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (cancelBooking as jest.Mock).mockReset();
  });

  it("shows a loader while fetching", () => {
    renderWithClient(<BookingDetail isLoading error={null} />);
    expect(screen.getByText("Fetching your booking...")).toBeInTheDocument();
  });

  it("shows an error when the booking cannot be loaded", () => {
    renderWithClient(
      <BookingDetail isLoading={false} error={new Error("boom")} />
    );
    expect(
      screen.getByText(/failed to load booking details/i)
    ).toBeInTheDocument();
  });

  it("renders the car, branch, price breakdown and rewards", () => {
    renderWithClient(
      <BookingDetail booking={booking()} isLoading={false} error={null} />
    );
    expect(
      screen.getByRole("heading", { name: "Tesla Model Y" })
    ).toBeInTheDocument();
    expect(screen.getByText("Downtown EV Rentals")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("-$20.00")).toBeInTheDocument();
    expect(screen.getByText("$560.00")).toBeInTheDocument();
    expect(screen.getByText("+1,000 pts")).toBeInTheDocument();
    expect(screen.getByText(/thank you for choosing an/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get directions/i })
    ).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
  });

  it("offers a full refund more than 24 hours before pick-up", async () => {
    (cancelBooking as jest.Mock).mockResolvedValue({
      success: true,
      refund: 560,
      fee: 0,
      refundedAutomatically: true,
    });
    renderWithClient(
      <BookingDetail booking={booking()} isLoading={false} error={null} />
    );
    expect(screen.getByText(/free cancellation until 24 hours/i)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /cancel booking/i }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("You'll be refunded")).toBeInTheDocument();
    expect(within(dialog).getAllByText("$560.00")).toHaveLength(2);
    expect(
      within(dialog).queryByText(/late cancellation fee/i)
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Yes, cancel" })
    );

    await waitFor(() => expect(cancelBooking).toHaveBeenCalledWith("BK-123"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Booking Cancelled",
          description: "Your refund of $560.00 is on its way.",
        })
      )
    );
  });

  it("keeps one day's rental plus tax inside 24 hours", async () => {
    renderWithClient(
      <BookingDetail
        booking={booking({
          start_date: new Date(Date.now() + 10 * hour).toISOString(),
        })}
        isLoading={false}
        error={null}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel booking/i }));
    const dialog = await screen.findByRole("dialog");
    // $125 + 13% HST
    expect(within(dialog).getByText("-$141.25")).toBeInTheDocument();
    expect(within(dialog).getByText("$418.75")).toBeInTheDocument();
  });

  it("shows the server error if cancelling fails", async () => {
    (cancelBooking as jest.Mock).mockRejectedValue(
      new Error("We couldn't process your refund right now.")
    );
    renderWithClient(
      <BookingDetail booking={booking()} isLoading={false} error={null} />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel booking/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Yes, cancel" }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Could not cancel",
          variant: "destructive",
        })
      )
    );
  });

  it("does not allow cancelling once the rental has started", () => {
    renderWithClient(
      <BookingDetail
        booking={booking({
          start_date: new Date(Date.now() - day).toISOString(),
        })}
        isLoading={false}
        error={null}
      />
    );
    expect(
      screen.getByRole("button", { name: /cancel booking/i })
    ).toBeDisabled();
    expect(screen.getByText(/already started/i)).toBeInTheDocument();
  });

  it("shows the refund on a cancelled booking", () => {
    renderWithClient(
      <BookingDetail
        booking={booking({
          booking_status: "Cancelled",
          refund_amount: "560.00",
          cancelled_at: new Date().toISOString(),
        })}
        isLoading={false}
        error={null}
      />
    );
    expect(screen.getByText("Refund")).toBeInTheDocument();
    expect(screen.getByText(/cancelled on/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cancel booking/i })
    ).not.toBeInTheDocument();
  });
});
