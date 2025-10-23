/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
/**
 * ConfirmationDetails.test.tsx
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ConfirmationDetails from "./index";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // remove Next-specific props that are invalid on <img>
    const { fill, priority, placeholder, quality, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// Mock card components used in the component
jest.mock("../ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Button to avoid importing cn/buttonVariants implementation
jest.mock("../ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock Loader
jest.mock("../utility/Loader", () => () => (
  <div data-testid="loader">Loading...</div>
));

// Mock utils (formatPrice)
jest.mock("@/lib/utils", () => ({
  formatPrice: (price: number) => `$${Number(price).toFixed(2)}`,
}));

// Mock search store and router
jest.mock("@/context/searchStore", () => ({
  useSearchStore: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock react-query
const invalidateQueriesMock = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/context/searchStore";

describe("ConfirmationDetails", () => {
  const defaultProps = {
    status: "complete",
    customerEmail: "jay@example.com",
    amountTotal: 5000,
    currency: "CAD",
    metadata: {
      carId: "car123",
      branch: "Toronto",
      startDate: "2025-10-10T00:00:00Z",
      endDate: "2025-10-12T00:00:00Z",
      redeemedPoints: 100,
      total: 50,
    },
  };

  const mockRouter = { push: jest.fn(), refresh: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchStore as unknown as jest.Mock).mockReturnValue({
      branch: {
        id: "1",
        name: "Toronto",
        address: "123 St",
        city: "Toronto",
        province: "ON",
      },
    });
  });

  it("renders booking confirmation message", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<ConfirmationDetails {...defaultProps} />);

    expect(await screen.findByText(/Booking Confirmed/i)).toBeInTheDocument();
    expect(await screen.findByText(/jay@example.com/i)).toBeInTheDocument();
  });

  it("renders loader while fetching vehicle", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<ConfirmationDetails {...defaultProps} />);
    expect(await screen.findByTestId("loader")).toBeInTheDocument();
  });

  it("renders message when status is not complete", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<ConfirmationDetails {...defaultProps} status="pending" />);
    expect(
      await screen.findByText(/We appreciate your business/i)
    ).toBeInTheDocument();
  });
});
