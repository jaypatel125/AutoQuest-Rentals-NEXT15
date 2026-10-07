import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordForm from "./ResetPasswordForm";
import { authClient } from "../../../../auth-client";

jest.mock("../../../../auth-client", () => ({
  authClient: { resetPassword: jest.fn() },
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams("token=test-token")),
}));

describe("ResetPasswordForm (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders password and confirm password inputs", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i })
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "87654321" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while pending", async () => {
    (authClient.resetPassword as unknown as jest.Mock).mockImplementation(
      (_, callbacks) => {
        callbacks.onRequest();
      }
    );

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "12345678" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /resetting password/i })
      ).toBeDisabled();
    });
  });
});
