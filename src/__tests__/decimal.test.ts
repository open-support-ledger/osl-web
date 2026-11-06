import { describe, expect, it } from "vitest";
import {
  InvalidAmountError,
  barPercentOf,
  groupAmount,
  percentOf,
  toUnits,
} from "@/lib/decimal";

describe("toUnits", () => {
  it("converts to 10^-7 units exactly", () => {
    expect(toUnits("0")).toBe(BigInt(0));
    expect(toUnits("1")).toBe(BigInt(10000000));
    expect(toUnits("0.0000001")).toBe(BigInt(1));
    expect(toUnits("1.5")).toBe(BigInt(15000000));
  });

  it.each([
    "",
    "abc",
    "-1",
    "+1",
    "1e3",
    ".5",
    "1.",
    " 1",
    "1 ",
    "1.00000001",
    "1,5",
    "0x10",
  ])("rejects %j", (value) => {
    expect(() => toUnits(value)).toThrow(InvalidAmountError);
  });
});

describe("percentOf", () => {
  it("handles 0%, 50%, 100% and over 100%", () => {
    expect(percentOf("0", "100")).toBe("0");
    expect(percentOf("50", "100")).toBe("50");
    expect(percentOf("100", "100")).toBe("100");
    expect(percentOf("130", "100")).toBe("130");
    expect(percentOf("1000", "100")).toBe("1000");
  });

  it("keeps up to two decimals, truncated", () => {
    expect(percentOf("1", "3")).toBe("33.33");
    expect(percentOf("2", "3")).toBe("66.66");
    expect(percentOf("12.5", "100")).toBe("12.5");
  });

  it("never rounds up to 100% before the goal is reached", () => {
    expect(percentOf("99.9999999", "100")).toBe("99.99");
  });

  it("has 7-decimal precision", () => {
    expect(percentOf("0.0000001", "0.0000002")).toBe("50");
    expect(percentOf("0.0000001", "0.0000001")).toBe("100");
    expect(percentOf("0.1", "0.3")).toBe("33.33");
  });

  it("handles very large amounts exactly", () => {
    const big = "92233720368547758.0000001";
    expect(percentOf(big, big)).toBe("100");
    expect(percentOf("46116860184273879", "92233720368547758")).toBe("50");
  });

  it("throws on a zero goal instead of dividing by zero", () => {
    expect(() => percentOf("1", "0")).toThrow(/greater than zero/);
    expect(() => percentOf("1", "0.0000000")).toThrow(InvalidAmountError);
  });

  it("throws on invalid input", () => {
    expect(() => percentOf("x", "100")).toThrow(InvalidAmountError);
    expect(() => percentOf("1", "-5")).toThrow(InvalidAmountError);
    expect(() => percentOf("1", "1.12345678")).toThrow(InvalidAmountError);
  });
});

describe("barPercentOf", () => {
  it("caps at 100", () => {
    expect(barPercentOf("130", "100")).toBe("100");
    expect(barPercentOf("50", "100")).toBe("50");
  });
});

describe("groupAmount", () => {
  it("adds thousands separators to the whole part only", () => {
    expect(groupAmount("1234567.1234567")).toBe("1,234,567.1234567");
    expect(groupAmount("999")).toBe("999");
  });
});
