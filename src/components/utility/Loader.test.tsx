import { render, screen } from "@testing-library/react";
import Loader from "@/components/utility/Loader";

describe("Loader component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loader spinner", () => {
    render(<Loader />);
    expect(screen.getByTestId("loader-spinner")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the provided title", () => {
    render(<Loader title="Loading vehicle details" />);
    expect(screen.getByText("Loading vehicle details...")).toBeInTheDocument();
  });
});
