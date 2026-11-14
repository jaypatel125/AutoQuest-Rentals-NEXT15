import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SigninForm from "./SigninForm";
import { authClient } from "../../../../auth-client";
import { useSearchParams } from "next/navigation";

jest.mock("../../../../auth-client", () => ({
  authClient: { signIn: { email: jest.fn(), social: jest.fn() } },
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push, refresh: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const demo = { email: "reviewer@example.com", password: "Reviewer123!" };

describe("Reviewer demo on the sign-in page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("is hidden when the demo is turned off", () => {
    render(<SigninForm reviewerDemo={null} />);
    expect(
      screen.queryByText("Explore the admin dashboard")
    ).not.toBeInTheDocument();
  });

  it("shows the shared credentials", () => {
    render(<SigninForm reviewerDemo={demo} />);
    expect(screen.getByText("Explore the admin dashboard")).toBeInTheDocument();
    expect(screen.getByText("reviewer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Reviewer123!")).toBeInTheDocument();
  });

  it("signs in as the reviewer and opens the admin area", async () => {
    (authClient.signIn.email as jest.Mock).mockImplementation(
      async (_body, opts) => {
        opts.onSuccess({ data: { user: { role: "reviewer" } } });
      }
    );
    render(<SigninForm reviewerDemo={demo} />);
    fireEvent.click(
      screen.getByRole("button", { name: /sign in as reviewer/i })
    );
    await waitFor(() =>
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        demo,
        expect.any(Object)
      )
    );
    expect(push).toHaveBeenCalledWith("/admin");
  });

  it("prefills the form when linked with ?demo=reviewer", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("demo=reviewer")
    );
    render(<SigninForm reviewerDemo={demo} />);
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue(
      demo.email
    );
  });
});
