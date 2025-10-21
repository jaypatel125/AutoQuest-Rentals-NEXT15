/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileEmail from "@/components/account/profile-email";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";

// ─── Mocks ────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));
jest.mock("../../../../auth-client", () => ({
  authClient: {
    changeEmail: jest.fn(),
  },
}));
jest.mock("@/components/account/AccountInfo", () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="account-info">{children}</div>
  );
});

describe("ProfileEmail", () => {
  const mockToast = jest.fn();
  const mockRefresh = jest.fn();
  const mockChangeEmail = jest.fn();

  const mockUser = { id: "123", email: "old@example.com" } as any;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (authClient.changeEmail as jest.Mock) = mockChangeEmail;
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders with current email info", () => {
    render(<ProfileEmail currentUser={mockUser} />);
    expect(screen.getByTestId("account-info")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input");

    fireEvent.change(input, { target: { value: "invalidemail" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("calls authClient.changeEmail with valid email", async () => {
    (authClient.changeEmail as jest.Mock).mockResolvedValueOnce({});
    render(<ProfileEmail currentUser={mockUser} />);

    const input = screen.getByTestId("email-input");
    fireEvent.change(input, { target: { value: "new@example.com" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(mockChangeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          newEmail: "new@example.com",
          callbackURL: expect.stringMatching(/\/account\/profile$/),
        })
      )
    );

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success",
        description: expect.stringMatching(/email updated successfully/i),
      })
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("handles API error and shows toast", async () => {
    (authClient.changeEmail as jest.Mock).mockRejectedValueOnce(
      new Error("Network failure")
    );
    render(<ProfileEmail currentUser={mockUser} />);

    const input = screen.getByTestId("email-input");
    fireEvent.change(input, { target: { value: "new@example.com" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: expect.stringMatching(/network failure/i),
        })
      )
    );
  });

  it("does not call changeEmail if email unchanged", async () => {
    render(<ProfileEmail currentUser={mockUser} />);
    const input = screen.getByTestId("email-input");

    fireEvent.change(input, { target: { value: "old@example.com" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(mockChangeEmail).not.toHaveBeenCalled());
  });
});
