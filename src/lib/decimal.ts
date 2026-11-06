// Exact decimal helpers for Stellar amounts: up to 7 decimal places, handled as
// strings and as BigInt counts of 10^-7 units. No floating-point arithmetic is
// used for amounts anywhere in this file.

const DECIMALS = 7;
// BigInt() calls rather than `1n` literals: tsconfig targets below ES2020.
const ZERO = BigInt(0);
const HUNDRED = BigInt(100);
const TEN_THOUSAND = BigInt(10000);
const SCALE = BigInt(10) ** BigInt(DECIMALS);
const AMOUNT_PATTERN = /^\d+(\.\d{1,7})?$/;

export class InvalidAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAmountError";
  }
}

/**
 * Parses a non-negative decimal string with at most 7 decimals into BigInt
 * units of 10^-7. Rejects anything else (signs, exponents, spaces, "1.",
 * ".5", more than 7 decimals) with an {@link InvalidAmountError}.
 */
export function toUnits(value: string, name = "amount"): bigint {
  if (typeof value !== "string" || !AMOUNT_PATTERN.test(value)) {
    throw new InvalidAmountError(
      `${name} must be a non-negative decimal string with at most ${DECIMALS} decimal places.`,
    );
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(DECIMALS, "0"));
}

/** Formats a count of hundredths (e.g. 13000n) as "130", "33.33" or "0.5". */
function formatHundredths(hundredths: bigint): string {
  const whole = hundredths / HUNDRED;
  const fraction = (hundredths % HUNDRED).toString().padStart(2, "0");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed === "" ? whole.toString() : `${whole}.${trimmed}`;
}

/**
 * `raised` as a percentage of `goal`, as a string with at most 2 decimals and
 * no trailing zeros ("0", "50", "33.33", "130"). The value is truncated, not
 * rounded, so it only reads "100" once the goal is actually reached. It is not
 * capped: 130% of the goal is "130".
 *
 * @throws {InvalidAmountError} for invalid input or a goal of zero.
 */
export function percentOf(raised: string, goal: string): string {
  const raisedUnits = toUnits(raised, "raised");
  const goalUnits = toUnits(goal, "goal");
  if (goalUnits === ZERO) {
    throw new InvalidAmountError("goal must be greater than zero.");
  }
  return formatHundredths((raisedUnits * TEN_THOUSAND) / goalUnits);
}

/** The percentage limited to 100, for filling a progress bar. */
export function barPercentOf(raised: string, goal: string): string {
  const raisedUnits = toUnits(raised, "raised");
  const goalUnits = toUnits(goal, "goal");
  if (goalUnits === ZERO) {
    throw new InvalidAmountError("goal must be greater than zero.");
  }
  const hundredths = (raisedUnits * TEN_THOUSAND) / goalUnits;
  return formatHundredths(
    hundredths > TEN_THOUSAND ? TEN_THOUSAND : hundredths,
  );
}

/** Adds thousands separators to the whole part of a validated decimal string. */
export function groupAmount(value: string): string {
  const [whole, fraction] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}
