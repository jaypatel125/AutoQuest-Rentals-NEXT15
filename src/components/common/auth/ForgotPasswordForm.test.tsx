import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { authClient } from "../../../../auth-client";

jest.mock("../../../../auth-client", () => ({
  authClient: {
    requestPasswordReset: jest.fn(),
  },
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

describe("ForgotPasswordForm (basic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email input and submit button", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("disables submit button while pending", async () => {
    (authClient.requestPasswordReset as jest.Mock).mockImplementation(
      (_, { onRequest }) => {
        onRequest();
      }
    );

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("shows success message after email sent", async () => {
    (authClient.requestPasswordReset as jest.Mock).mockImplementation(
      (_, { onRequest, onSuccess }) => {
        onRequest();
        onSuccess();
      }
    );

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText(/If an account exists for that email/i)
      ).toBeInTheDocument();
    });
  });

  it("calls authClient.requestPasswordReset with correct email", async () => {
    (authClient.requestPasswordReset as jest.Mock).mockImplementation(
      (_, callbacks) => {
        callbacks.onRequest();
        callbacks.onSuccess();
      }
    );

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com" }),
        expect.any(Object)
      );
    });
  });
});
