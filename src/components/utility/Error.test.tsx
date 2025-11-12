import { render, screen, fireEvent } from "@testing-library/react";
import Error from "@/components/utility/Error";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Error component", () => {
  const mockRouter = { refresh: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it("renders provided error message", () => {
    render(<Error error="Failed to load details." />);
    expect(screen.getByText("Failed to load details.")).toBeInTheDocument();
  });

  it("renders default error message when no message is provided", () => {
    render(<Error />);
    expect(
      screen.getByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  it("calls router.refresh() when Retry button is clicked", () => {
    render(<Error error="Temporary error" />);
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });
});
