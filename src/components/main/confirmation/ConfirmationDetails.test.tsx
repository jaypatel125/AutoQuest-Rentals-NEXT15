import { render, screen } from "@testing-library/react";
import ConfirmationDetails from "./index";

// Mock hooks and dependencies
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/context/searchStore", () => ({
  useSearchStore: () => ({
    branch: { id: "1", name: "Main Branch", city: "Toronto", province: "ON" },
  }),
}));

describe("ConfirmationDetails", () => {
  const baseProps = {
    status: "complete",
    customerEmail: "test@example.com",
    amountTotal: 10000,
    currency: "USD",
    metadata: {
      carId: "1",
      branch: "Main Branch",
      startDate: "2025-11-10",
      endDate: "2025-11-12",
      redeemedPoints: 200,
      total: 10000,
    },
  };

  it("renders booking confirmation message", () => {
    render(<ConfirmationDetails {...baseProps} />);
    expect(screen.getByText(/Booking Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("renders fallback message when status is not complete", () => {
    render(<ConfirmationDetails {...baseProps} status="pending" />);
    expect(
      screen.getByText(/We appreciate your business!/i)
    ).toBeInTheDocument();
  });

  it("renders rewards summary when Car data exists", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockUseQuery = require("@tanstack/react-query").useQuery;
    mockUseQuery.mockReturnValueOnce({
      data: { fuel_type: "electric", brand: "Tesla", model: "Model 3" },
      isLoading: false,
      error: null,
    });

    render(<ConfirmationDetails {...baseProps} />);
    expect(screen.getByText(/Rewards Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Electric Vehicle/i)).toBeInTheDocument();
  });
});
