import { render, screen, fireEvent } from "@testing-library/react";
import PageLayout from "./index";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("PageLayout component", () => {
  const backMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ back: backMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and description", () => {
    render(
      <PageLayout title="Test Title" description="Test Description">
        <div>Child Content</div>
      </PageLayout>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders back button by default and triggers router.back on click", () => {
    render(
      <PageLayout title="Title" description="Description">
        <div>Content</div>
      </PageLayout>
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(backMock).toHaveBeenCalled();
  });

  it("does not render back button if goBack is false", () => {
    render(
      <PageLayout title="Title" description="Description" goBack={false}>
        <div>Content</div>
      </PageLayout>
    );

    const backButton = screen.queryByRole("button", { name: /back/i });
    expect(backButton).not.toBeInTheDocument();
  });
});
