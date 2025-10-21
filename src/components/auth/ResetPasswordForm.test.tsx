/**
 * @file ResetPasswordForm.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// ─── Mocks ────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("ResetPasswordForm", () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock) = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders input fields and submit button", () => {
    mockGet.mockReturnValue("valid-token");
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    mockGet.mockReturnValue("valid-token");
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "abc123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "xyz999" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it("shows error when token is missing", async () => {
    mockGet.mockReturnValue(null);
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Invalid or missing reset token.",
        })
      );
      expect(
        screen.getByText(/invalid or missing reset token/i)
      ).toBeInTheDocument();
    });
  });

  it("handles successful reset", async () => {
    mockGet.mockReturnValue("valid-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/your password has been reset/i)
      ).toBeInTheDocument();
    });

    // simulate redirect after success
    jest.runAllTimers?.();
  });

  it("handles API error response", async () => {
    mockGet.mockReturnValue("valid-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid token" }),
    });

    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Invalid token",
        })
      );
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  it("handles fetch rejection (network error)", async () => {
    mockGet.mockReturnValue("valid-token");
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Something went wrong.",
        })
      );
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
