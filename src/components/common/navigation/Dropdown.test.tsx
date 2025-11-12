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
const regularUser = {
  id: "2",
  createdAt: new Date(),
  updatedAt: new Date(),
  email: "user@test.com",
  emailVerified: true,
  name: "John Doe",
  role: "user",
  banned: false,
  reward_points: 120,
  image: null,
};

import { render, screen } from "@testing-library/react";
import { Dropdown } from "@/components/common/navigation/Dropdown";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../../auth-client", () => ({
  authClient: {
    signOut: jest.fn(),
  },
}));

describe("Dropdown Component", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    jest.clearAllMocks();
  });

  it("renders sign-in trigger when no user is provided", () => {
    render(<Dropdown />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders admin dropdown items when admin user is provided", () => {
    render(<Dropdown user={adminUser} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders regular user dropdown items", () => {
    render(<Dropdown user={regularUser} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
