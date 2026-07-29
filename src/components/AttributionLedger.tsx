import React, { useMemo, useState } from 'react';
import { buildLedger, usd, compact, pct, type LedgerRow } from '@/lib/ledger';
import { useCountUp } from '@/hooks/useCountUp';

/** Mono figure that animates to its value. Tabular, so columns never reflow. */
const Num: React.FC<{
  value: number;
  format: (n: number) => string;
  className?: string;
}> = ({ value, format, className = '' }) => {
  const shown = useCountUp(value);
  return <span className={`num ${className}`}>{format(shown)}</span>;
};

const Control: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  render: (n: number) => string;
}> = ({ label, value, min, max, step, onChange, render }) => (
  <div className="flex-1 min-w-[200px]">
    <div className="flex items-baseline justify-between mb-2">
      <label htmlFor={label} className="row-label">{label}</label>
      <span className="num text-lg font-medium text-foreground">{render(value)}</span>
    </div>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-[2px] bg-border appearance-none cursor-pointer accent-[hsl(var(--accent))]
                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3
                 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-accent
                 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                 [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0"
    />
  </div>
);

const Row: React.FC<{ row: LedgerRow; index: number }> = ({ row, index }) => (
  <tr
    className="rule animate-appear group"
    style={{ animationDelay: `${300 + index * 60}ms` }}
  >
    <td className="py-3 pr-4 align-top">
      <span className={row.bought ? 'text-foreground' : 'text-muted-foreground'}>
        {row.role}
      </span>
      <span className="num block text-[11px] text-muted-foreground mt-0.5">
        {row.platform} · {compact(row.audience)}
      </span>
    </td>
    <td className="col-num py-3 px-3 text-muted-foreground tabular-nums">
      {compact(row.medianViews)}
    </td>
    <td className="col-num py-3 px-3 text-muted-foreground hidden sm:table-cell">
      {pct(row.ctr, 1)}
    </td>
    <td className="col-num py-3 px-3">{usd(row.feeCents)}</td>
    <td className="col-num py-3 px-3 hidden md:table-cell text-muted-foreground">
      {compact(row.clicks)}
    </td>
    <td className="col-num py-3 px-3">{row.signups}</td>
    <td
      className={`col-num py-3 pl-3 font-medium ${
        row.bought ? 'text-positive' : 'text-muted-foreground'
      }`}
    >
      {usd(row.cpaCents)}
    </td>
    {/* Status reads in ink vs faded, not in accent. Nine rows of rose put ten
        accent marks in the hero viewport against a budget of three (register
        rule 6); the bought/passed split is already carried by the row's ink
        value and by the positive CPA column, which rule 7 allows. */}
    <td className="py-3 pl-3 w-[76px]">
      <span
        className={`num text-[10px] uppercase tracking-[0.12em] ${
          row.bought ? 'text-foreground' : 'text-muted-foreground/60'
        }`}
      >
        {row.bought ? 'Bought' : 'Passed'}
      </span>
    </td>
  </tr>
);

export const AttributionLedger: React.FC = () => {
  const [budget, setBudget] = useState(1_200_000);   // $12,000
  const [targetCpa, setTargetCpa] = useState(4_000); // $40

  const { rows, totals } = useMemo(
    () => buildLedger(budget, targetCpa),
    [budget, targetCpa],
  );

  const underTarget = totals.blendedCpaCents > 0 && totals.blendedCpaCents <= targetCpa;

  // Keep the totals bar above the fold — it's the payoff the controls drive.
  // Always show everything bought, plus a couple of near-misses for contrast.
  const MAX_ROWS = 9;
  const visible = rows.slice(0, Math.max(MAX_ROWS, totals.bought + 2));
  const hidden = rows.length - visible.length;

  return (
    <div className="border border-border bg-background">
      {/* Provenance, at the HEAD of the frame.
          There is an identical label on the totals bar at the foot, and that one
          alone was not enough: the ledger is taller than every viewport we
          support, so at 1440x900 fifty-six illustrative figures render on screen
          at rest with the foot label 136px below the fold, and at 768 the gap is
          400px. A disclaimer that cannot be on screen at the same time as the
          numbers it qualifies is not doing its job — and this label is the only
          thing making an illustrative ledger lawful to show (DMCC).
          A caption at the head is also just where a document puts one. */}
      <p className="row-label !text-foreground px-5 md:px-6 py-2.5 border-b border-border">
        Example campaign · illustrative figures · not client results
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-8 p-5 md:p-6 border-b border-border">
        <Control
          label="Creator budget"
          value={budget}
          min={250_000}
          max={4_000_000}
          step={25_000}
          onChange={setBudget}
          render={(n) => usd(n)}
        />
        <Control
          label="Target CPA"
          value={targetCpa}
          min={1_000}
          max={12_000}
          step={500}
          onChange={setTargetCpa}
          render={(n) => usd(n)}
        />
      </div>

      {/* Ledger */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-border">
              <th className="row-label text-left font-normal py-2.5 pr-4">Placement</th>
              <th className="row-label text-right font-normal py-2.5 px-3">Views</th>
              <th className="row-label text-right font-normal py-2.5 px-3 hidden sm:table-cell">CTR</th>
              <th className="row-label text-right font-normal py-2.5 px-3">Fee</th>
              <th className="row-label text-right font-normal py-2.5 px-3 hidden md:table-cell">Clicks</th>
              <th className="row-label text-right font-normal py-2.5 px-3">Signups</th>
              <th className="row-label text-right font-normal py-2.5 pl-3">CPA</th>
              <th className="py-2.5 pl-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <Row key={row.role} row={row} index={i} />
            ))}
            {hidden > 0 && (
              <tr className="rule">
                <td colSpan={8} className="row-label py-2.5">
                  + {hidden} more evaluated · CPA above target
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-border bg-secondary/60 px-5 md:px-6 py-4">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <div className="row-label mb-1">Allocated</div>
            <Num value={totals.spendCents} format={(n) => usd(n)} className="text-xl font-medium" />
            <span className="num text-[11px] text-muted-foreground ml-1.5">
              of {usd(totals.budgetCents)}
            </span>
          </div>
          <div>
            <div className="row-label mb-1">Placements</div>
            <Num value={totals.bought} format={(n) => `${Math.round(n)}`} className="text-xl font-medium" />
            <span className="num text-[11px] text-muted-foreground ml-1.5">
              of {totals.considered}
            </span>
          </div>
          <div>
            <div className="row-label mb-1">Signups</div>
            <Num value={totals.signups} format={(n) => `${Math.round(n)}`} className="text-xl font-medium" />
          </div>
          <div>
            <div className="row-label mb-1">Blended CPA</div>
            <Num
              value={totals.blendedCpaCents}
              format={(n) => usd(n)}
              className={`text-xl font-medium ${underTarget ? 'text-positive' : 'text-negative'}`}
            />
          </div>
        </div>

        {/* Provenance. Non-negotiable — these are not client results.
            Ink at the row-label's own 11px, not 10px muted: muted grey
            (#737373) on paper (#FAF8F1) is 4.46:1, under the 4.5:1 floor for
            text this size. This label is the only thing making an illustrative
            ledger lawful to show, so it has to be readable. */}
        <p className="row-label mt-4 pt-3 border-t border-border/70 !text-foreground">
          Example campaign · illustrative figures · not client results
        </p>
      </div>
    </div>
  );
};
