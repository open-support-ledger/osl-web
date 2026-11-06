import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FundingProgress } from "@/components/funding-progress";

afterEach(cleanup);

describe("FundingProgress", () => {
  it("shows only the raised amount, with no bar, when there is no goal", () => {
    render(<FundingProgress raised="1250.5" goal={null} assetCode="USDC" />);
    expect(screen.getByText("1,250.5 USDC")).toBeDefined();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("shows a partial goal with amounts, percentage and an accessible bar", () => {
    render(<FundingProgress raised="250" goal="1000" assetCode="USDC" />);
    expect(screen.getByText("250 USDC")).toBeDefined();
    expect(screen.getByText(/raised of 1,000 USDC goal/)).toBeDefined();
    expect(screen.getByText("25%")).toBeDefined();

    const bar = screen.getByRole("progressbar", {
      name: "Funding progress toward goal",
    });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("25");
    expect(bar.getAttribute("aria-valuetext")).toBe(
      "25% of the 1,000 USDC goal",
    );
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("25%");
  });

  it("shows zero raised as 0%", () => {
    render(<FundingProgress raised="0" goal="500" assetCode="XLM" />);
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
  });

  it("shows exactly reached", () => {
    render(<FundingProgress raised="500" goal="500" assetCode="XLM" />);
    expect(screen.getByText("100% (goal reached)")).toBeDefined();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100",
    );
  });

  it("fills the bar but shows the true percentage when exceeded", () => {
    render(<FundingProgress raised="130" goal="100" assetCode="USDC" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe(
      "130% of the 100 USDC goal",
    );
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("100%");
    expect(screen.getByText("130% (goal reached)")).toBeDefined();
  });

  it("does not read 100% just below the goal", () => {
    render(<FundingProgress raised="99.9999999" goal="100" assetCode="USDC" />);
    expect(screen.getByText("99.99%")).toBeDefined();
    expect(screen.queryByText(/goal reached/)).toBeNull();
  });

  it("shows an alert instead of misleading numbers for invalid input", () => {
    for (const [raised, goal] of [
      ["abc", "100"],
      ["-5", "100"],
      ["1", "1.123456789"],
      ["1", "0"],
    ] as const) {
      render(<FundingProgress raised={raised} goal={goal} assetCode="USDC" />);
      expect(screen.getByRole("alert").textContent).toMatch(/unavailable/);
      expect(screen.queryByRole("progressbar")).toBeNull();
      cleanup();
    }
  });

  it("rejects an invalid raised amount even without a goal", () => {
    render(<FundingProgress raised="oops" goal={null} assetCode="USDC" />);
    expect(screen.getByRole("alert")).toBeDefined();
  });
});
