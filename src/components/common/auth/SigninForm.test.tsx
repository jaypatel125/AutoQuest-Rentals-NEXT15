import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SigninForm from "./SigninForm";
import { authClient } from "../../../../auth-client";

jest.mock("../../../../auth-client", () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
      social: jest.fn(),
    },
  },
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams("next=/bookings")),
}));

describe("SigninForm (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password inputs and submit button", () => {
    render(<SigninForm />);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Sign In$/i })
    ).toBeInTheDocument();
  });

  it("calls authClient.signIn.social when Google button clicked", async () => {
    (authClient.signIn.social as jest.Mock).mockResolvedValue({});
    render(<SigninForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i })
    );

    await waitFor(() => {
      expect(authClient.signIn.social).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "google",
          callbackURL: "/bookings",
        }),
        expect.any(Object)
      );
    });
  });
});
