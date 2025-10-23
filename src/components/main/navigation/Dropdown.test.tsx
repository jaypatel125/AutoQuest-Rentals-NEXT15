/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Dropdown } from "./Dropdown";
import { useRouter } from "next/navigation";
import { authClient } from "../../../../auth-client";

// Mock shadcn/ui dropdown components (keep them functional)
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ onClick, children }: any) => (
    <div data-testid="menu-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuSub: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuPortal: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../auth-client", () => ({
  authClient: {
    signOut: jest.fn(),
  },
}));

jest.mock("react-icons/ri", () => ({
  RiArrowDropDownLine: () => <span>▼</span>,
}));

describe("Dropdown", () => {
  const pushMock = jest.fn();
  const refreshMock = jest.fn();
  const mockUser = { name: "Jay Patel", reward_points: 300 };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
    });
  });

  it("renders user greeting and reward points", () => {
    render(<Dropdown user={mockUser as any} />);
    expect(screen.getByText(/Hi, Jay Patel/i)).toBeInTheDocument();
    expect(screen.getByText(/300 pts/i)).toBeInTheDocument();
  });

  it("navigates to /account when Profile clicked", () => {
    render(<Dropdown user={mockUser as any} />);
    const profileItem = screen.getByText(/Profile/i);
    fireEvent.click(profileItem);
    expect(pushMock).toHaveBeenCalledWith("/account");
  });

  it("navigates to /bookings when Bookings clicked", () => {
    render(<Dropdown user={mockUser as any} />);
    fireEvent.click(screen.getByText(/Bookings/i));
    expect(pushMock).toHaveBeenCalledWith("/bookings");
  });

  it("navigates to /rewards when Rewards clicked", () => {
    render(<Dropdown user={mockUser as any} />);
    fireEvent.click(screen.getByText(/Rewards/i));
    expect(pushMock).toHaveBeenCalledWith("/rewards");
  });

  it("navigates to /terms when Terms & Conditions clicked", () => {
    render(<Dropdown user={mockUser as any} />);
    fireEvent.click(screen.getByText(/Terms & Conditions/i));
    expect(pushMock).toHaveBeenCalledWith("/terms");
  });

  it("navigates to /select-vehicle when Start booking clicked", () => {
    render(<Dropdown user={mockUser as any} />);
    fireEvent.click(screen.getByText(/Start booking/i));
    expect(pushMock).toHaveBeenCalledWith("/select-vehicle");
  });

  it("calls signOut and redirects to home on logout", async () => {
    (authClient.signOut as jest.Mock).mockResolvedValueOnce(undefined);

    render(<Dropdown user={mockUser as any} />);
    const logoutItem = screen.getByText(/Log out/i);
    fireEvent.click(logoutItem);

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalled();
    });

    // Simulate onSuccess callback being called
    const onSuccess = (authClient.signOut as jest.Mock).mock.calls[0][0]
      .fetchOptions.onSuccess;
    onSuccess();

    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("handles signOut error gracefully", async () => {
    (authClient.signOut as jest.Mock).mockRejectedValueOnce(
      new Error("Sign-out failed")
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Dropdown user={mockUser as any} />);
    fireEvent.click(screen.getByText(/Log out/i));

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error signing out:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
