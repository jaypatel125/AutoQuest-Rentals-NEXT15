/* eslint-disable react/display-name */
/**
 * @file ProfilePassword.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePassword from "@/components/account/profile-password";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";

// ─── Mocks ────────────────────────────────────────────────
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));
jest.mock("../../../../auth-client", () => ({
  authClient: {
    changePassword: jest.fn(),
  },
}));
jest.mock("@/components/account/AccountInfo", () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="account-info">{children}</div>
  );
});

describe("ProfilePassword", () => {
  const mockToast = jest.fn();
  const mockChangePassword = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (authClient.changePassword as jest.Mock) = mockChangePassword;
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders password input fields", () => {
    render(<ProfilePassword />);
    expect(screen.getByTestId("current-password-input")).toBeInTheDocument();
    expect(screen.getByTestId("new-password-input")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    render(<ProfilePassword />);
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "short" },
    });
    fireEvent.submit(screen.getByTestId("new-password-input").closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("calls authClient.changePassword with correct data", async () => {
    (authClient.changePassword as jest.Mock).mockResolvedValueOnce({});
    render(<ProfilePassword />);

    fireEvent.change(screen.getByTestId("current-password-input"), {
      target: { value: "oldPassword123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newPassword123" },
    });
    fireEvent.submit(screen.getByTestId("new-password-input").closest("form")!);

    await waitFor(() =>
      expect(mockChangePassword).toHaveBeenCalledWith({
        newPassword: "newPassword123",
        currentPassword: "oldPassword123",
        revokeOtherSessions: true,
      })
    );

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success",
        description: expect.stringMatching(/password updated successfully/i),
      })
    );
  });

  it("handles API error gracefully", async () => {
    (authClient.changePassword as jest.Mock).mockRejectedValueOnce(
      new Error("Server error")
    );
    render(<ProfilePassword />);

    fireEvent.change(screen.getByTestId("current-password-input"), {
      target: { value: "oldPassword123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newPassword123" },
    });
    fireEvent.submit(screen.getByTestId("new-password-input").closest("form")!);

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: expect.stringMatching(/server error/i),
        })
      )
    );
  });
});
