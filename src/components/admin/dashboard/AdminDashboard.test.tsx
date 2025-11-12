import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { AdminDashboard } from ".";

jest.mock("@tanstack/react-query");
jest.mock("@/components/utility/Loader", () =>
  jest.fn(() => <div>Loading...</div>)
);
jest.mock("@/components/utility/Error", () => jest.fn(() => <div>Error!</div>));
jest.mock("./summary-cards", () => ({
  SummaryCards: jest.fn(() => <div>SummaryCards</div>),
}));
jest.mock("./tabs/overview-tab", () => ({
  OverviewTab: jest.fn(() => <div>OverviewTab</div>),
}));
jest.mock("./tabs/carbon-tab", () => ({
  CarbonTab: jest.fn(() => <div>CarbonTab</div>),
}));
jest.mock("./tabs/vehicles-tab", () => ({
  VehiclesTab: jest.fn(() => <div>VehiclesTab</div>),
}));
jest.mock("./tabs/customers-tab", () => ({
  CustomersTab: jest.fn(() => <div>CustomersTab</div>),
}));

describe("AdminDashboard (simple)", () => {
  const mockUseQuery = useQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loader while fetching", () => {
    mockUseQuery.mockReturnValue({ isLoading: true });
    render(<AdminDashboard />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error if query fails", () => {
    mockUseQuery.mockReturnValue({ isLoading: false, error: true });
    render(<AdminDashboard />);
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("renders summary cards when data is loaded", () => {
    mockUseQuery.mockReturnValue({ data: {}, isLoading: false, error: null });
    render(<AdminDashboard />);
    expect(screen.getByText("SummaryCards")).toBeInTheDocument();
  });
});
