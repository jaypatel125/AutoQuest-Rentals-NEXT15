import { render, screen } from "@testing-library/react";
import Loader from "@/components/utility/Loader";

jest.mock("react-spinners", () => ({
  HashLoader: jest.fn(() => <div data-testid="hash-loader" />),
}));

describe("Loader component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loader spinner", () => {
    render(<Loader />);
    expect(screen.getByTestId("hash-loader")).toBeInTheDocument();
  });

  it("renders the provided title", () => {
    render(<Loader title="Loading vehicle details" />);
    expect(screen.getByText("Loading vehicle details...")).toBeInTheDocument();
  });
});
