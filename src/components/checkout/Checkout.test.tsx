/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils"; // Import act for async updates
import "@testing-library/jest-dom";
import Checkout from "./index";
import * as searchStore from "@/context/searchStore";
import { IUser } from "../../../auth-client";
import * as checkoutActions from "@/app/checkout/actions";

// --- Mocks ---

// Mock next/navigation (useRouter)
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock the checkout server action
const mockHandleCheckout = jest.spyOn(checkoutActions, "handleCheckout");

// Mock the useSearchStore hook
const mockUseSearchStore = jest.spyOn(searchStore, "useSearchStore");

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock helper functions
jest.mock("@/lib/utils", () => ({
  formatPrice: jest.fn((price) => `$${Number(price).toFixed(2)}`),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <svg data-testid="arrow-left" />,
  ArrowRight: () => <svg data-testid="arrow-right" />,
  Info: () => <svg data-testid="info-icon" />,
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));
jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));
// Mock Tooltip components to just render their children
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// --- Mock Data ---

const mockUser: IUser = {
  id: "user_123",
  name: "Test User",
  email: "test@example.com",
  reward_points: 500,
  // Add other fields from IUser as necessary
  emailVerified: true,
  image: null,
  createdAt: new Date("2025-10-01T10:00:00Z"),
  updatedAt: new Date("2025-10-01T10:00:00Z"),
  banned: undefined,
};

const mockCar = {
  id: "car_abc",
  brand: "Tesla",
  model: "Model Y",
  price_per_day: 150,
  fuel_type: "Electric",
  image: "/tesla.jpg",
  // Add other fields from Car as necessary
  transmission: "Automatic",
  passenger_capacity: 5,
  body_type: "SUV",
  carbon_emissions: 0,
  available: true,
  car_created_at: "",
  car_updated_at: "",
  car_branch_id: "b1",
};

const mockBranch = {
  id: "b1",
  name: "Downtown",
  address: "123 Main St",
  city: "Testville",
  province: "ON",
  postal_code: "L8P 1A1",
  // Add other fields from Branch as necessary
  created_at: "",
  updated_at: "",
};

const mockStoreState = {
  startDate: "2025-10-01T10:00:00Z",
  endDate: "2025-10-03T10:00:00Z", // 2 days
  selectedCar: mockCar,
  branch: mockBranch,
};

// --- Tests ---

describe("Checkout Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockRouter.back.mockClear();
    mockRouter.push.mockClear();
    mockHandleCheckout.mockClear();
    mockUseSearchStore.mockClear();
    (require("@/lib/utils").formatPrice as jest.Mock).mockClear();
    (require("@/lib/utils").formatPrice as jest.Mock).mockImplementation(
      (price) => `$${Number(price).toFixed(2)}`
    );
  });

  test("should render 'No car selected' message if no car is in store", () => {
    mockUseSearchStore.mockReturnValue({
      ...mockStoreState,
      selectedCar: null,
    });
    render(<Checkout user={mockUser} />);

    expect(screen.getByText(/No car selected/i)).toBeInTheDocument();
  });

  test("should render 'must be logged in' message if no user is provided", () => {
    mockUseSearchStore.mockReturnValue(mockStoreState);
    // Pass null or undefined for the user prop
    render(<Checkout user={null as any} />);

    expect(screen.getByText(/You must be logged in/i)).toBeInTheDocument();
  });

  test("should render 'select valid rental dates' message if dates are missing", () => {
    mockUseSearchStore.mockReturnValue({
      ...mockStoreState,
      startDate: null,
    });
    render(<Checkout user={mockUser} />);

    expect(
      screen.getByText(/Please select valid rental dates/i)
    ).toBeInTheDocument();
  });

  test("should render checkout details and handle payment", async () => {
    // Set up all mocks for a successful render
    mockUseSearchStore.mockReturnValue(mockStoreState);
    mockHandleCheckout.mockResolvedValue({
      url: "https://mock.stripe.checkout/session_123",
    });

    render(<Checkout user={mockUser} />);

    // Check if key details are rendered
    expect(screen.getByText("Tesla Model Y")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();

    // Find and click the "Pay Now" button
    const payButton = screen.getByRole("button", { name: /Pay Now/i });

    // Wrap the async click event in act()
    await act(async () => {
      fireEvent.click(payButton);
    });

    // Check that the server action was called
    expect(mockHandleCheckout).toHaveBeenCalledTimes(1);
    expect(mockHandleCheckout).toHaveBeenCalledWith(
      mockUser,
      mockCar,
      mockStoreState.startDate,
      mockStoreState.endDate,
      mockBranch
    );

    // Check that the router was redirected to the Stripe URL
    expect(mockRouter.push).toHaveBeenCalledWith(
      "https://mock.stripe.checkout/session_123"
    );
  });
});
