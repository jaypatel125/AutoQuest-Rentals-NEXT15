/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, screen, waitFor } from "@testing-library/react";
import VehicleDetails from "./index";
import { useSearchStore } from "@/context/searchStore";
import { jsonResponse, renderWithClient } from "@/test-utils";

jest.mock("@/context/searchStore", () => ({
  ...jest.requireActual("@/context/searchStore"),
  useSearchStore: jest.fn(),
}));

const day = 24 * 60 * 60 * 1000;

const car: any = {
  id: "c1",
  brand: "Tesla",
  model: "Model 3",
  price_per_day: "119.00",
  body_type: "Sedan",
  passenger_capacity: 5,
  transmission: "Automatic",
  fuel_type: "Electric",
  carbon_emissions: 0,
  available: true,
  image: "https://autoquest.s3.us-east-2.amazonaws.com/vehicles/tesla.png",
  branch_name: "AutoQuest Downtown",
  branch_city: "Toronto",
  branch_address: "100 King St W",
};

function withDates(dates: boolean) {
  (useSearchStore as unknown as jest.Mock).mockReturnValue({
    startDate: dates ? new Date(Date.now() + 5 * day) : undefined,
    endDate: dates ? new Date(Date.now() + 9 * day) : undefined,
    setDates: jest.fn(),
  });
}

describe("VehicleDetails", () => {
  const onRentNow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ available: true })) as any;
  });

  it("renders car details and specs", () => {
    withDates(false);
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);
    expect(
      screen.getByRole("heading", { name: "Tesla Model 3" })
    ).toBeInTheDocument();
    expect(screen.getByText("$119.00")).toBeInTheDocument();
    expect(screen.getByText("5 passengers")).toBeInTheDocument();
    expect(screen.getByText("AutoQuest Downtown")).toBeInTheDocument();
  });

  it("asks for dates before renting", () => {
    withDates(false);
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);
    expect(
      screen.getByRole("button", { name: /pick dates to continue/i })
    ).toBeDisabled();
  });

  it("checks availability and shows the trip total", async () => {
    withDates(true);
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);

    expect(
      await screen.findByText(/available for your dates/i)
    ).toBeInTheDocument();
    // 4 days x $119 + $15 fee + 13% HST = $552.88
    expect(screen.getByText("$552.88")).toBeInTheDocument();
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
      "/api/vehicles/c1/availability"
    );
  });

  it("calls onRentNow when the car is available", async () => {
    withDates(true);
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);
    const button = await screen.findByRole("button", { name: /rent now/i });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    expect(onRentNow).toHaveBeenCalledTimes(1);
  });

  it("blocks renting when the car is already booked", async () => {
    withDates(true);
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        available: false,
        reason: "Already booked for some of these dates.",
      })
    );
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);
    expect(await screen.findByText(/already booked/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rent now/i })).toBeDisabled();
  });

  it("shows an illustration instead of a dead S3 photo", () => {
    withDates(false);
    renderWithClient(<VehicleDetails car={car} onRentNow={onRentNow} />);
    expect(
      screen.queryByRole("img", { name: "Tesla Model 3" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Tesla Model 3 illustration/i })
    ).toBeInTheDocument();
  });
});
