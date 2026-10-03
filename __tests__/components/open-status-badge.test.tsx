import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";

afterEach(() => vi.useRealTimers());

describe("<OpenStatusBadge />", () => {
  it("shows OPEN NOW during Calgary business hours", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T17:00:00Z")); // Mon 11:00 MDT
    render(<OpenStatusBadge />);
    const badge = screen.getByTestId("open-status");
    expect(badge).toHaveAttribute("data-open", "true");
    expect(badge).toHaveTextContent("OPEN NOW in SE Calgary");
  });

  it("shows the next opening time when closed", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-05T13:00:00Z")); // Mon 07:00 MDT
    render(<OpenStatusBadge />);
    const badge = screen.getByTestId("open-status");
    expect(badge).toHaveAttribute("data-open", "false");
    expect(badge.textContent).toContain("CLOSED – Opens 9:00");
  });
});
