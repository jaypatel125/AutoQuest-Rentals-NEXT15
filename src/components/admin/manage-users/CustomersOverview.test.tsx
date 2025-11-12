import { render, screen } from "@testing-library/react";
import React from "react";
import CustomersOverview from ".";

const mockUser = {
  id: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  email: "test@example.com",
  emailVerified: true,
  name: "Test User",
  image: null,
  banned: false,
  role: "user",
  reward_points: 0,
};

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: () => ({
    data: { pages: [{ customers: [] }] },
    isLoading: false,
    isError: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-toggle-role", () => ({
  useUserRoleMutations: () => ({
    setUserRole: jest.fn(),
  }),
}));

jest.mock("@/components/admin/manage-users/customers-table", () => ({
  CustomersTable: () => <div>Mocked CustomersTable</div>,
}));

describe("CustomersOverview", () => {
  it("renders without crashing", () => {
    render(<CustomersOverview user={mockUser} />);
    expect(
      screen.getByPlaceholderText("Search name, username, or email…")
    ).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Mocked CustomersTable")).toBeInTheDocument();
  });
});
