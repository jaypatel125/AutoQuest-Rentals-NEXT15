import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SigninForm from "@/components/auth/SigninForm";
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
    signIn: {
      social: jest.fn(),
    },
  },
}));

describe("SigninForm", () => {
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
    jest.clearAllMocks();
  });

  it("renders all form fields and buttons", () => {
    render(<SigninForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<SigninForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it("submits form and navigates on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<SigninForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows toast on failed sign-in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<SigninForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/something went wrong/i),
        })
      )
    );
  });

  it("calls Google sign-in on button click", async () => {
    render(<SigninForm />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() =>
      expect(authClient.signIn.social).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google", callbackURL: "/" }),
        expect.any(Object)
      )
    );
  });
});
