import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupForm from "./SignupForm";
import { authClient } from "../../../../auth-client";
import * as nextNavigation from "next/navigation";

jest.mock("../../../../auth-client", () => ({
  authClient: {
    signUp: { email: jest.fn() },
    signIn: { social: jest.fn() },
  },
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("SignupForm (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("toggles password visibility", () => {
    render(<SignupForm />);
    const toggleButton = screen.getAllByRole("button")[0]; // first button inside password input
    const passwordInput = screen.getByPlaceholderText(
      /Enter your password/i
    ) as HTMLInputElement;

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("calls authClient.signUp.email on form submit", async () => {
    (authClient.signUp.email as jest.Mock).mockImplementation(
      (_, callbacks) => {
        callbacks.onRequest();
        callbacks.onSuccess();
      }
    );
    const router = nextNavigation.useRouter();

    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith(
        {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
        expect.any(Object)
      );
      expect(router.push).toHaveBeenCalledWith("/verification");
    });
  });
});
