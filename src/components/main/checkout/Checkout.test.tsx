/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import Checkout from "./index";
import { useSearchStore } from "@/context/searchStore";
import { handleCheckout } from "@/app/(main)/checkout/actions";
import { fetchRewards } from "@/app/actions";
import { jsonResponse, renderWithClient } from "@/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/context/searchStore", () => ({
  ...jest.requireActual("@/context/searchStore"),
  useSearchStore: jest.fn(),
}));

jest.mock("@/app/(main)/checkout/actions", () => ({
  handleCheckout: jest.fn(),
}));

jest.mock("@/app/actions", () => ({
  fetchRewards: jest.fn(),
}));

const day = 24 * 60 * 60 * 1000;
const start = new Date(Date.now() + 5 * day);
const end = new Date(Date.now() + 7 * day);

const user: any = {
  id: "user_123",
  name: "Test User",
  email: "test@example.com",
  reward_points: 500,
};

const car: any = {
  id: "car_abc",
  brand: "Tesla",
  model: "Model Y",
  price_per_day: "150.00",
  fuel_type: "Electric",
  body_type: "Suv",
  transmission: "Automatic",
  passenger_capacity: 5,
  carbon_emissions: 0,
  image: null,
  branch_name: "Downtown",
  branch_city: "Toronto",
  branch_address: "123 Main St",
};

const setRedeemPoints = jest.fn();

function store(overrides: Record<string, unknown> = {}) {
  (useSearchStore as unknown as jest.Mock).mockReturnValue({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    selectedCar: car,
    redeemPoints: true,
    setRedeemPoints,
    ...overrides,
  });
}

describe("Checkout", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (fetchRewards as jest.Mock).mockResolvedValue({ balance: 500 });
    (handleCheckout as jest.Mock).mockReset();
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(car)) as any;
    store();
  });

  it("asks for a car when none is selected", () => {
    store({ selectedCar: undefined });
    renderWithClient(<Checkout user={user} />);
    expect(
      screen.getByText("No car selected. Please go back and choose a vehicle.")
    ).toBeInTheDocument();
  });

  it("asks guests to sign in", () => {
    renderWithClient(<Checkout user={null as any} />);
    expect(
      screen.getByText("You must be logged in to proceed to checkout.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/signin?next=/checkout"
    );
  });

  it("asks for dates when they are missing", () => {
    store({ startDate: undefined });
    renderWithClient(<Checkout user={user} />);
    expect(
      screen.getByText("Please select valid rental dates to proceed.")
    ).toBeInTheDocument();
  });

  it("shows the trip, renter and price breakdown", () => {
    renderWithClient(<Checkout user={user} />);
    expect(screen.getByText("Tesla Model Y")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    // 2 days x $150 + $15 fee + $39 HST = $354.00, minus 500 pts ($50)
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    expect(screen.getByText("-$50.00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /pay now \$304\.00/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/\+608 pts/)).toBeInTheDocument();
  });

  it("charges full price when points are turned off", () => {
    store({ redeemPoints: false });
    renderWithClient(<Checkout user={user} />);
    expect(
      screen.getByRole("button", { name: /pay now \$354\.00/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/turn on to save \$50\.00/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: /use reward points/i }));
    expect(setRedeemPoints).toHaveBeenCalledWith(true);
  });

  it("requires accepting the terms before paying", () => {
    renderWithClient(<Checkout user={user} />);
    const pay = screen.getByRole("button", { name: /pay now/i });
    expect(pay).toBeDisabled();

    fireEvent.click(
      screen.getByRole("checkbox", { name: /i agree to the rental terms/i })
    );
    expect(pay).toBeEnabled();
  });

  it("sends only ids, dates and the points choice, then redirects to Stripe", async () => {
    (handleCheckout as jest.Mock).mockResolvedValue({
      url: "https://checkout.stripe.com/c/session_123",
    });
    renderWithClient(<Checkout user={user} />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /i agree to the rental terms/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        "https://checkout.stripe.com/c/session_123"
      )
    );
    expect(handleCheckout).toHaveBeenCalledWith({
      carId: "car_abc",
      startDate: start,
      endDate: end,
      redeemPoints: true,
    });
  });

  it("shows the server error when checkout fails", async () => {
    (handleCheckout as jest.Mock).mockRejectedValue(
      new Error("This car is already booked for some of these dates.")
    );
    renderWithClient(<Checkout user={user} />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /i agree to the rental terms/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));

    expect(await screen.findByText(/already booked/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("explains a cancelled payment", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("cancelled=1")
    );
    renderWithClient(<Checkout user={user} />);
    expect(screen.getByText(/payment was cancelled/i)).toBeInTheDocument();
  });
});
