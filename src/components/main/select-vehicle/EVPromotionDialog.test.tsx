/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file EVPromotionDialog.test.tsx
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { EVPromotionDialog } from "@/components/main/select-vehicle/EVPromotionDialog";

// ─── Mocks ────────────────────────────────────────────────
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("lucide-react", () => ({
  Leaf: () => <svg data-testid="leaf-icon" />,
}));

// ─── Tests ────────────────────────────────────────────────
describe("EVPromotionDialog", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnCheckoutEV = jest.fn();
  const mockOnContinue = jest.fn();

  const setup = (open = true) =>
    render(
      <EVPromotionDialog
        open={open}
        onOpenChange={mockOnOpenChange}
        onCheckoutEV={mockOnCheckoutEV}
        onContinue={mockOnContinue}
      />
    );

  it("renders correctly when open", () => {
    setup(true);
    expect(screen.getByText(/make a greener choice!/i)).toBeInTheDocument();
    expect(screen.getByText(/carbon emissions impact/i)).toBeInTheDocument();
    expect(screen.getByText(/ev rewards available/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("leaf-icon")).toHaveLength(2);
  });

  it("does not render content when closed", () => {
    setup(false);
    expect(
      screen.queryByText(/make a greener choice/i)
    ).not.toBeInTheDocument();
  });

  it("calls onContinue when Continue button clicked", () => {
    setup(true);
    fireEvent.click(screen.getByRole("button", { name: /continue booking/i }));
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("calls onCheckoutEV when Checkout EVs button clicked", () => {
    setup(true);
    fireEvent.click(screen.getByRole("button", { name: /checkout evs/i }));
    expect(mockOnCheckoutEV).toHaveBeenCalledTimes(1);
  });
});
