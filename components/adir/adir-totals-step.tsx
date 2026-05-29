import { AdirTotalRow } from "./adir-total-row";
import type { AdirTotals } from "@/lib/adir-scoring";

type AdirTotalsStepProps = {
  totals: AdirTotals;
  onTotalChange: (key: "totalBNoVerbal" | "totalD", value: number | null) => void;
};

export function AdirTotalsStep({ totals, onTotalChange }: AdirTotalsStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium text-on-surface">Totales</h3>
      <div className="space-y-2">
        <AdirTotalRow
          id="adir-total-a"
          label="Total A"
          value={totals.totalA}
          computed
        />
        <AdirTotalRow
          id="adir-total-b-verbal"
          label="Total B verbal"
          value={totals.totalBVerbal}
          computed
        />
        <AdirTotalRow
          id="adir-total-b-no-verbal"
          label="Total B no verbal"
          value={totals.totalBNoVerbal}
          optional
          onChange={(value) => onTotalChange("totalBNoVerbal", value)}
        />
        <AdirTotalRow
          id="adir-total-c"
          label="Total C"
          value={totals.totalC}
          computed
        />
        <AdirTotalRow
          id="adir-total-d"
          label="Total D"
          value={totals.totalD}
          onChange={(value) => onTotalChange("totalD", value)}
        />
      </div>
    </div>
  );
}
