/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./NavBar";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue("/"),
}));

// Mock Dropdown
jest.mock("./Dropdown", () => ({
  Dropdown: ({ user }: { user: any }) => (
    <div data-testid="dropdown">{user ? "User Dropdown" : "No User"}</div>
  ),
}));

describe("Navbar component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "user@example.com",
    emailVerified: true,
    name: "John Doe",
    role: "user",
    reward_points: 100,
    banned: false,
    image: null,
    banReason: null,
    banExpires: null,
  };

  const mockSession = {
    id: "session-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
    expiresAt: new Date(Date.now() + 3600 * 1000),
    token: "abc123",
  };

  it("renders logo", () => {
    render(<Navbar user={null} session={null} />);
    expect(screen.getByAltText("AutoQuest logo")).toBeInTheDocument();
  });

  it("renders sign-in button when no user or session", () => {
    render(<Navbar user={null} session={null} />);
    const signInBtn = screen.getByRole("button", { name: /sign in/i });
    expect(signInBtn).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(pushMock).toHaveBeenCalledWith("/signin");
  });

  it("renders reward points for regular user", () => {
    render(<Navbar user={mockUser} session={mockSession} />);
    expect(screen.getByText("100 pts")).toBeInTheDocument();
  });

  it("renders Dropdown component", () => {
    render(<Navbar user={mockUser} session={mockSession} />);
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });
});
