/**
 * @file SignupForm.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupForm from "@/components/auth/SignupForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../auth-client";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));
jest.mock("../../../auth-client", () => ({
  authClient: {
    signIn: { social: jest.fn() },
  },
}));

describe("SignupForm", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock) = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {}); // silence console errors
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders all form fields and buttons", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign up$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up with google/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      // Assuming zod returns "Required" or similar message
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it("submits form and navigates on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith("/verification");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("logs error for failed signup", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: "error" }),
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith("Signup failed:", "error")
    );
  });

  it("calls Google sign-in on button click", async () => {
    render(<SignupForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /sign up with google/i })
    );
    await waitFor(() =>
      expect(authClient.signIn.social).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google", callbackURL: "/" }),
        expect.any(Object)
      )
    );
  });
});
