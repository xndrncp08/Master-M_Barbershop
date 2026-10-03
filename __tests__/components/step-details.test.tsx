import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const submitBooking = vi.fn();
vi.mock("@/app/book/actions", () => ({ submitBooking: (input: unknown) => submitBooking(input) }));

const { StepDetails } = await import("@/components/booking/step-details");

const selection = { serviceId: "haircut", barberId: "any", date: "2026-10-04", time: "10:00" } as const;

function setup() {
  const onBooked = vi.fn();
  const onSlotUnavailable = vi.fn();
  render(<StepDetails selection={selection} onBooked={onBooked} onSlotUnavailable={onSlotUnavailable} />);
  return { user: userEvent.setup(), onBooked, onSlotUnavailable };
}

beforeEach(() => submitBooking.mockReset());

describe("<StepDetails />", () => {
  it("shows inline errors and focuses the first invalid field on empty submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByText(/Enter your name/)).toBeInTheDocument();
    expect(screen.getByText(/Enter your phone number/)).toBeInTheDocument();
    expect(screen.getByText(/Enter your email/)).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toHaveFocus();
    expect(screen.getByLabelText("Full Name")).toHaveAttribute("aria-invalid", "true");
    expect(submitBooking).not.toHaveBeenCalled();
  });

  it("submits normalized details with the selection", async () => {
    const booking = { reference: "MM-ABC234" };
    submitBooking.mockResolvedValue({ ok: true, booking });
    const { user, onBooked } = setup();

    await user.type(screen.getByLabelText("Full Name"), "Jordan Smith");
    await user.type(screen.getByLabelText("Phone"), "403.555.0199");
    await user.type(screen.getByLabelText("Email"), "Jordan@Example.com");
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() => expect(onBooked).toHaveBeenCalledWith(booking));
    expect(submitBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        ...selection,
        name: "Jordan Smith",
        phone: "(403) 555-0199",
        email: "jordan@example.com",
      }),
    );
  });

  it("offers to pick another time when the slot was taken", async () => {
    submitBooking.mockResolvedValue({ ok: false, code: "conflict", error: "Someone just booked that time." });
    const { user, onSlotUnavailable } = setup();

    await user.type(screen.getByLabelText("Full Name"), "Jordan Smith");
    await user.type(screen.getByLabelText("Phone"), "4035550199");
    await user.type(screen.getByLabelText("Email"), "jordan@example.com");
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Someone just booked that time.");
    await user.click(screen.getByRole("button", { name: "Choose Another Time" }));
    expect(onSlotUnavailable).toHaveBeenCalled();
  });

  it("maps server field errors back onto the form", async () => {
    submitBooking.mockResolvedValue({
      ok: false,
      code: "validation",
      error: "Check the highlighted fields and try again.",
      fieldErrors: { email: ["Enter a valid email, like name@example.com."] },
    });
    const { user } = setup();

    await user.type(screen.getByLabelText("Full Name"), "Jordan Smith");
    await user.type(screen.getByLabelText("Phone"), "4035550199");
    await user.type(screen.getByLabelText("Email"), "jordan@example.com");
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByText("Enter a valid email, like name@example.com.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });
});
