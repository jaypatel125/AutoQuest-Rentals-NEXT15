import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddBranchPage from "@/app/(admin)/admin/add-branch/page";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/app/(admin)/admin/add-branch/actions", () => ({
  addBranch: jest.fn(),
}));

describe("AddBranchPage", () => {
  const push = jest.fn();
  const toast = jest.fn();
  const invalidateQueries = jest.fn();
  const mutate = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useToast as jest.Mock).mockReturnValue({ toast });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });
    (useMutation as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("updates form state when typing", () => {
    render(<AddBranchPage />);

    const nameInput = screen.getByPlaceholderText("Enter branch name");
    fireEvent.change(nameInput, { target: { value: "Downtown Branch" } });

    expect(nameInput).toHaveValue("Downtown Branch");
  });

  it("calls router.push when clicking Cancel", () => {
    render(<AddBranchPage />);

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(push).toHaveBeenCalledWith("/admin/manage-branches");
  });

  it("calls mutation.mutate with form data when Add Branch is clicked", async () => {
    render(<AddBranchPage />);

    const nameInput = screen.getByPlaceholderText("Enter branch name");
    const addressInput = screen.getByPlaceholderText("Enter address");
    const cityInput = screen.getByPlaceholderText("Enter city");
    const postalInput = screen.getByPlaceholderText("Enter postal code");
    const addButton = screen.getByRole("button", { name: /Add Branch/i });

    fireEvent.change(nameInput, { target: { value: "Main Branch" } });
    fireEvent.change(addressInput, { target: { value: "123 Main St" } });
    fireEvent.change(cityInput, { target: { value: "Toronto" } });
    fireEvent.change(postalInput, { target: { value: "M1A 2B3" } });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        name: "Main Branch",
        address: "123 Main St",
        city: "Toronto",
        province: "",
        postal_code: "M1A 2B3",
      });
    });
  });

  it("shows loading text when mutation is pending", () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate,
      isPending: true,
      isError: false,
    });

    render(<AddBranchPage />);
    expect(screen.getByText(/Adding.../i)).toBeInTheDocument();
  });

  it("displays error message when mutation fails", () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
      isError: true,
    });

    render(<AddBranchPage />);
    expect(
      screen.getByText(/Error adding branch\. Please try again\./i)
    ).toBeInTheDocument();
  });
});
