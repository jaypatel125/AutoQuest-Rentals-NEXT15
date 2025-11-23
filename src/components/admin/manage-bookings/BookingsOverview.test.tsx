/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import BookingsOverview from "@/app/(admin)/admin/manage-bookings/page";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Mock all external dependencies
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));
jest.mock("@/components/admin/manage-bookings/bookings-table", () => ({
  __esModule: true,
  default: ({ table }: any) => (
    <div data-testid="bookings-table">
      Table Rendered ({table?.options?.data?.length || 0})
    </div>
  ),
  columns: [{ id: "email", getCanHide: () => true }],
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("BookingsOverview", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => ""),
      toString: () => "",
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/admin/manage-bookings");
  });

  it("renders loader when loading", () => {
    (useQuery as jest.Mock).mockReturnValue({ isLoading: true });
    render(<BookingsOverview />);
    expect(screen.getByText(/Loading bookings/i)).toBeInTheDocument();
  });

  it("renders error message on failure", () => {
    (useQuery as jest.Mock).mockReturnValue({ isError: true });
    render(<BookingsOverview />);
    expect(screen.getByText(/Failed to load bookings/i)).toBeInTheDocument();
  });
});
