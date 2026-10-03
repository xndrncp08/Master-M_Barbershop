import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryTabs } from "@/components/services/category-tabs";

describe("<CategoryTabs />", () => {
  it("renders a deep link for every category", () => {
    render(<CategoryTabs active="all" />);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: "Beard" })).toHaveAttribute("href", "/services?category=beard");
    expect(screen.getByRole("link", { name: "Combos" })).toHaveAttribute("href", "/services?category=combos");
  });

  it("marks only the selected category as current", () => {
    render(<CategoryTabs active="shave" />);
    expect(screen.getByRole("link", { name: "Shaves" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Cuts" })).not.toHaveAttribute("aria-current");
  });
});
