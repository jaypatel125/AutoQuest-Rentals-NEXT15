import { fireEvent, render, screen } from "@testing-library/react";
import Bookings from "./index";
import type { Booking } from "@/app/(main)/bookings/actions";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

const day = 24 * 60 * 60 * 1000;
const isoIn = (days: number) =>
  new Date(Date.now() + days * day).toISOString().slice(0, 10);

function booking(overrides: Partial<Booking>): Booking {
  return {
    booking_id: "1",
    id: "1",
    user_id: "user1",
    car_id: "car1",
    start_date: isoIn(5),
    end_date: isoIn(8),
    sub_total: "165.00",
    total_price: "186.45",
    status: "Confirmed",
    created_at: isoIn(-1),
    updated_at: isoIn(-1),
    refund_amount: null,
    cancelled_at: null,
    brand: "Toyota",
    model: "Camry",
    image: "",
    price_per_day: "50.00",
    fuel_type: "Hybrid",
    body_type: "Sedan",
    carbon_emissions: 95,
    branch_id: "b1",
    branch_name: "Main Branch",
    city: "Toronto",
    province: "ON",
    postal_code: null,
    points_earned: "186",
    points_redeemed: "20",
    ...overrides,
  };
}

const upcoming = booking({});
const past = booking({
  booking_id: "2",
  id: "2",
  brand: "Honda",
  model: "Civic",
  start_date: isoIn(-10),
  end_date: isoIn(-7),
  status: "Completed",
});
const cancelled = booking({
  booking_id: "3",
  id: "3",
  brand: "Kia",
  model: "EV6",
  status: "Cancelled",
  refund_amount: "120.50",
  cancelled_at: isoIn(-2),
});

describe("Bookings", () => {
  it("shows a loading state", () => {
    render(<Bookings isLoading isError={false} />);
    expect(
      screen.getByRole("status", { name: /fetching your bookings/i })
    ).toBeInTheDocument();
  });

  it("shows an error message", () => {
    render(<Bookings isLoading={false} isError />);
    expect(screen.getByText(/failed to load bookings/i)).toBeInTheDocument();
  });

  it("points new customers to the fleet", () => {
    render(<Bookings isLoading={false} isError={false} data={[]} />);
    expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse cars/i })).toHaveAttribute(
      "href",
      "/select-vehicle"
    );
  });

  it("lists upcoming trips with a countdown and links to details", () => {
    render(
      <Bookings
        isLoading={false}
        isError={false}
        data={[upcoming, past, cancelled]}
      />
    );
    expect(screen.getByRole("tab", { name: /upcoming/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText(/Pick-up in [45] days/)).toBeInTheDocument();
    expect(screen.getByText("$186.45")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /toyota camry/i })).toHaveAttribute(
      "href",
      "/bookings/1"
    );
    expect(screen.queryByText("Honda Civic")).not.toBeInTheDocument();
  });

  it("separates past and cancelled trips into tabs", () => {
    render(
      <Bookings
        isLoading={false}
        isError={false}
        data={[upcoming, past, cancelled]}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /past/i }));
    expect(screen.getByText("Honda Civic")).toBeInTheDocument();
    expect(screen.queryByText("Toyota Camry")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /cancelled/i }));
    expect(screen.getByText("Kia EV6")).toBeInTheDocument();
    expect(screen.getByText("Refunded")).toBeInTheDocument();
    expect(screen.getByText("$120.50")).toBeInTheDocument();
  });

  it("opens on the past tab when nothing is upcoming", () => {
    render(<Bookings isLoading={false} isError={false} data={[past]} />);
    expect(screen.getByRole("tab", { name: /past/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Honda Civic")).toBeInTheDocument();
  });
});
