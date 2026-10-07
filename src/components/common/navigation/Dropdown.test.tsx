/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown, initials } from "./Dropdown";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock("../../../../auth-client", () => ({
  authClient: { signOut: jest.fn() },
}));

const user = {
  id: "u1",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  reward_points: 250,
} as any;

describe("Dropdown Component", () => {
  it("builds initials from a name", () => {
    expect(initials("John Doe")).toBe("JD");
    expect(initials("cher")).toBe("C");
    expect(initials("")).toBe("?");
  });

  it("shows the user's name on the trigger", () => {
    render(<Dropdown user={user} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("lists customer links when opened", async () => {
    render(<Dropdown user={user} />);
    fireEvent.keyDown(
      screen.getByRole("button", { name: /open account menu/i }),
      {
        key: "Enter",
      }
    );
    expect(await screen.findByText("My bookings")).toBeInTheDocument();
    expect(screen.getByText("250 pts")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("lists admin links for admins", async () => {
    render(<Dropdown user={{ ...user, role: "admin" }} />);
    fireEvent.keyDown(
      screen.getByRole("button", { name: /open account menu/i }),
      {
        key: "Enter",
      }
    );
    expect(await screen.findByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("My bookings")).not.toBeInTheDocument();
  });
});
