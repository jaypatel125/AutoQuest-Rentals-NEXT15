/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { SearchBar } from "./index";
import { useSearchStore } from "@/context/searchStore";
import { useRouter } from "next/navigation";
import { jsonResponse, renderWithClient } from "@/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/context/searchStore", () => ({
  ...jest.requireActual("@/context/searchStore"),
  useSearchStore: jest.fn(),
}));
jest.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div data-testid="calendar">Calendar</div>,
}));

const day = 24 * 60 * 60 * 1000;

describe("SearchBar component", () => {
  const mockRouter = { push: jest.fn() };
  const mockSetBranch = jest.fn();
  const mockSetDates = jest.fn();

  const store = (overrides: Record<string, unknown> = {}) =>
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: null,
      startDate: null,
      endDate: null,
      setBranch: mockSetBranch,
      setDates: mockSetDates,
      ...overrides,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    store();
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse([
        { id: "b1", name: "Downtown", city: "Toronto" },
        { id: "b2", name: "Airport", city: "Toronto" },
        { id: "b3", name: "Waterfront", city: "Vancouver" },
      ])
    ) as any;
  });

  it("renders location, pick-up, and return fields", () => {
    renderWithClient(<SearchBar />);
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Pick-up date")).toBeInTheDocument();
    expect(screen.getByText("Return date")).toBeInTheDocument();
  });

  it("disables Search button when required fields are empty", () => {
    renderWithClient(<SearchBar />);
    expect(
      screen.getByRole("button", { name: /search vehicles/i })
    ).toBeDisabled();
  });

  it("saves the trip and goes to results when searching", async () => {
    const start = new Date(Date.now() + 3 * day);
    const end = new Date(Date.now() + 6 * day);
    store({
      branch: { id: "b1", city: "Toronto" },
      startDate: start,
      endDate: end,
    });

    renderWithClient(<SearchBar />);
    expect(screen.getByText("3 days")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /search vehicles/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/select-vehicle");
    });
    expect(mockSetDates).toHaveBeenCalledWith(start, end);
    expect(mockSetBranch).toHaveBeenCalledWith({ id: "b1", city: "Toronto" });
  });

  it("calls onSearch instead of navigating when provided", async () => {
    const onSearch = jest.fn();
    store({
      branch: { id: "b1", city: "Toronto" },
      startDate: new Date(Date.now() + day),
      endDate: new Date(Date.now() + 2 * day),
    });

    renderWithClient(<SearchBar onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: /search vehicles/i }));

    await waitFor(() => expect(onSearch).toHaveBeenCalled());
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("lists each city once with its number of locations", async () => {
    renderWithClient(<SearchBar />);
    fireEvent.click(screen.getByText("Where are you going?"));
    expect(await screen.findByText("Vancouver")).toBeInTheDocument();
    expect(screen.getAllByText("Toronto")).toHaveLength(1);
    expect(screen.getByText("2 locations")).toBeInTheDocument();
  });
});
