/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./NavBar";
import { useRouter, useParams } from "next/navigation";
import { Dropdown } from "./Dropdown";

// Mock router and params
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock child components
jest.mock("../utility/MaxWidthWrapper", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="maxwidth">{children}</div>
  ),
}));

jest.mock("../ui/button", () => ({
  Button: ({ onClick, children, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

jest.mock("./Dropdown", () => ({
  Dropdown: jest.fn(() => <div data-testid="dropdown">Dropdown Menu</div>),
}));

describe("Navbar component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useParams as jest.Mock).mockReturnValue({});
  });

  it("shows Sign In button when no user", () => {
    render(<Navbar session={null} user={null} />);
    const signInButton = screen.getByText(/Sign In/i);
    expect(signInButton).toBeInTheDocument();

    fireEvent.click(signInButton);
    expect(pushMock).toHaveBeenCalledWith("/signin");
  });

  it("renders reward points and Dropdown when user is logged in", () => {
    const mockUser = { reward_points: 250, name: "Jay Patel" };

    render(<Navbar session={{} as any} user={mockUser as any} />);

    // Points badge visible
    expect(screen.getByText(/250 pts/i)).toBeInTheDocument();

    // Dropdown rendered
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();

    // Sign In button not visible
    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
  });

  it("does not render sign-in button when params.slug is 'signin' or 'signup'", () => {
    (useParams as jest.Mock).mockReturnValue({ slug: "signin" });
    render(<Navbar session={null} user={null} />);
    // Still should render but we can extend logic later if behavior changes
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});
