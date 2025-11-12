/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { authClient } from "../../../../../auth-client";
import ProfileName from ".";

jest.mock("../../../../../auth-client", () => ({
  authClient: { updateUser: jest.fn() },
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

const mockUser = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
} as any;

describe("ProfileName (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the name input with current value", () => {
    render(<ProfileName currentUser={mockUser} />);
    const input = screen.getByTestId("name-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Test User");
  });

  it("calls authClient.updateUser on valid name submission", async () => {
    render(<ProfileName currentUser={mockUser} />);
    const input = screen.getByTestId("name-input");
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.submit(screen.getByTestId("account-name-editor"));
    await waitFor(() => {
      expect(authClient.updateUser).toHaveBeenCalledWith({ name: "New Name" });
    });
  });

  it("disables input while submitting", async () => {
    render(<ProfileName currentUser={mockUser} />);
    const input = screen.getByTestId("name-input");
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.submit(screen.getByTestId("account-name-editor"));
    expect(input).toBeDisabled();
  });
});
