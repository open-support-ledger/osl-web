import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the project name", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Open Support Ledger" }),
    ).toBeDefined();
  });
});
