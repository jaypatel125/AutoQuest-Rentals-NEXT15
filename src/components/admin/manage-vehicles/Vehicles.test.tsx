import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Vehicles from ".";

jest.mock("@tanstack/react-query");
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));
jest.mock("@/components/utility/Loader", () =>
  jest.fn(() => <div>Loading...</div>)
);
jest.mock("@/components/utility/Error", () =>
  jest.fn(({ error }) => <div>{error}</div>)
);
jest.mock("@/components/admin/manage-vehicles/vehicles", () =>
  jest.fn(() => <div>Vehicles Table</div>)
);

describe("Vehicles (simple)", () => {
  const mockUseQuery = useQuery as jest.Mock;
  const mockParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.mockReturnValue(new URLSearchParams());
  });

  it("shows loader while loading", () => {
    mockUseQuery.mockReturnValue({ isLoading: true });
    render(<Vehicles />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error when fetch fails", () => {
    mockUseQuery.mockReturnValue({ isError: true });
    render(<Vehicles />);
    expect(screen.getByText("Failed to load vehicles.")).toBeInTheDocument();
  });

  it("renders vehicle table when data is loaded", () => {
    mockUseQuery.mockReturnValue({
      data: [{ id: 1, branch_id: "1" }],
      isLoading: false,
      isError: false,
    });
    render(<Vehicles />);
    expect(screen.getByText("Vehicles Table")).toBeInTheDocument();
  });
});
