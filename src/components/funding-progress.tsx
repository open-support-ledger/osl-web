import {
  InvalidAmountError,
  barPercentOf,
  groupAmount,
  percentOf,
  toUnits,
} from "@/lib/decimal";

export type FundingProgressProps = {
  /** Decimal string with up to 7 decimals, for example "1250.5". */
  raised: string;
  /** Decimal string, or `null` when the project has no goal. */
  goal: string | null;
  /** Asset code shown next to amounts, for example "USDC". */
  assetCode: string;
};

export function FundingProgress({
  raised,
  goal,
  assetCode,
}: FundingProgressProps) {
  let view: { percent: string; bar: string } | null = null;

  try {
    // Validate every input up front so we never show half-correct data.
    toUnits(raised, "raised");
    if (goal !== null) {
      view = {
        percent: percentOf(raised, goal),
        bar: barPercentOf(raised, goal),
      };
    }
  } catch (error) {
    if (!(error instanceof InvalidAmountError)) throw error;
    return (
      <div
        role="alert"
        className="w-full max-w-xl rounded-lg border border-red-400 p-4 text-sm"
      >
        Funding progress is unavailable: {error.message}
      </div>
    );
  }

  const raisedText = `${groupAmount(raised)} ${assetCode}`;

  if (view === null || goal === null) {
    return (
      <section
        aria-label="Funding progress"
        className="w-full max-w-xl rounded-lg border border-zinc-300 p-4 dark:border-zinc-700"
      >
        <p className="text-2xl font-semibold">{raisedText}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">raised</p>
      </section>
    );
  }

  const goalText = `${groupAmount(goal)} ${assetCode}`;
  const reached = toUnits(raised) >= toUnits(goal);

  return (
    <section
      aria-label="Funding progress"
      className="w-full max-w-xl rounded-lg border border-zinc-300 p-4 dark:border-zinc-700"
    >
      <p className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="text-2xl font-semibold">{raisedText}</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          raised of {goalText} goal
        </span>
      </p>
      <div
        role="progressbar"
        aria-label="Funding progress toward goal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(view.bar)}
        aria-valuetext={`${view.percent}% of the ${goalText} goal`}
        className="mt-3 h-3 w-full overflow-hidden rounded-full border border-zinc-500 bg-zinc-100 dark:bg-zinc-900"
      >
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100"
          style={{ width: `${view.bar}%` }}
        />
      </div>
      {/* The percentage is also text, so progress is not conveyed by colour alone. */}
      <p className="mt-2 text-sm font-medium">
        {view.percent}%{reached ? " (goal reached)" : ""}
      </p>
    </section>
  );
}
