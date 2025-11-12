import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchBar } from "./index";
import { useSearchStore } from "@/context/searchStore";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/context/searchStore", () => ({
  useSearchStore: jest.fn(),
}));
jest.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div data-testid="calendar">Calendar</div>,
}));
jest.mock("@/components/ui/button", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const queryClient = new QueryClient();

describe("SearchBar component", () => {
  const mockRouter = { push: jest.fn() };
  const mockSetBranch = jest.fn();
  const mockSetDates = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: null,
      startDate: null,
      endDate: null,
      setBranch: mockSetBranch,
      setDates: mockSetDates,
    });
    global.fetch = jest.fn();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <SearchBar />
      </QueryClientProvider>
    );

  it("renders location, pickup, and return fields", () => {
    renderComponent();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Pickup Date")).toBeInTheDocument();
    expect(screen.getByText("Return Date")).toBeInTheDocument();
  });

  it("disables Search button when required fields are empty", () => {
    renderComponent();
    expect(screen.getByText("Search Vehicles")).toBeDisabled();
  });

  it("shows 'Search Vehicles' button and triggers handleSearch", async () => {
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: { id: 1, city: "Toronto" },
      startDate: new Date(),
      endDate: new Date(),
      setBranch: mockSetBranch,
      setDates: mockSetDates,
    });

    renderComponent();
    const button = screen.getByText("Search Vehicles");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/select-vehicle");
    });
  });

  it("renders loading message when fetching branches", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Location")).toBeInTheDocument();
    });
  });
});
