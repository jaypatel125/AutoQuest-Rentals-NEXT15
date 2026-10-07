import { act, fireEvent, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ConfirmationDetails from "./index";
import type { ConfirmationData } from "@/app/(main)/confirmation/action";
import { useSearchStore } from "@/context/searchStore";
import { renderWithClient } from "@/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const day = 24 * 60 * 60 * 1000;

function confirmation(
  overrides: Partial<ConfirmationData> = {}
): ConfirmationData {
  return {
    status: "complete",
    customerEmail: "test@example.com",
    amountTotal: 304,
    currency: "CAD",
    startDate: new Date(Date.now() + 5 * day).toISOString(),
    endDate: new Date(Date.now() + 7 * day).toISOString(),
    redeemedPoints: 500,
    bookingId: "BK-1",
    pointsEarned: 608,
    car: {
      id: "c1",
      brand: "Tesla",
      model: "Model Y",
      image: null,
      fuel_type: "Electric",
      body_type: "Suv",
      transmission: "Automatic",
      passenger_capacity: 5,
      carbon_emissions: 0,
      price_per_day: "150.00",
    },
    branch: {
      name: "Main Branch",
      address: "1 King St",
      city: "Toronto",
      province: "ON",
      postal_code: null,
    },
    ...overrides,
  };
}

describe("ConfirmationDetails", () => {
  const push = jest.fn();
  const refresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push, refresh });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("confirms the booking and names the email address", () => {
    renderWithClient(<ConfirmationDetails data={confirmation()} />);
    expect(screen.getByText("Booking Confirmed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "You're all set!" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Thank you for your booking! A confirmation email has been sent to/
      )
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("shows the car, branch, total and points", () => {
    renderWithClient(<ConfirmationDetails data={confirmation()} />);
    expect(
      screen.getByRole("heading", { name: "Tesla Model Y" })
    ).toBeInTheDocument();
    expect(screen.getByText("Main Branch")).toBeInTheDocument();
    expect(screen.getByText("2 day rental")).toBeInTheDocument();
    expect(screen.getByText("$304.00")).toBeInTheDocument();
    expect(screen.getByText("+608")).toBeInTheDocument();
    expect(screen.getByText("-500")).toBeInTheDocument();
    expect(screen.getByText("2x EV bonus applied")).toBeInTheDocument();
  });

  it("links straight to the new booking", () => {
    renderWithClient(<ConfirmationDetails data={confirmation()} />);
    expect(screen.getByRole("link", { name: /view booking/i })).toHaveAttribute(
      "href",
      "/bookings/BK-1"
    );
    fireEvent.click(screen.getByRole("button", { name: /back to home/i }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("clears the selected car from the search store", () => {
    useSearchStore.setState({ selectedCar: { id: "c1" } as never });
    renderWithClient(<ConfirmationDetails data={confirmation()} />);
    expect(useSearchStore.getState().selectedCar).toBeUndefined();
  });

  it("refreshes while the webhook is still saving the booking", () => {
    jest.useFakeTimers();
    renderWithClient(
      <ConfirmationDetails
        data={confirmation({ bookingId: null, pointsEarned: null })}
      />
    );
    expect(screen.getByText(/finalizing your booking/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /view my bookings/i })
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
