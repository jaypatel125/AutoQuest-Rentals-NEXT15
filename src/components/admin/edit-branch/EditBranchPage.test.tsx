import { render, screen, fireEvent } from "@testing-library/react";
import EditBranchPage from "@/app/(admin)/admin/manage-branches/[branchId]/page";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => ({ mutate: jest.fn() })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

describe("EditBranchPage (simple)", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useParams as jest.Mock).mockReturnValue({ branchId: "1" });
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        name: "Main Branch",
        address: "123 King St",
        city: "Toronto",
        province: "Ontario",
        postal_code: "A1A1A1",
      },
      isLoading: false,
      isError: false,
    });
  });

  it("renders basic form inputs", () => {
    render(<EditBranchPage />);
    expect(
      screen.getByPlaceholderText("Enter branch name")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter address")).toBeInTheDocument();
  });

  it("updates text input value", () => {
    render(<EditBranchPage />);
    const nameInput = screen.getByPlaceholderText(
      "Enter branch name"
    ) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Updated Branch" } });
    expect(nameInput.value).toBe("Updated Branch");
  });

  it("renders Save Changes and Delete Branch buttons", () => {
    render(<EditBranchPage />);
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete branch/i })
    ).toBeInTheDocument();
  });
});
