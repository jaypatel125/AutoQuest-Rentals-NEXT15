import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePassword from "./index";
import { authClient } from "../../../../../auth-client";

jest.mock("../../../../../auth-client", () => ({
  authClient: { changePassword: jest.fn() },
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

describe("ProfilePassword (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current and new password inputs", () => {
    render(<ProfilePassword />);
    expect(screen.getByTestId("current-password-input")).toBeInTheDocument();
    expect(screen.getByTestId("new-password-input")).toBeInTheDocument();
  });

  it("shows error if new password is less than 8 characters", async () => {
    render(<ProfilePassword />);
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "short" },
    });
    fireEvent.submit(screen.getByTestId("account-password-editor"));
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("calls authClient.changePassword on valid submission", async () => {
    render(<ProfilePassword />);
    fireEvent.change(screen.getByTestId("current-password-input"), {
      target: { value: "currentpassword" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newpassword123" },
    });
    fireEvent.submit(screen.getByTestId("account-password-editor"));
    await waitFor(() => {
      expect(authClient.changePassword).toHaveBeenCalledWith({
        currentPassword: "currentpassword",
        newPassword: "newpassword123",
        revokeOtherSessions: true,
      });
    });
  });

  it("disables inputs while submitting", async () => {
    render(<ProfilePassword />);
    fireEvent.change(screen.getByTestId("current-password-input"), {
      target: { value: "currentpassword" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newpassword123" },
    });
    fireEvent.submit(screen.getByTestId("account-password-editor"));
    expect(screen.getByTestId("current-password-input")).toBeDisabled();
    expect(screen.getByTestId("new-password-input")).toBeDisabled();
  });
});
