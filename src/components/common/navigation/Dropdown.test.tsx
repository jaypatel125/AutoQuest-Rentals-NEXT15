import { render, screen, fireEvent } from "@testing-library/react";
import { Dropdown } from "./Dropdown";
import { useRouter } from "next/navigation";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock authClient
jest.mock("../../../../auth-client", () => ({
  authClient: {
    signOut: jest.fn(),
  },
}));

describe("Dropdown component basic tests", () => {
  const pushMock = jest.fn();
  const refreshMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders sign-in trigger when no user is provided", () => {
    render(<Dropdown user={null} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders admin menu items when admin user is provided", async () => {
    const adminUser = {
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "admin@test.com",
      emailVerified: true,
      name: "Admin",
      role: "admin",
      banned: false,
      reward_points: 0,
      image: null,
    };

    render(<Dropdown user={adminUser} />);
    // open dropdown
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("My Account")).toBeInTheDocument();
    expect(await screen.findByText("Dashboards")).toBeInTheDocument();
  });
});
