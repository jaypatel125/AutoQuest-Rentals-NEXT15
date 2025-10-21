/**
 * @file ForgotPasswordForm.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useToast } from "@/hooks/use-toast";

// ─── Mocks ────────────────────────────────────────────────
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("ForgotPasswordForm", () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock) = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {}); // silence console.error
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the form fields", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("handles successful password reset request", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Success",
          description: expect.stringMatching(/reset link/i),
        })
      );
      expect(
        screen.getByText(/a reset link has been sent/i)
      ).toBeInTheDocument();
    });
  });

  it("handles failed request (API error)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid email" }),
    });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "invalid@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Invalid email",
        })
      );
    });
  });

  it("handles fetch exception (network error)", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network down")
    );

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Network down",
        })
      );
    });
  });
});
