import { render, screen, fireEvent } from "@testing-library/react";
import Bookings from "./index";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const pushMock = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: pushMock });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockData: any[] = [
  {
    id: "1",
    booking_id: "1",
    user_id: "user1",
    car_id: "car1",
    brand: "Toyota",
    model: "Camry",
    image: "/car.png",
    branch_name: "Main Branch",
    city: "Toronto",
    province: "ON",
    start_date: "2025-11-12",
    end_date: "2025-11-15",
    status: "Confirmed",
    created_at: "2025-11-10",
    updated_at: "2025-11-11",
    total_price: 150,
    price_per_day: 50,
    points_earned: 100,
    points_redeemed: 20,
  },
];

describe("Bookings component", () => {
  it("renders loader when isLoading is true", () => {
    render(<Bookings isLoading={true} isError={false} />);
    expect(screen.getByText(/fetching your bookings/i)).toBeInTheDocument();
  });

  it("renders error message when isError is true", () => {
    render(<Bookings isLoading={false} isError={true} />);
    expect(screen.getByText(/failed to load bookings/i)).toBeInTheDocument();
  });

  it("renders empty state when no bookings", () => {
    render(<Bookings isLoading={false} isError={false} data={[]} />);
    expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    const browseBtn = screen.getByRole("button", { name: /browse cars/i });
    fireEvent.click(browseBtn);
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("renders booking cards when data is provided", () => {
    render(<Bookings isLoading={false} isError={false} data={mockData} />);
    expect(screen.getByText(/toyota camry/i)).toBeInTheDocument();
    expect(screen.getByText(/main branch, toronto, on/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/\+100/i)).toBeInTheDocument();

    const viewBtn = screen.getByRole("button", { name: /view details/i });
    fireEvent.click(viewBtn);
    expect(pushMock).toHaveBeenCalledWith("/bookings/1");
  });
});
