import { render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import HomePage from "./index";

jest.mock("@/app/actions", () => ({
  getData: jest.fn().mockResolvedValue([]),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../searchbar", () => ({
  SearchBar: () => <div>Search Bar</div>,
}));

describe("HomePage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("shows loader when data is loading", () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ isLoading: true })
      .mockReturnValueOnce({ isLoading: true });
    render(<HomePage />);
    expect(screen.getByText(/Loading vehicle details/i)).toBeInTheDocument();
  });

  it("shows error message when API fails", () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ error: true })
      .mockReturnValueOnce({ error: true });
    render(<HomePage />);
    expect(screen.getByText(/Failed to load details/i)).toBeInTheDocument();
  });

  it("renders brands and body types correctly", async () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: ["Tesla", "Ford"], isLoading: false })
      .mockReturnValueOnce({ data: ["SUV", "Sedan"], isLoading: false });
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText("Tesla")).toBeInTheDocument();
      expect(screen.getByText("SUV")).toBeInTheDocument();
    });
  });

  it("navigates to rewards page when clicking Learn More", async () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: [], isLoading: false })
      .mockReturnValueOnce({ data: [], isLoading: false });
    render(<HomePage />);
    screen.getByRole("button", { name: /learn more/i }).click();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/rewards"));
  });
});
