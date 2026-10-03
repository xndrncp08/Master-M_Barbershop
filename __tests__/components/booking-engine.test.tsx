import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let search = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => "/book",
  useSearchParams: () => search,
}));
vi.mock("@/app/book/actions", () => ({ submitBooking: vi.fn() }));

const { BookingEngine } = await import("@/components/booking/booking-engine");

let pushState: ReturnType<typeof vi.spyOn>;
let replaceState: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  pushState = vi.spyOn(window.history, "pushState");
  replaceState = vi.spyOn(window.history, "replaceState");
});
afterEach(() => vi.restoreAllMocks());

describe("<BookingEngine /> URL state", () => {
  it("opens on the service step by default with Continue disabled", () => {
    search = new URLSearchParams();
    render(<BookingEngine />);
    expect(screen.getByRole("heading", { name: "Choose Your Service" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("writes the chosen service to the URL", async () => {
    search = new URLSearchParams();
    render(<BookingEngine />);
    await userEvent.click(screen.getByRole("radio", { name: /Hot Towel Shave/ }));
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/book?step=1&service=hot-towel-shave");
  });

  it("deep-links straight to the barber step from ?service=", () => {
    search = new URLSearchParams("service=haircut");
    render(<BookingEngine />);
    expect(screen.getByRole("heading", { name: "Choose Your Barber" })).toBeInTheDocument();
    expect(screen.getByText("Haircut · $35")).toBeInTheDocument();
  });

  it("pushes a history entry when advancing so Back works", async () => {
    search = new URLSearchParams("step=2&service=haircut&barber=senior");
    render(<BookingEngine />);
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(pushState).toHaveBeenLastCalledWith(null, "", "/book?step=3&service=haircut&barber=senior");
  });

  it("clamps a deep link that skips required steps", () => {
    search = new URLSearchParams("step=4&service=haircut");
    render(<BookingEngine />);
    expect(screen.getByRole("heading", { name: "Choose Your Barber" })).toBeInTheDocument();
  });
});
