/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { authClient } from "../../../../../auth-client";
import ProfileEmail from ".";

jest.mock("../../../../../auth-client", () => ({
  authClient: { changeEmail: jest.fn() },
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

const mockUser = {
  id: "1",
  email: "old@example.com",
  name: "Test User",
} as any;

describe("ProfileEmail (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the email input with current value empty", () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("shows error if invalid email is entered", async () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input");
    fireEvent.change(input, { target: { value: "invalid-email" } });
    fireEvent.submit(screen.getByTestId("account-email-editor"));
    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it("calls authClient.changeEmail on valid email submission", async () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input");
    fireEvent.change(input, { target: { value: "new@example.com" } });
    fireEvent.submit(screen.getByTestId("account-email-editor"));
    await waitFor(() => {
      expect(authClient.changeEmail).toHaveBeenCalledWith(
        expect.objectContaining({ newEmail: "new@example.com" })
      );
    });
  });

  it("disables input while loading", async () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input");
    fireEvent.change(input, { target: { value: "new@example.com" } });
    fireEvent.submit(screen.getByTestId("account-email-editor"));
    expect(input).toBeDisabled();
  });
});
