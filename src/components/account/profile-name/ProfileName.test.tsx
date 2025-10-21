/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
/**
 * @file ProfileName.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileName from "@/components/account/profile-name";
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
    updateUser: jest.fn(),
  },
}));
jest.mock("@/components/account/AccountInfo", () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="account-info">{children}</div>
  );
});

describe("ProfileName", () => {
  const mockToast = jest.fn();
  const mockRefresh = jest.fn();
  const mockUpdateUser = jest.fn();

  const mockUser = {
    id: "1",
    name: "Jay Patel",
    email: "jay@example.com",
  } as any;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (authClient.updateUser as jest.Mock) = mockUpdateUser;
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders name input and pre-fills user name", () => {
    render(<ProfileName currentUser={mockUser} />);
    const input = screen.getByTestId("name-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Jay Patel");
  });

  it("handles API rejection with toast error", async () => {
    (authClient.updateUser as jest.Mock).mockRejectedValueOnce(
      new Error("Update failed")
    );
    render(<ProfileName currentUser={mockUser} />);

    const input = screen.getByTestId("name-input");
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: expect.stringMatching(/update failed/i),
        })
      )
    );
  });

  it("does not call updateUser if name unchanged", async () => {
    render(<ProfileName currentUser={mockUser} />);
    const input = screen.getByTestId("name-input");

    // submit without changes
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(mockUpdateUser).not.toHaveBeenCalled());
  });
});
