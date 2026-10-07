/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import Navbar from "./NavBar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => "/"),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

jest.mock("./Dropdown", () => ({
  Dropdown: () => <div data-testid="dropdown" />,
}));

const customer = {
  id: "u1",
  name: "Jordan Rivers",
  email: "jordan@example.com",
  role: "user",
  reward_points: 1340,
} as any;

describe("Navbar component", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders the logo linking home", () => {
    render(<Navbar user={null} session={null} />);
    expect(screen.getByLabelText("AutoQuest home")).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("shows sign-in and sign-up links to visitors", () => {
    render(<Navbar user={null} session={null} />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/signin"
    );
    expect(
      screen.getByRole("link", { name: /create account/i })
    ).toHaveAttribute("href", "/signup");
    expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
  });

  it("shows reward points and the account menu to customers", () => {
    render(<Navbar user={customer} session={null} />);
    expect(screen.getByText("1,340 pts")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });

  it("highlights the current section", () => {
    (usePathname as jest.Mock).mockReturnValue("/rewards");
    render(<Navbar user={customer} session={null} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent(
      "Rewards"
    );
  });

  it("is hidden on auth pages", () => {
    (usePathname as jest.Mock).mockReturnValue("/signin");
    const { container } = render(<Navbar user={null} session={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
