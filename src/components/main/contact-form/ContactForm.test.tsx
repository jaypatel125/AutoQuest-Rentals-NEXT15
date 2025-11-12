import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "@/components/main/contact-form";
import { sendContactMessage } from "@/app/(main)/contact/actions";

jest.mock("@/app/(main)/contact/actions", () => ({
  sendContactMessage: jest.fn(),
}));

describe("ContactForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders contact form fields", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message")).toBeInTheDocument();
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText("Your Name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    expect(nameInput).toHaveValue("John Doe");
  });

  it("calls sendContactMessage on form submit", async () => {
    (sendContactMessage as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<ContactForm />);
    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message"), {
      target: { value: "Hello" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendContactMessage).toHaveBeenCalledWith({
        name: "John",
        email: "john@example.com",
        message: "Hello",
      });
    });
  });

  it("shows success message after successful submission", async () => {
    (sendContactMessage as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<ContactForm />);
    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message"), {
      target: { value: "Hi!" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Your message has been sent successfully!/i)
      ).toBeInTheDocument();
    });
  });
});
