import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddBranchPage from "@/app/(admin)/admin/add-branch/page";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("AddBranchPage", () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<AddBranchPage />);
    expect(
      screen.getByPlaceholderText("Enter branch name")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter city")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter postal code")
    ).toBeInTheDocument();
  });

  it("updates name input correctly", () => {
    render(<AddBranchPage />);
    const input = screen.getByPlaceholderText(
      "Enter branch name"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Downtown Branch" } });
    expect(input.value).toBe("Downtown Branch");
  });

  it("calls router.push when clicking Cancel", () => {
    render(<AddBranchPage />);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockPush).toHaveBeenCalledWith("/admin/manage-branches");
  });

  it("calls mutation.mutate with form data when Add Branch is clicked", async () => {
    render(<AddBranchPage />);
    fireEvent.change(screen.getByPlaceholderText("Enter branch name"), {
      target: { value: "Main Branch" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add branch/i }));
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
