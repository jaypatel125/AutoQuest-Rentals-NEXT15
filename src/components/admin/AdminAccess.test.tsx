/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AddBranchPage from "@/app/(admin)/admin/add-branch/page";
import { CustomersTable } from "@/components/admin/manage-users/customers-table";
import { AdminAccessProvider, ReviewerBanner } from "./AdminAccess";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock("@/app/(admin)/admin/add-branch/actions", () => ({
  addBranch: jest.fn(),
}));
jest.mock("@/hooks/use-ban-user", () => ({
  useUserBanMutations: () => ({
    banUser: jest.fn(),
    unbanUser: jest.fn(),
    isPending: false,
  }),
}));

const mutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (useQueryClient as jest.Mock).mockReturnValue({
    invalidateQueries: jest.fn(),
  });
  (useMutation as jest.Mock).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
  });
});

const customer = (over: Partial<any> = {}) => ({
  id: "c1",
  name: "Sam Okafor",
  email: "sam@autoquest.test",
  createdAt: new Date().toISOString(),
  bookingsCount: 2,
  revenue: 100,
  lastBookedAt: null,
  role: "user",
  banned: false,
  banReason: null,
  banExpires: null,
  ...over,
});

function openMenu() {
  fireEvent.keyDown(screen.getByRole("button", { name: /open menu/i }), {
    key: "Enter",
  });
}

describe("read-only admin area", () => {
  it("shows the reviewer banner", () => {
    render(<ReviewerBanner />);
    expect(screen.getByText("Reviewer mode.")).toBeInTheDocument();
  });

  it("lets admins add a branch", () => {
    render(
      <AdminAccessProvider readOnly={false}>
        <AddBranchPage />
      </AdminAccessProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Branch" }));
    expect(mutate).toHaveBeenCalled();
  });

  it("disables saving a branch for reviewers", () => {
    render(
      <AdminAccessProvider readOnly>
        <AddBranchPage />
      </AdminAccessProvider>
    );
    expect(screen.getByRole("button", { name: "Add Branch" })).toBeDisabled();
    expect(
      screen.getByText(/reviewers can't save changes/i)
    ).toBeInTheDocument();
  });

  it("offers admins every other role, including reviewer", async () => {
    render(
      <AdminAccessProvider readOnly={false}>
        <CustomersTable
          rows={[customer()]}
          currentUserId="me"
          onSetRole={jest.fn()}
        />
      </AdminAccessProvider>
    );
    openMenu();
    expect(await screen.findByText("Make admin")).toBeInTheDocument();
    expect(
      screen.getByText("Make reviewer (read-only admin)")
    ).toBeInTheDocument();
    expect(screen.queryByText("Make customer")).not.toBeInTheDocument();
    expect(screen.getByText("Ban for 7 days")).toBeInTheDocument();
  });

  it("hides role changes for the public demo account", async () => {
    render(
      <AdminAccessProvider readOnly={false}>
        <CustomersTable
          rows={[customer({ role: "reviewer", demo: true })]}
          currentUserId="me"
          onSetRole={jest.fn()}
        />
      </AdminAccessProvider>
    );
    expect(screen.getByText(/public demo/)).toBeInTheDocument();
    openMenu();
    expect(await screen.findByText("View bookings")).toBeInTheDocument();
    expect(screen.queryByText(/^Make /)).not.toBeInTheDocument();
  });

  it("only gives reviewers the read actions", async () => {
    render(
      <AdminAccessProvider readOnly>
        <CustomersTable
          rows={[customer()]}
          currentUserId="me"
          onSetRole={jest.fn()}
        />
      </AdminAccessProvider>
    );
    openMenu();
    expect(await screen.findByText("View bookings")).toBeInTheDocument();
    expect(screen.queryByText("Ban for 7 days")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Make /)).not.toBeInTheDocument();
  });
});
